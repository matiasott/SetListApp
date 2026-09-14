import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, X, Play, Pause, Plus, Check, Music, Sparkles, Disc, 
  Clock, AlertCircle, Loader2, PlusCircle, Disc3, Filter,
  ArrowDownAZ, SlidersHorizontal, CheckCheck
} from 'lucide-react';
import { SongItem } from '../types';
import { searchSongs, formatDuration } from '../services/musicSearch';

interface SongSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSong: (song: SongItem) => void;
  existingSongTitles: string[];
}

const POPULAR_ARTISTS = [
  'Soda Stereo',
  'Queen',
  'The Beatles',
  'Divididos',
  'Charly García',
  'Coldplay',
  'Metallica',
  'Fito Páez',
  'Red Hot Chili Peppers',
  'Oasis',
];

export const SongSearchDrawer: React.FC<SongSearchDrawerProps> = ({
  isOpen,
  onClose,
  onAddSong,
  existingSongTitles,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SongItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // In-results quick filter state
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'album' | 'duration'>('default');

  // Audio preview state
  const [playingPreviewUrl, setPlayingPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Manual song addition form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualArtist, setManualArtist] = useState('');
  const [manualDurationMins, setManualDurationMins] = useState('3');
  const [manualDurationSecs, setManualDurationSecs] = useState('30');
  const [manualKey, setManualKey] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  // Added song feedback animation tracker
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Stop audio on drawer close
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setPlayingPreviewUrl(null);
    }
  }, [isOpen]);

  const handleSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setFilterQuery('');
    setSelectedAlbum('all');

    try {
      const items = await searchSongs(trimmed);
      setResults(items);
    } catch (err: any) {
      setError('No se pudo conectar con el catálogo de música. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique albums from results for quick filtering
  const albumsList = useMemo(() => {
    const map = new Map<string, number>();
    results.forEach((song) => {
      if (song.album) {
        map.set(song.album, (map.get(song.album) || 0) + 1);
      }
    });
    // Sort albums by count of tracks descending
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [results]);

  // Compute filtered & sorted results
  const filteredResults = useMemo(() => {
    let list = [...results];

    // Filter by text query in title or album
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      list = list.filter((s) => 
        s.title.toLowerCase().includes(q) || 
        (s.album && s.album.toLowerCase().includes(q)) ||
        s.artist.toLowerCase().includes(q)
      );
    }

    // Filter by album
    if (selectedAlbum !== 'all') {
      list = list.filter((s) => s.album === selectedAlbum);
    }

    // Sort
    if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'album') {
      list.sort((a, b) => (a.album || '').localeCompare(b.album || ''));
    } else if (sortBy === 'duration') {
      list.sort((a, b) => (b.durationSec || 0) - (a.durationSec || 0));
    }

    return list;
  }, [results, filterQuery, selectedAlbum, sortBy]);

  const handleToggleAudio = (url?: string) => {
    if (!url) return;

    if (playingPreviewUrl === url) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingPreviewUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audio.volume = 0.7;
      audio.play().catch((e) => console.warn('Audio play prevented:', e));
      audio.onended = () => setPlayingPreviewUrl(null);
      audioRef.current = audio;
      setPlayingPreviewUrl(url);
    }
  };

  const handleAdd = (song: SongItem) => {
    onAddSong({
      ...song,
      id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    });
    setAddedIds((prev) => ({ ...prev, [song.title.toLowerCase()]: true }));
  };

  const handleCreateManualSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const mins = parseInt(manualDurationMins, 10) || 3;
    const secs = parseInt(manualDurationSecs, 10) || 0;
    const totalSecs = mins * 60 + secs;

    const customSong: SongItem = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: manualTitle.trim(),
      artist: manualArtist.trim() || 'Canción Propia / Original',
      durationSec: totalSecs,
      keyNote: manualKey.trim() || undefined,
      tuning: 'Estándar (E)',
      notes: manualNotes.trim() || undefined,
    };

    onAddSong(customSong);
    setManualTitle('');
    setManualArtist('');
    setManualKey('');
    setManualNotes('');
    setShowManualForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-end bg-stone-950/70 backdrop-blur-xs transition-all">
      <div className="w-full max-w-2xl h-full bg-[#fcfbf9] dark:bg-[#181614] shadow-2xl flex flex-col border-l border-stone-200 dark:border-[#2e2a25] transition-colors animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200/90 dark:border-[#2b2722] flex items-center justify-between bg-white dark:bg-[#1d1a17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                Buscador de Canciones
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Catálogo global por artista, banda o tema musical
              </p>
            </div>
          </div>

          <button
            id="close-search-drawer-btn"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#28241f] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-stone-200/70 dark:border-[#26221d] space-y-3.5 bg-white/70 dark:bg-[#181614]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="relative flex items-center"
          >
            <Search className="w-4 h-4 absolute left-4 text-stone-400 pointer-events-none" />
            <input
              id="music-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar artista, banda o tema (ej. Soda Stereo, Queen, Spinetta)..."
              className="w-full pl-11 pr-24 py-3 text-xs sm:text-sm bg-stone-100/80 dark:bg-[#221f1b] text-stone-900 dark:text-stone-100 rounded-2xl border border-stone-300/80 dark:border-stone-700/80 focus:border-amber-500 focus:outline-none transition-all placeholder:text-stone-400"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-20 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              id="submit-music-search-btn"
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-1.5 px-4 py-2 text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-98"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
            </button>
          </form>

          {/* Quick artists tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 shrink-0 mr-1">
              Populares:
            </span>
            {POPULAR_ARTISTS.map((artist) => (
              <button
                key={artist}
                onClick={() => {
                  setQuery(artist);
                  handleSearch(artist);
                }}
                className="px-3 py-1 rounded-full text-xs font-medium bg-stone-100 dark:bg-[#25221d] hover:bg-amber-100 dark:hover:bg-[#342b20] text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-300 border border-stone-200/80 dark:border-stone-800 transition-colors shrink-0"
              >
                {artist}
              </button>
            ))}
          </div>

          {/* Manual song toggle button */}
          <div className="flex items-center justify-between pt-1">
            <button
              id="toggle-manual-song-btn"
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-600 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showManualForm ? 'Ocultar formulario manual' : '+ ¿Canción propia o tema no encontrado? Añadir manualmente'}</span>
            </button>
          </div>

          {/* Manual Song Form */}
          {showManualForm && (
            <form 
              onSubmit={handleCreateManualSong}
              className="bg-amber-50/80 dark:bg-[#201d19] p-4 sm:p-5 rounded-2xl border border-amber-300/80 dark:border-[#3f3526] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 dark:text-amber-300 uppercase tracking-wider">
                  Añadir Canción Personalizada
                </span>
                <span className="text-[10px] text-amber-800/80 dark:text-amber-400">
                  Ideal para temas propios o solos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-0.5">
                    Título de la canción *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Ej. Tema Inédito #1"
                    className="w-full text-xs font-bold bg-white dark:bg-[#151412] p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-0.5">
                    Artista o compositor
                  </label>
                  <input
                    type="text"
                    value={manualArtist}
                    onChange={(e) => setManualArtist(e.target.value)}
                    placeholder="Ej. Mi Banda"
                    className="w-full text-xs font-bold bg-white dark:bg-[#151412] p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-0.5">
                    Minutos
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={manualDurationMins}
                    onChange={(e) => setManualDurationMins(e.target.value)}
                    className="w-full text-xs font-mono-stage bg-white dark:bg-[#151412] p-2 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-0.5">
                    Segundos
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={manualDurationSecs}
                    onChange={(e) => setManualDurationSecs(e.target.value)}
                    className="w-full text-xs font-mono-stage bg-white dark:bg-[#151412] p-2 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-0.5">
                    Tono (opcional)
                  </label>
                  <input
                    type="text"
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                    placeholder="Ej. Am, G"
                    className="w-full text-xs font-mono-stage bg-white dark:bg-[#151412] p-2 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-0.5">
                  Notas de escenario (opcional)
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Ej. Empezar con guitarra acústica, corte seco al final"
                  className="w-full text-xs bg-white dark:bg-[#151412] p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  id="add-manual-song-btn"
                  type="submit"
                  disabled={!manualTitle.trim()}
                  className="px-4 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl shadow-xs disabled:opacity-50"
                >
                  Guardar y Agregar
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Quick Filter Bar across results */}
        {!isLoading && results.length > 0 && (
          <div className="p-3.5 sm:px-6 bg-amber-50/60 dark:bg-[#1e1a16] border-b border-stone-200/90 dark:border-[#2b2722] space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={`Filtrar en las ${results.length} canciones (ej. Mariposa, Amor, Circo)...`}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 rounded-xl border border-stone-300/80 dark:border-stone-700 focus:border-amber-500 focus:outline-none placeholder:text-stone-400"
                />
                {filterQuery && (
                  <button
                    type="button"
                    onClick={() => setFilterQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1 shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs bg-white dark:bg-[#151412] text-stone-700 dark:text-stone-300 py-1.5 px-2.5 rounded-xl border border-stone-300/80 dark:border-stone-700 focus:border-amber-500 focus:outline-none font-medium"
                >
                  <option value="default">Orden original</option>
                  <option value="title">Título (A-Z)</option>
                  <option value="album">Por Disco</option>
                  <option value="duration">Por Duración</option>
                </select>
              </div>
            </div>

            {/* Albums Filter Pills if albums exist */}
            {albumsList.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 shrink-0 mr-1">
                  Disco:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAlbum('all')}
                  className={`px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                    selectedAlbum === 'all'
                      ? 'bg-amber-500 text-stone-950 shadow-2xs'
                      : 'bg-white dark:bg-[#151412] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Todos ({results.length})
                </button>
                {albumsList.slice(0, 10).map(({ name, count }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedAlbum(name === selectedAlbum ? 'all' : name)}
                    className={`px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                      selectedAlbum === name
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-2xs'
                        : 'bg-white dark:bg-[#151412] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {name} <span className="opacity-60 text-[10px]">({count})</span>
                  </button>
                ))}
              </div>
            )}

            {/* Counter and active filters summary */}
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
              <span>
                Mostrando <strong>{filteredResults.length}</strong> de {results.length} canciones
              </span>
              {(filterQuery || selectedAlbum !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterQuery('');
                    setSelectedAlbum('all');
                  }}
                  className="text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                >
                  Restablecer filtro
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {isLoading && (
            <div className="py-14 flex flex-col items-center justify-center text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
              <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                Buscando canciones en el catálogo musical...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-center gap-3 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!isLoading && hasSearched && results.length === 0 && (
            <div className="py-14 text-center text-stone-400">
              <Music className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
              <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                No se encontraron canciones para "{query}"
              </p>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                Prueba buscando por nombre del artista o banda, o utiliza la opción de añadir tema manual arriba.
              </p>
            </div>
          )}

          {!isLoading && results.length > 0 && filteredResults.length === 0 && (
            <div className="py-12 text-center text-stone-400">
              <Filter className="w-8 h-8 mx-auto text-amber-500/70 mb-2" />
              <p className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
                No hay canciones que coincidan con el filtro actual
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilterQuery('');
                  setSelectedAlbum('all');
                }}
                className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400 underline"
              >
                Limpiar filtro y mostrar las {results.length} canciones
              </button>
            </div>
          )}

          {!isLoading && !hasSearched && (
            <div className="py-14 text-center text-stone-400">
              <Disc3 className="w-12 h-12 mx-auto text-amber-500/50 animate-[spin_10s_linear_infinite] mb-3" />
              <h3 className="font-display font-extrabold text-base text-stone-800 dark:text-stone-200">
                Explora canciones para tu concierto
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 leading-relaxed">
                Escribe una banda ("Soda Stereo", "Queen", "Divididos") o el título de un tema para añadirlo directamente al setlist.
              </p>
            </div>
          )}

          {!isLoading && filteredResults.map((song) => {
            const isAlreadyAdded = existingSongTitles.includes(song.title.toLowerCase()) || addedIds[song.title.toLowerCase()];
            const isPlaying = playingPreviewUrl === song.previewUrl;

            return (
              <div
                key={song.id}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#1d1a17] hover:bg-amber-50/50 dark:hover:bg-[#231f1a] border border-stone-200/80 dark:border-[#2e2a25] hover:border-amber-400/80 dark:hover:border-amber-500/50 transition-all shadow-xs"
              >
                {/* Artwork & Details */}
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 shadow-xs border border-stone-200/50 dark:border-stone-700/50">
                    {song.artworkUrl ? (
                      <img
                        src={song.artworkUrl}
                        alt={song.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <Music className="w-5 h-5" />
                      </div>
                    )}

                    {/* Play 30s preview button overlay */}
                    {song.previewUrl && (
                      <button
                        onClick={() => handleToggleAudio(song.previewUrl)}
                        className={`absolute inset-0 flex items-center justify-center transition-all ${
                          isPlaying 
                            ? 'bg-amber-500 text-stone-950 font-black' 
                            : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:scale-105'
                        }`}
                        title={isPlaying ? 'Pausar muestra' : 'Escuchar muestra de audio'}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                      </button>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-display font-extrabold text-sm text-stone-900 dark:text-stone-100 truncate">
                      {song.title}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                      {song.artist} {song.album && `• ${song.album}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                      <span className="flex items-center gap-1 font-mono-stage">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {formatDuration(song.durationSec)}
                      </span>
                      {song.previewUrl && (
                        <span className="text-amber-700 dark:text-amber-400 text-[10px] font-bold bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.2 rounded-md">
                          Preview
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add to Setlist button */}
                <div className="shrink-0 flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdd(song)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isAlreadyAdded
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-xs active:scale-95'
                    }`}
                  >
                    {isAlreadyAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="hidden sm:inline">Añadido</span>
                        <Plus className="w-3 h-3 sm:hidden" />
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Agregar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200/90 dark:border-[#2b2722] bg-white dark:bg-[#1d1a17] flex items-center justify-between text-xs text-stone-500">
          <span className="font-mono-stage font-medium">
            {results.length > 0 ? (
              <>
                Mostrando <strong className="text-stone-800 dark:text-stone-200">{filteredResults.length}</strong> de {results.length} temas
              </>
            ) : (
              'Búsqueda de catálogo'
            )}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-[#28241f] text-stone-700 dark:text-stone-300 font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700"
          >
            Listo / Volver
          </button>
        </div>

      </div>
    </div>
  );
};
