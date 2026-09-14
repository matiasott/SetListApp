import { SongItem } from '../types';

export interface iTunesSearchResult {
  wrapperType?: string;
  kind?: string;
  artistId?: number;
  collectionId?: number;
  trackId: number;
  artistName: string;
  collectionName?: string;
  trackName: string;
  previewUrl?: string;
  artworkUrl100?: string;
  trackTimeMillis?: number;
  primaryGenreName?: string;
}

export async function searchSongs(query: string): Promise<SongItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const encoded = encodeURIComponent(trimmed);
    
    // 1. General search with max iTunes limit (200)
    const generalUrl = `https://itunes.apple.com/search?term=${encoded}&entity=song&limit=200`;
    
    // 2. Specific artistTerm search with max limit (200) to find all songs by this artist
    const artistTermUrl = `https://itunes.apple.com/search?term=${encoded}&attribute=artistTerm&entity=song&limit=200`;

    // Fetch both in parallel
    const [genRes, artRes] = await Promise.allSettled([
      fetch(generalUrl, { headers: { 'Accept': 'application/json' } }),
      fetch(artistTermUrl, { headers: { 'Accept': 'application/json' } }),
    ]);

    const rawResults: iTunesSearchResult[] = [];

    if (genRes.status === 'fulfilled' && genRes.value.ok) {
      const data = await genRes.value.json();
      if (Array.isArray(data.results)) {
        rawResults.push(...data.results);
      }
    }

    if (artRes.status === 'fulfilled' && artRes.value.ok) {
      const data = await artRes.value.json();
      if (Array.isArray(data.results)) {
        rawResults.push(...data.results);
      }
    }

    // 3. If an artistId is detected, also fetch artist catalog lookup
    const firstWithArtistId = rawResults.find((r) => r.artistId);
    if (firstWithArtistId?.artistId) {
      try {
        const lookupUrl = `https://itunes.apple.com/lookup?id=${firstWithArtistId.artistId}&entity=song&limit=200`;
        const lookupRes = await fetch(lookupUrl, { headers: { 'Accept': 'application/json' } });
        if (lookupRes.ok) {
          const lData = await lookupRes.json();
          if (Array.isArray(lData.results)) {
            // Filter out the artist wrapper object
            const songsOnly = lData.results.filter((r: any) => r.wrapperType === 'track');
            rawResults.push(...songsOnly);
          }
        }
      } catch (err) {
        console.warn('Artist lookup fallback error:', err);
      }
    }

    // Deduplicate by trackId or normalized title + artist
    const seen = new Set<string>();
    const songItems: SongItem[] = [];

    // Helper to calculate official studio album priority
    // 0: Pure studio album track (no live/remix/tribute/demo flags)
    // 1: Remastered studio album track
    // 2: Live / en vivo concert versions
    // 3: Demos, remixes, tributes, acoustic variants, karaoke
    function getAlbumPriority(title: string, album: string): number {
      const lowerTitle = title.toLowerCase();
      const lowerAlbum = album.toLowerCase();
      const combined = `${lowerTitle} ${lowerAlbum}`;

      // Live / Directo
      const isLive = combined.includes('live') || 
                     combined.includes('en vivo') || 
                     combined.includes('directo') || 
                     combined.includes('unplugged') ||
                     combined.includes('en el teatro') ||
                     combined.includes('en concierto') ||
                     combined.includes('estadio');

      // Remix / Demo / Karaoke / Tribute
      const isAltOrTribute = combined.includes('remix') || 
                             combined.includes('karaoke') || 
                             combined.includes('tribute') || 
                             combined.includes('tributo') || 
                             combined.includes('cover') ||
                             combined.includes('demo') ||
                             combined.includes('instrumental') ||
                             combined.includes('versión acústica') ||
                             combined.includes('acoustic version');

      // Remastered official releases
      const isRemaster = combined.includes('remaster') || combined.includes('deluxe');

      if (isAltOrTribute) return 3;
      if (isLive) return 2;
      if (isRemaster) return 1;
      return 0; // Pure official studio album track
    }

    for (const item of rawResults) {
      if (!item.trackName || !item.artistName) continue;

      const trackKey = item.trackId ? `id-${item.trackId}` : `${item.trackName.toLowerCase()}|${item.artistName.toLowerCase()}`;
      if (seen.has(trackKey)) continue;
      seen.add(trackKey);

      songItems.push({
        id: `track-${item.trackId || Math.random().toString(36).substring(2, 9)}`,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName || '',
        durationSec: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 180,
        previewUrl: item.previewUrl,
        artworkUrl: item.artworkUrl100?.replace('100x100bb', '300x300bb') || item.artworkUrl100,
        tuning: 'Estándar (E)',
      });
    }

    // Sort songs: Pure official studio albums FIRST, then Remastered, then Live, then Alt/Remixes
    songItems.sort((a, b) => {
      const pA = getAlbumPriority(a.title, a.album || '');
      const pB = getAlbumPriority(b.title, b.album || '');
      if (pA !== pB) return pA - pB;

      // Secondary: if one has an album and the other doesn't, prefer having album name
      const hasAlbumA = Boolean(a.album && a.album.length > 0);
      const hasAlbumB = Boolean(b.album && b.album.length > 0);
      if (hasAlbumA && !hasAlbumB) return -1;
      if (!hasAlbumA && hasAlbumB) return 1;

      return 0;
    });

    return songItems;
  } catch (err) {
    console.warn('iTunes API search fallback/error:', err);
    throw err;
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTotalDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}
