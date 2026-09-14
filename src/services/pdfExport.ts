import { jsPDF } from 'jspdf';
import { Setlist, SheetPageMode, SongItem } from '../types';
import { formatDuration, formatTotalDuration } from './musicSearch';

export interface PDFExportOptions {
  pageMode?: SheetPageMode;
  fontSize?: 'auto' | 'normal' | 'large' | 'giant';
  columnMode?: 'auto' | 1 | 2;
  showNotes?: boolean;
  showKeys?: boolean;
  showTuning?: boolean;
  showBpm?: boolean;
  showDuration?: boolean;
  showTech?: boolean;
  viewProfile?: 'hybrid' | 'musician' | 'tech';
  selectedMusicianName?: string;
}

interface BlockGroup {
  title: string;
  songs: SongItem[];
}

/**
 * Parse hex string to RGB tuple
 */
function hexToRgb(hex?: string): [number, number, number] {
  if (!hex || typeof hex !== 'string') return [245, 158, 11]; // default amber
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (c.length !== 6) return [245, 158, 11];
  const num = parseInt(c, 16);
  if (isNaN(num)) return [245, 158, 11];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Clean text from emoji and unsupported characters for standard jsPDF Helvetica
 */
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emojis
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols (e.g. ★)
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
    .replace(/[\u{2300}-\u{23FF}]/gu, '') // Technical (e.g. ⏸)
    .replace(/[\u{25A0}-\u{25FF}]/gu, '') // Geometric (e.g. ▶)
    .replace(/\s+/g, ' ')
    .trim();
}

export function exportSetlistToPDF(setlist: Setlist, options: PDFExportOptions = {}): void {
  const {
    pageMode = setlist.pageMode || 'single_page',
    fontSize = 'normal',
    columnMode = 'auto',
    showNotes = true,
    showKeys = true,
    showTuning = true,
    showBpm = true,
    showDuration = true,
    showTech = true,
    viewProfile = 'hybrid',
    selectedMusicianName,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 10;
  const contentWidth = pageWidth - margin * 2; // 190mm

  // Render a standard page header
  const renderHeader = (subtitleExtra?: string, pageNumberText?: string) => {
    let y = margin;

    // Header background banner - Compact & crisp A4 layout
    doc.setFillColor(18, 16, 14); // warm deep stone
    doc.roundedRect(margin, y, contentWidth, 16.5, 2, 2, 'F');

    // Band Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13.5);
    doc.setTextColor(255, 255, 255);
    const band = cleanText(setlist.bandName || 'SETLIST').toUpperCase();
    doc.text(band, margin + 4, y + 7);

    // Setlist Name & Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(214, 211, 209); // stone-300
    const effectiveSubtitleExtra = selectedMusicianName
      ? `LISTA PARA MÚSICO: ${cleanText(selectedMusicianName).toUpperCase()}`
      : (viewProfile === 'tech' ? 'LISTA TÉCNICA DE ESCENARIO & ROADIES' : subtitleExtra);
    const rawSubtitle = effectiveSubtitleExtra ? `${setlist.name || 'Setlist'} — ${effectiveSubtitleExtra}` : (setlist.name || 'Lista de Temas');
    const subtitle = cleanText(rawSubtitle);
    doc.text(subtitle, margin + 4, y + 12.5);

    // Right header stats
    const totalSecs = setlist.songs.reduce((acc, s) => acc + (s.durationSec || 0), 0);
    const totalRegular = setlist.songs.filter((s) => !s.isBreak && !s.isEncore).length;
    const bisesCount = setlist.songs.filter((s) => s.isEncore).length;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(245, 158, 11); // amber-500
    const statsText = `${totalRegular} TEMAS ${bisesCount > 0 ? `+ ${bisesCount} BISES` : ''} • ${formatTotalDuration(totalSecs)}`;
    doc.text(statsText, pageWidth - margin - 4, y + 7, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    const rightPageText = pageNumberText ? `${pageNumberText} • A4` : 'HOJA UNICA A4';
    doc.text(rightPageText, pageWidth - margin - 4, y + 12.5, { align: 'right' });

    y += 18.5;

    // Metadata bar: Venue & Date
    doc.setFillColor(248, 247, 244);
    doc.setDrawColor(220, 215, 205);
    doc.roundedRect(margin, y, contentWidth, 6.5, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(120, 113, 108);
    doc.text('LUGAR:', margin + 3, y + 4.4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(28, 25, 23);
    const venueText = cleanText(setlist.venue || 'No especificado');
    doc.text(venueText, margin + 15, y + 4.4);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 113, 108);
    doc.text('FECHA:', margin + 105, y + 4.4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(28, 25, 23);
    const dateText = cleanText(setlist.concertDate || 'A confirmar');
    doc.text(dateText, margin + 117, y + 4.4);

    y += 8.5;

    // Stage notes if present
    if (setlist.stageNotes && setlist.stageNotes.trim()) {
      const cleanNotes = cleanText(setlist.stageNotes);
      doc.setFillColor(254, 252, 232);
      doc.setDrawColor(253, 224, 71);
      doc.roundedRect(margin, y, contentWidth, 6.5, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(180, 83, 9);
      doc.text('NOTAS / SONIDO:', margin + 3, y + 4.4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(41, 37, 36);

      const maxNoteW = contentWidth - 32;
      let displayNotes = cleanNotes;
      if (doc.getTextWidth(displayNotes) > maxNoteW) {
        while (displayNotes.length > 4 && doc.getTextWidth(displayNotes + '...') > maxNoteW) {
          displayNotes = displayNotes.slice(0, -1);
        }
        displayNotes += '...';
      }
      doc.text(displayNotes, margin + 28, y + 4.4);
      y += 8.5;
    }

    return y;
  };

  // Helper to render a song row inside a specific column box
  const renderSongRow = (
    song: SongItem,
    x: number,
    y: number,
    w: number,
    h: number,
    displayNumber: string,
    isAlternate: boolean
  ) => {
    // Row background
    if (isAlternate) {
      doc.setFillColor(248, 250, 252);
      doc.rect(x, y, w, h, 'F');
    }

    // Divider line at bottom
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(x, y + h, x + w, y + h);

    const isEncore = Boolean(song.isEncore);
    const isBreak = Boolean(song.isBreak);

    // BREAK / PAUSE ROW
    if (isBreak) {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(x + 1, y + 1, w - 2, h - 2, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const breakTitle = cleanText(song.title).toUpperCase() || 'PAUSA / INTERVALO';
      doc.text(`[PAUSA]  ${breakTitle}`, x + 4, y + h / 2 + 1.2);
      if (song.notes && showNotes) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.2);
        doc.text(`(${cleanText(song.notes)})`, x + w - 4, y + h / 2 + 1.2, { align: 'right' });
      }
      return;
    }

    // Number Badge
    const badgeColor = isEncore ? [220, 38, 38] : [24, 28, 36];
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    const circleRadius = 3.2;
    const badgeCenterX = x + 4.5;
    const badgeCenterY = y + h / 2;
    doc.circle(badgeCenterX, badgeCenterY, circleRadius, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isEncore ? 6.5 : 7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(displayNumber, badgeCenterX, badgeCenterY + 1.1, { align: 'center' });

    // Calculate Right Badges width dynamically first so title has maximum horizontal space!
    let rightPos = x + w - 2.5;
    let rightBadgesWidth = 0;

    const capo = song.capoFret || song.techDetails?.capoFret;
    if (capo && capo > 0) {
      rightBadgesWidth += 14;
    }
    if (showDuration && song.durationSec > 0) {
      rightBadgesWidth += 12;
    }
    if (showBpm && song.bpm) {
      rightBadgesWidth += 13;
    }
    if (showTuning && song.tuning && song.tuning !== 'Estándar (E)') {
      rightBadgesWidth += 16;
    }
    if (showKeys && song.keyNote) {
      rightBadgesWidth += 10;
    }

    // Check if subtitle line exists (Tech details OR musical notes)
    const hasTech = Boolean(showTech && (song.techDetails?.primaryInstrument || song.techDetails?.musicianName || song.techDetails?.needsAssistance));
    const hasNotes = Boolean(showNotes && song.notes?.trim());
    const hasSubtitle = (hasTech || hasNotes) && h >= 8.0;

    // Available width for title
    const textStartX = x + 9.5;
    const maxTitleWidth = Math.max(25, w - 10 - rightBadgesWidth);

    // Title positioning
    const titleY = hasSubtitle ? y + Math.max(3.8, h * 0.38) : y + h / 2 + 1.2;

    doc.setFont('helvetica', 'bold');
    const titleFontSize = fontSize === 'giant' ? 11 : fontSize === 'large' ? 10 : (h > 10.5 ? 9.8 : 8.8);
    doc.setFontSize(titleFontSize);
    doc.setTextColor(15, 23, 42);

    let titleStr = cleanText(song.title);
    if (doc.getTextWidth(titleStr) > maxTitleWidth) {
      while (titleStr.length > 4 && doc.getTextWidth(titleStr + '...') > maxTitleWidth) {
        titleStr = titleStr.slice(0, -1);
      }
      titleStr += '...';
    }
    doc.text(titleStr, textStartX, titleY);

    // Optional encore tag
    if (song.isOptionalEncore) {
      const nextX = textStartX + doc.getTextWidth(titleStr) + 2;
      if (nextX + 16 < x + w - rightBadgesWidth) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.2);
        doc.setTextColor(220, 38, 38);
        doc.text('[OPCIONAL]', nextX, titleY);
      }
    }

    // SUBTITLE / TECH DETAILS & NOTES (Line 2)
    if (hasSubtitle) {
      const subY = y + Math.max(7.2, h * 0.78);
      let subStartX = textStartX;

      // If tech instrument is specified, draw colored dot
      if (hasTech && song.techDetails) {
        const [r, g, b] = hexToRgb(song.techDetails.colorHex);
        doc.setFillColor(r, g, b);
        doc.setDrawColor(120, 113, 108);
        doc.setLineWidth(0.15);
        doc.circle(subStartX + 1.1, subY - 0.7, 1.1, 'FD');
        subStartX += 3.2;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.3);
        doc.setTextColor(180, 83, 9); // amber-700

        let techParts: string[] = [];

        // Roadie assistance cue
        if (song.techDetails.needsAssistance) {
          techParts.push(`[ASISTIR ROADIE: ${cleanText(song.techDetails.assistanceReason || 'Cambio')}]`);
        }

        // Musician Name
        if (song.techDetails.musicianName) {
          techParts.push(`[${cleanText(song.techDetails.musicianName)}]`);
        }

        // Instrument & Nickname
        if (song.techDetails.primaryInstrument) {
          let instLabel = cleanText(song.techDetails.primaryInstrument);
          if (song.techDetails.instrumentNickname) {
            instLabel += ` "${cleanText(song.techDetails.instrumentNickname)}"`;
          }
          techParts.push(instLabel);
        }

        if (song.techDetails.backupInstrument) {
          techParts.push(`(Bkp: ${cleanText(song.techDetails.backupInstrument)})`);
        }
        if (song.techDetails.stringGauge) {
          techParts.push(`[${cleanText(song.techDetails.stringGauge.split(' ')[0])}]`);
        }
        if (song.techDetails.techNotes) {
          techParts.push(`- ${cleanText(song.techDetails.techNotes)}`);
        }

        const techString = techParts.join(' ');
        doc.text(techString, subStartX, subY);
        subStartX += doc.getTextWidth(techString) + 2.5;
      }

      // If stage note is also present, append it cleanly!
      if (hasNotes && song.notes) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.4);
        doc.setTextColor(100, 116, 139); // slate-500

        const prefix = hasTech ? '• Nota: ' : 'Nota: ';
        const noteText = prefix + cleanText(song.notes);
        const maxNoteWidth = (x + w - 2) - subStartX;

        if (maxNoteWidth > 15) {
          let fitNote = noteText;
          if (doc.getTextWidth(fitNote) > maxNoteWidth) {
            while (fitNote.length > 4 && doc.getTextWidth(fitNote + '...') > maxNoteWidth) {
              fitNote = fitNote.slice(0, -1);
            }
            fitNote += '...';
          }
          doc.text(fitNote, subStartX, subY);
        }
      }
    }

    // RIGHT BADGES (Capo, Duration, BPM bit, Tuning, Key)
    if (showDuration && song.durationSec > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(100, 116, 139);
      const durStr = formatDuration(song.durationSec);
      doc.text(durStr, rightPos, y + h / 2 + 1.1, { align: 'right' });
      rightPos -= doc.getTextWidth(durStr) + 3.0;
    }

    if (showBpm && song.bpm) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.6);
      doc.setTextColor(14, 116, 144); // cyan-700
      const bpmStr = `${song.bpm} bit`;
      doc.text(bpmStr, rightPos, y + h / 2 + 1.1, { align: 'right' });
      rightPos -= doc.getTextWidth(bpmStr) + 2.5;
    }

    if (capo && capo > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(217, 119, 6); // amber-600
      const capoStr = `CAPO ${capo}`;
      doc.text(capoStr, rightPos, y + h / 2 + 1.1, { align: 'right' });
      rightPos -= doc.getTextWidth(capoStr) + 2.5;
    }

    if (showTuning && song.tuning && song.tuning !== 'Estándar (E)') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.2);
      doc.setTextColor(180, 83, 9); // amber-700
      const tunStr = cleanText(song.tuning);
      const shortTun = tunStr.length > 10 ? tunStr.substring(0, 8) + '..' : tunStr;
      doc.text(shortTun, rightPos, y + h / 2 + 1.1, { align: 'right' });
      rightPos -= doc.getTextWidth(shortTun) + 2.5;
    }

    if (showKeys && song.keyNote) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(126, 34, 206); // purple-700
      const keyStr = cleanText(song.keyNote);
      doc.text(keyStr, rightPos, y + h / 2 + 1.1, { align: 'right' });
    }
  };

  // Render Footer
  const renderFooter = (pageText = '1 de 1') => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 130, 120); // warm stone
    doc.text('SETLIST STUDIO • HOJA OFICIAL DE ESCENARIO (A4)', margin, pageHeight - 5);
    doc.text(`Hoja ${pageText} • Impreso: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  };

  // MODE 1: SINGLE PAGE (ALWAYS 1 PAGE GUARANTEED)
  if (pageMode === 'single_page') {
    const startY = renderHeader('Hoja Única de Escenario', '1 HOJA');
    const availableHeight = pageHeight - startY - 12; // leaving space for footer
    
    // Separate into main songs and encore songs
    const mainSongs: SongItem[] = [];
    const encoreSongs: SongItem[] = [];

    setlist.songs.forEach((s) => {
      if (s.isEncore) {
        encoreSongs.push(s);
      } else {
        mainSongs.push(s);
      }
    });

    const totalRowsCount = mainSongs.length + (encoreSongs.length > 0 ? encoreSongs.length + 1 : 0);

    // Determine 1 or 2 columns based on columnMode or auto
    const useTwoColumns = columnMode === 2 || (columnMode === 'auto' && totalRowsCount > 14);

    if (!useTwoColumns) {
      // 1-COLUMN LAYOUT
      let currentY = startY + 2;
      const rowHeight = Math.min(13, Math.max(9, (availableHeight - 10) / Math.max(totalRowsCount, 1)));
      let trackNum = 1;

      mainSongs.forEach((song, idx) => {
        const numStr = song.isBreak ? '-' : (trackNum++).toString();
        renderSongRow(song, margin, currentY, contentWidth, rowHeight, numStr, idx % 2 === 1);
        currentY += rowHeight;
      });

      if (encoreSongs.length > 0) {
        // Encore Section Banner
        currentY += 2;
        doc.setFillColor(220, 38, 38);
        doc.roundedRect(margin, currentY, contentWidth, 7, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text('BISES / ENCORE FINAL', pageWidth / 2, currentY + 4.8, { align: 'center' });
        currentY += 8.5;

        encoreSongs.forEach((song, eIdx) => {
          renderSongRow(song, margin, currentY, contentWidth, rowHeight, `B${eIdx + 1}`, eIdx % 2 === 1);
          currentY += rowHeight;
        });
      }
    } else {
      // 2-COLUMN LAYOUT (Guarantees fitting up to 36-40 songs on 1 single sheet!)
      const colGap = 8;
      const colWidth = (contentWidth - colGap) / 2;
      const col1X = margin;
      const col2X = margin + colWidth + colGap;

      // Draw subtle vertical column divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(col1X + colWidth + colGap / 2, startY, col1X + colWidth + colGap / 2, pageHeight - 12);

      // Build unified list of items for 2 columns
      interface DisplayItem {
        type: 'song' | 'encore_banner';
        song?: SongItem;
        numStr?: string;
      }

      const items: DisplayItem[] = [];
      let mainNum = 1;
      mainSongs.forEach((s) => {
        items.push({
          type: 'song',
          song: s,
          numStr: s.isBreak ? '-' : (mainNum++).toString(),
        });
      });

      if (encoreSongs.length > 0) {
        items.push({ type: 'encore_banner' });
        encoreSongs.forEach((s, eIdx) => {
          items.push({
            type: 'song',
            song: s,
            numStr: `B${eIdx + 1}`,
          });
        });
      }

      // Split evenly into 2 columns
      const half = Math.ceil(items.length / 2);
      const col1Items = items.slice(0, half);
      const col2Items = items.slice(half);

      const maxPerCol = Math.max(col1Items.length, col2Items.length, 1);
      const rowHeight = Math.min(11, Math.max(7.8, (availableHeight - 6) / maxPerCol));

      // Render Column 1
      let yCol1 = startY + 1;
      col1Items.forEach((item, idx) => {
        if (item.type === 'encore_banner') {
          doc.setFillColor(220, 38, 38);
          doc.roundedRect(col1X, yCol1, colWidth, 6, 1, 1, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(255, 255, 255);
          doc.text('BISES / ENCORE', col1X + colWidth / 2, yCol1 + 4.2, { align: 'center' });
          yCol1 += rowHeight;
        } else if (item.song) {
          renderSongRow(item.song, col1X, yCol1, colWidth, rowHeight, item.numStr || '', idx % 2 === 1);
          yCol1 += rowHeight;
        }
      });

      // Render Column 2
      let yCol2 = startY + 1;
      col2Items.forEach((item, idx) => {
        if (item.type === 'encore_banner') {
          doc.setFillColor(220, 38, 38);
          doc.roundedRect(col2X, yCol2, colWidth, 6, 1, 1, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(255, 255, 255);
          doc.text('BISES / ENCORE', col2X + colWidth / 2, yCol2 + 4.2, { align: 'center' });
          yCol2 += rowHeight;
        } else if (item.song) {
          renderSongRow(item.song, col2X, yCol2, colWidth, rowHeight, item.numStr || '', idx % 2 === 1);
          yCol2 += rowHeight;
        }
      });
    }

    renderFooter('1 de 1');
  } 
  // MODE 2: BY BLOCKS (1 HOJA POR BLOQUE)
  else {
    // Group songs by blocks
    const blocks: BlockGroup[] = [];

    // Check if songs have explicit blockTitles
    const assignedBlockTitles: string[] = [];
    setlist.songs.forEach((s) => {
      const bTitle = s.isEncore ? 'Bises' : (s.blockTitle || 'Bloque 1');
      if (!assignedBlockTitles.includes(bTitle)) {
        assignedBlockTitles.push(bTitle);
      }
    });

    if (assignedBlockTitles.length === 0) {
      assignedBlockTitles.push('Bloque 1');
    }

    assignedBlockTitles.forEach((bTitle) => {
      const songsInBlock = setlist.songs.filter((s) => {
        if (bTitle === 'Bises') return s.isEncore;
        return !s.isEncore && (s.blockTitle === bTitle || (!s.blockTitle && bTitle === 'Bloque 1'));
      });
      if (songsInBlock.length > 0) {
        blocks.push({
          title: bTitle,
          songs: songsInBlock,
        });
      }
    });

    // If no blocks were found, fallback to all songs in 1 block
    if (blocks.length === 0) {
      blocks.push({
        title: 'Repertorio Completo',
        songs: setlist.songs,
      });
    }

    const totalPages = blocks.length;

    blocks.forEach((block, blockIndex) => {
      if (blockIndex > 0) {
        doc.addPage();
      }

      const pageNumberText = `Hoja ${blockIndex + 1} de ${totalPages}`;
      const startY = renderHeader(block.title, pageNumberText);

      // Prominent Block Title Header Banner
      const isEncoreBlock = block.title.toLowerCase().includes('bis') || block.title.toLowerCase().includes('encore');
      const blockBg = isEncoreBlock ? [220, 38, 38] : [30, 41, 59];
      doc.setFillColor(blockBg[0], blockBg[1], blockBg[2]);
      doc.roundedRect(margin, startY + 2, contentWidth, 9.5, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(255, 255, 255);
      const blockTitleClean = cleanText(block.title).toUpperCase();
      doc.text(blockTitleClean, margin + 5, startY + 6.8);

      // Block stats (count & duration)
      const blockSecs = block.songs.reduce((acc, s) => acc + (s.durationSec || 0), 0);
      const regularCount = block.songs.filter((s) => !s.isBreak).length;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(251, 191, 36);
      doc.text(`${regularCount} temas • ${formatTotalDuration(blockSecs)}`, pageWidth - margin - 5, startY + 6.8, { align: 'right' });

      let currentY = startY + 15;
      const availableHeight = pageHeight - currentY - 14;
      const rowHeight = Math.min(13.5, Math.max(9, availableHeight / Math.max(block.songs.length, 1)));

      let trackNum = 1;
      block.songs.forEach((song, sIdx) => {
        const numStr = song.isBreak ? '-' : (isEncoreBlock ? `B${trackNum++}` : (trackNum++).toString());
        renderSongRow(song, margin, currentY, contentWidth, rowHeight, numStr, sIdx % 2 === 1);
        currentY += rowHeight;
      });

      renderFooter(`${blockIndex + 1} de ${totalPages}`);
    });
  }

  // Save the PDF with clear descriptive filename
  const safeBand = cleanText(setlist.bandName || 'banda')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_');
  const safeFilename = cleanText(setlist.name || 'setlist')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_');
  const musicianSuffix = selectedMusicianName
    ? `_musico_${cleanText(selectedMusicianName).toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    : (viewProfile === 'tech' ? '_tecnico_escenario' : '');

  doc.save(`${safeBand}_${safeFilename}${musicianSuffix}_hoja_escenario.pdf`);
}
