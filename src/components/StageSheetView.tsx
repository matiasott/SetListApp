import React, { useState, useMemo } from 'react';
import { 
  FileDown, Printer, ArrowLeft, Type, Columns, Palette, 
  Eye, CheckSquare, Square, Music, Calendar, MapPin, Sparkles, SlidersHorizontal,
  FileText, Layers2, Star, HelpCircle, Disc, Zap, UserCheck, Wrench, Users, Guitar
} from 'lucide-react';
import { Setlist, SheetFontSize, SheetPageMode, SheetTheme, SongItem, BandMusician } from '../types';
import { formatDuration, formatTotalDuration } from '../services/musicSearch';
import { exportSetlistToPDF } from '../services/pdfExport';
import { detectSongChanges, getNormalizedAssignments } from '../services/changeAlerts';

interface StageSheetViewProps {
  setlist: Setlist;
  bandMusicians?: BandMusician[];
  onUpdateSetlist?: (updates: Partial<Setlist>) => void;
  onBackToEditor: () => void;
}

export const StageSheetView: React.FC<StageSheetViewProps> = ({
  setlist,
  bandMusicians = [],
  onUpdateSetlist,
  onBackToEditor,
}) => {
  const pageMode: SheetPageMode = setlist.pageMode || 'single_page';

  const [fontSize, setFontSize] = useState<SheetFontSize>('large');
  const [columnMode, setColumnMode] = useState<'auto' | 1 | 2>('auto');
  const [sheetTheme, setSheetTheme] = useState<SheetTheme>('paper');
  const [viewProfile, setViewProfile] = useState<'hybrid' | 'musician' | 'tech'>('hybrid');
  const [selectedMusician, setSelectedMusician] = useState<string>('all');

  // Display toggles
  const [showNotes, setShowNotes] = useState(true);
  const [showKeys, setShowKeys] = useState(true);
  const [showTuning, setShowTuning] = useState(true);
  const [showBpm, setShowBpm] = useState(true);
  const [showDuration, setShowDuration] = useState(true);
  const [showTech, setShowTech] = useState(true);

  // Extract available unique musicians
  const availableMusicians = useMemo(() => {
    const list: { id?: string; name: string; role?: string }[] = [];
    if (bandMusicians && bandMusicians.length > 0) {
      bandMusicians.forEach(bm => {
        if (!list.some(m => m.name.toLowerCase() === bm.name.toLowerCase())) {
          list.push({ id: bm.id, name: bm.name, role: bm.role });
        }
      });
    }
    setlist.songs.forEach(s => {
      const asgns = getNormalizedAssignments(s);
      asgns.forEach(a => {
        if (a.musicianName && !list.some(m => m.name.toLowerCase() === a.musicianName.toLowerCase())) {
          list.push({ id: a.musicianId, name: a.musicianName });
        }
      });
    });
    return list;
  }, [bandMusicians, setlist.songs]);

  const handleSelectViewProfile = (profile: 'hybrid' | 'musician' | 'tech') => {
    setViewProfile(profile);
    if (profile === 'musician') {
      setShowTech(true);
      setShowNotes(true);
      setShowKeys(true);
      setShowBpm(true);
      setShowTuning(true);
      setFontSize('large');
    } else if (profile === 'tech') {
      setShowTech(true);
      setShowNotes(true);
      setShowKeys(true);
      setShowBpm(true);
      setShowTuning(true);
      setFontSize('normal');
    } else {
      setShowTech(true);
      setShowNotes(true);
      setShowKeys(true);
      setShowBpm(true);
      setShowTuning(true);
      setFontSize('large');
    }
  };

  const totalSeconds = setlist.songs.reduce((acc, s) => acc + (s.durationSec || 0), 0);
  const regularSongsCount = setlist.songs.filter(s => !s.isBreak && !s.isEncore).length;
  const encoreSongsCount = setlist.songs.filter(s => s.isEncore).length;

  const handleTogglePageMode = (newMode: SheetPageMode) => {
    if (onUpdateSetlist) {
      onUpdateSetlist({ pageMode: newMode });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    exportSetlistToPDF(setlist, {
      pageMode,
      fontSize,
      columnMode,
      showNotes,
      showKeys,
      showTuning,
      showBpm,
      showDuration,
      showTech: viewProfile === 'tech' ? true : showTech,
      viewProfile,
      selectedMusicianName: selectedMusician !== 'all' ? selectedMusician : undefined,
    });
  };

  // Font size classes
  const titleClass = {
    normal: 'text-sm sm:text-base font-bold',
    large: 'text-base sm:text-xl font-black',
    giant: 'text-lg sm:text-2xl font-black tracking-tight',
  }[fontSize];

  const numberClass = {
    normal: 'text-xs sm:text-sm w-6 h-6 sm:w-7 sm:h-7',
    large: 'text-sm sm:text-base w-7 h-7 sm:w-9 sm:h-9',
    giant: 'text-base sm:text-lg w-8 h-8 sm:w-11 sm:h-11',
  }[fontSize];

  const badgesClass = {
    normal: 'text-[9px] sm:text-[10px] px-2 py-0.5',
    large: 'text-[10px] sm:text-xs px-2.5 py-0.5',
    giant: 'text-xs sm:text-sm px-3 py-1 font-bold',
  }[fontSize];

  // Resolve 1 or 2 columns based on mode and song count
  const effectiveColumns = columnMode === 'auto' 
    ? (pageMode === 'single_page' && setlist.songs.length > 14 ? 2 : 1)
    : columnMode;

  // Single page partitions
  const mainSongs = setlist.songs.filter((s) => !s.isEncore);
  const encoreSongs = setlist.songs.filter((s) => s.isEncore);

  // Blocks partition
  const currentBlocks: string[] = (setlist.blocks && setlist.blocks.length > 0)
    ? setlist.blocks
    : ['Bloque 1: Set Eléctrico', 'Bloque 2: Acústico', 'Bises'];

  return (
    <div className="space-y-6">
      
      {/* Control Bar (Hidden on print) */}
      <div className="no-print bg-white dark:bg-[#191715] p-5 sm:p-6 rounded-3xl border border-stone-200/90 dark:border-[#2d2822] shadow-sm space-y-4">
        
        {/* Top actions: Back, Download PDF, Print */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-[#27231f]">
          <button
            id="sheet-back-to-editor-btn"
            onClick={onBackToEditor}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors border border-stone-300/80 dark:border-stone-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Repertorio</span>
          </button>

          {/* Page Mode Switcher inside Sheet View */}
          <div className="flex bg-stone-100 dark:bg-[#201d19] p-1 rounded-2xl border border-stone-200 dark:border-[#302b24]">
            <button
              id="sheet-mode-single-btn"
              onClick={() => handleTogglePageMode('single_page')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                pageMode === 'single_page'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1 Sola Hoja (Con Bises)</span>
            </button>

            <button
              id="sheet-mode-blocks-btn"
              onClick={() => handleTogglePageMode('by_blocks')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                pageMode === 'by_blocks'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Layers2 className="w-3.5 h-3.5" />
              <span>Por Bloques (1 Hoja x Bloque)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="sheet-print-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300/80 dark:border-stone-700 transition-colors"
              title="Imprimir directamente en tu impresora física o PDF del navegador"
            >
              <Printer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Imprimir Hoja</span>
            </button>

            <button
              id="sheet-download-pdf-btn"
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-sm transition-all active:scale-98"
              title="Descargar archivo PDF listo para compartir con la banda o sonidista"
            >
              <FileDown className="w-4 h-4" />
              <span>Descargar PDF (.pdf)</span>
            </button>
          </div>
        </div>

        {/* Customization Options Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Font Size Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-amber-500" />
              Tamaño de Letra en Escenario
            </label>
            <div className="flex bg-stone-100 dark:bg-[#201d19] p-1 rounded-2xl border border-stone-200 dark:border-[#302b24]">
              {(['normal', 'large', 'giant'] as SheetFontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    fontSize === size
                      ? 'bg-white dark:bg-[#2b2722] text-stone-900 dark:text-stone-100 shadow-sm'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {size === 'normal' ? 'Normal' : size === 'large' ? 'Grande' : 'Gigante'}
                </button>
              ))}
            </div>
          </div>

          {/* Columns Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
              <Columns className="w-3.5 h-3.5 text-amber-500" />
              Distribución de Columnas
            </label>
            <div className="flex bg-stone-100 dark:bg-[#201d19] p-1 rounded-2xl border border-stone-200 dark:border-[#302b24]">
              <button
                onClick={() => setColumnMode('auto')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  columnMode === 'auto'
                    ? 'bg-white dark:bg-[#2b2722] text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                title="Ajusta a 1 o 2 columnas según la cantidad para garantizar 1 hoja"
              >
                Auto ({effectiveColumns} col)
              </button>
              <button
                onClick={() => setColumnMode(1)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  columnMode === 1
                    ? 'bg-white dark:bg-[#2b2722] text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                1 Columna
              </button>
              <button
                onClick={() => setColumnMode(2)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  columnMode === 2
                    ? 'bg-white dark:bg-[#2b2722] text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                2 Columnas
              </button>
            </div>
          </div>

          {/* Theme of Sheet */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              Estilo Visual de la Hoja
            </label>
            <div className="flex bg-stone-100 dark:bg-[#201d19] p-1 rounded-2xl border border-stone-200 dark:border-[#302b24]">
              <button
                onClick={() => setSheetTheme('paper')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  sheetTheme === 'paper'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Papel Blanco (A4)
              </button>
              <button
                onClick={() => setSheetTheme('stage-dark')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  sheetTheme === 'stage-dark'
                    ? 'bg-[#151311] text-amber-400 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Atril Oscuro
              </button>
            </div>
          </div>

          {/* View Profile: Musician vs Tech vs Hybrid */}
          <div className="sm:col-span-2 lg:col-span-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  Tipo de Lista de Escenario:
                </span>
                <span className="text-[11px] text-stone-600 dark:text-stone-400">
                  (Elige lista para músicos, lista técnica de escenario, o híbrida)
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-[#1a1715] p-1 rounded-xl border border-amber-300/80 dark:border-amber-900/50">
                <button
                  type="button"
                  onClick={() => handleSelectViewProfile('musician')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewProfile === 'musician'
                      ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Lista Tipo Músico</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectViewProfile('tech')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewProfile === 'tech'
                      ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Lista Tipo Técnico (Roadies)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectViewProfile('hybrid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewProfile === 'hybrid'
                      ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <Layers2 className="w-3.5 h-3.5" />
                  <span>Lista Híbrida</span>
                </button>
              </div>
            </div>

            {/* Sub-selector for Musician View */}
            {viewProfile === 'musician' && (
              <div className="pt-2.5 border-t border-amber-300/40 dark:border-amber-900/40 flex flex-wrap items-center gap-2 animate-in fade-in duration-150">
                <span className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Hoja Personalizada para:</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMusician('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedMusician === 'all'
                        ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                        : 'bg-white dark:bg-[#1a1715] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#25221d] border border-stone-300/80 dark:border-stone-700'
                    }`}
                  >
                    Todos los Músicos
                  </button>
                  {availableMusicians.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setSelectedMusician(m.name)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedMusician === m.name
                          ? 'bg-amber-500 text-stone-950 font-black shadow-xs ring-1 ring-amber-400'
                          : 'bg-white dark:bg-[#1a1715] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#25221d] border border-stone-300/80 dark:border-stone-700'
                      }`}
                    >
                      <Guitar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{m.name}</span>
                      {m.role && <span className="opacity-60 text-[10px] font-normal">({m.role})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Explanatory banner for Technical View */}
            {viewProfile === 'tech' && (
              <div className="pt-2 border-t border-amber-300/40 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200 font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>Set Técnico por Músicos:</strong> muestra todos los instrumentos por tema, guitarras principales y de repuesto con color, calibres de cuerda, afinaciones y llamados de asistencia roadie entre temas.
                </span>
              </div>
            )}
          </div>

          {/* Visibility Checkboxes */}
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              Detalles Visibles Individuales
            </label>
            <div className="flex flex-wrap gap-2.5 pt-1 text-stone-700 dark:text-stone-300">
              <button
                onClick={() => setShowKeys(!showKeys)}
                className="flex items-center gap-1 hover:text-amber-600 transition-colors"
              >
                {showKeys ? <CheckSquare className="w-3.5 h-3.5 text-amber-500" /> : <Square className="w-3.5 h-3.5 text-stone-400" />}
                <span className="font-semibold">Tono</span>
              </button>
              <button
                onClick={() => setShowTuning(!showTuning)}
                className="flex items-center gap-1 hover:text-amber-600 transition-colors"
              >
                {showTuning ? <CheckSquare className="w-3.5 h-3.5 text-amber-500" /> : <Square className="w-3.5 h-3.5 text-stone-400" />}
                <span className="font-semibold">Afinación</span>
              </button>
              <button
                onClick={() => setShowBpm(!showBpm)}
                className="flex items-center gap-1 hover:text-amber-600 transition-colors"
              >
                {showBpm ? <CheckSquare className="w-3.5 h-3.5 text-amber-500" /> : <Square className="w-3.5 h-3.5 text-stone-400" />}
                <span className="font-semibold">BPM</span>
              </button>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-1 hover:text-amber-600 transition-colors"
              >
                {showNotes ? <CheckSquare className="w-3.5 h-3.5 text-amber-500" /> : <Square className="w-3.5 h-3.5 text-stone-400" />}
                <span className="font-semibold">Notas</span>
              </button>
              <button
                onClick={() => setShowTech(!showTech)}
                className="flex items-center gap-1 hover:text-amber-600 transition-colors"
                title="Mostrar u ocultar notas técnicas de guitarras/bajos/cuerdas"
              >
                {showTech ? <CheckSquare className="w-3.5 h-3.5 text-amber-500" /> : <Square className="w-3.5 h-3.5 text-stone-400" />}
                <span className="font-semibold">Técnicos (Guitarras)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 1. RENDER MODE: SINGLE PAGE GUARANTEED */}
      {pageMode === 'single_page' && (
        <div 
          id="printable-stage-sheet"
          className={`stage-sheet-container single-page-sheet mx-auto rounded-3xl p-6 sm:p-9 transition-all shadow-xl border ${
            sheetTheme === 'stage-dark'
              ? 'bg-[#121110] text-[#f5f2eb] border-[#2e2a25]'
              : 'bg-[#fffdfa] text-stone-900 border-stone-200'
          } max-w-4xl`}
        >
          {/* Header */}
          {renderSheetHeader('HOJA ÚNICA DE ESCENARIO', '1 HOJA')}

          {/* SONGS RENDER */}
          <div className={effectiveColumns === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2' : 'space-y-2'}>
            
            {/* Main Songs */}
            {mainSongs.map((song, idx) => {
              const numStr = (idx + 1).toString().padStart(2, '0');
              return renderSongRow(song, numStr, false);
            })}

            {/* Encore Songs (Rendered with distinctive banner and styling) */}
            {encoreSongs.length > 0 && (
              <div className="col-span-full my-3 space-y-2.5">
                {/* Encore Banner */}
                <div 
                  className={`p-2.5 rounded-2xl text-center font-black tracking-wider uppercase border-2 flex items-center justify-between px-4 ${
                    sheetTheme === 'stage-dark'
                      ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                      : 'bg-rose-600 border-rose-700 text-white'
                  }`}
                >
                  <span className="text-xs sm:text-sm flex items-center gap-2 font-mono-stage">
                    <Star className="w-4 h-4 fill-current" />
                    <span>BISES / ENCORE DEL SHOW</span>
                  </span>
                  <span className="text-xs opacity-90 font-normal">
                    {encoreSongs.length} {encoreSongs.length === 1 ? 'tema' : 'temas'}
                  </span>
                </div>

                {/* Encore Song Rows */}
                <div className={effectiveColumns === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2' : 'space-y-2'}>
                  {encoreSongs.map((song, eIdx) => {
                    const encoreBadge = `★${eIdx + 1}`;
                    return renderSongRow(song, encoreBadge, true);
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          {renderSheetFooter('1 de 1')}
        </div>
      )}

      {/* 2. RENDER MODE: BY BLOCKS (1 HOJA POR BLOQUE) */}
      {pageMode === 'by_blocks' && (
        <div className="space-y-8">
          {currentBlocks.map((blockTitle, blockIndex) => {
            const isEncoreBlock = blockTitle.toLowerCase().includes('bis') || blockTitle.toLowerCase().includes('encore');
            const songsInThisBlock = setlist.songs.filter((s) => {
              if (isEncoreBlock) return s.isEncore;
              return !s.isEncore && (s.blockTitle === blockTitle || (!s.blockTitle && blockIndex === 0));
            });

            return (
              <div
                key={blockTitle}
                className={`stage-sheet-container block-page-sheet mx-auto rounded-3xl p-6 sm:p-9 transition-all shadow-xl border ${
                  sheetTheme === 'stage-dark'
                    ? 'bg-[#121110] text-[#f5f2eb] border-[#2e2a25]'
                    : 'bg-[#fffdfa] text-stone-900 border-stone-200'
                } max-w-4xl`}
              >
                {/* Header with Page X of Y indicator */}
                {renderSheetHeader(blockTitle, `Hoja ${blockIndex + 1} de ${currentBlocks.length}`)}

                {/* Block Banner */}
                <div className={`my-3 p-3 rounded-2xl flex items-center justify-between px-4 border ${
                  isEncoreBlock
                    ? (sheetTheme === 'stage-dark' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-rose-600 text-white border-rose-700')
                    : (sheetTheme === 'stage-dark' ? 'bg-[#1c1a17] border-stone-700 text-amber-400' : 'bg-stone-900 text-white border-stone-800')
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-stage font-black text-sm sm:text-base uppercase">
                      {isEncoreBlock ? '★ ' : '▶ '} {blockTitle}
                    </span>
                  </div>
                  <span className="text-xs font-semibold opacity-80">
                    {songsInThisBlock.length} temas en este bloque
                  </span>
                </div>

                {/* Songs in this block */}
                {songsInThisBlock.length === 0 ? (
                  <p className="p-8 text-center text-xs italic opacity-50">
                    No hay canciones asignadas a este bloque. Vuelve al repertorio para asignarlas.
                  </p>
                ) : (
                  <div className={effectiveColumns === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2' : 'space-y-2'}>
                    {songsInThisBlock.map((song, sIdx) => {
                      const displayNum = isEncoreBlock ? `★${sIdx + 1}` : (sIdx + 1).toString().padStart(2, '0');
                      return renderSongRow(song, displayNum, isEncoreBlock);
                    })}
                  </div>
                )}

                {/* Footer */}
                {renderSheetFooter(`${blockIndex + 1} de ${currentBlocks.length}`)}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );

  // Helper Header
  function renderSheetHeader(subtitleExtra?: string, pageNumberTag?: string) {
    return (
      <div className="border-b-2 border-current pb-3 mb-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none font-display">
                {setlist.bandName || 'SETLIST'}
              </h1>
              <span className="text-[10px] font-mono-stage font-bold px-1.5 py-0.5 rounded border border-current/30 opacity-75">
                ESTÁNDAR A4
              </span>
              {viewProfile === 'musician' && selectedMusician !== 'all' && (
                <span className="text-[10px] font-mono-stage font-black px-2 py-0.5 rounded bg-amber-500 text-stone-950 uppercase tracking-wide shadow-2xs">
                  👤 Músico: {selectedMusician}
                </span>
              )}
              {viewProfile === 'tech' && (
                <span className="text-[10px] font-mono-stage font-black px-2 py-0.5 rounded bg-amber-500 text-stone-950 uppercase tracking-wide shadow-2xs">
                  🔧 Set Técnico Roadies
                </span>
              )}
              {viewProfile === 'musician' && selectedMusician === 'all' && (
                <span className="text-[10px] font-mono-stage font-bold px-2 py-0.5 rounded bg-current/10 uppercase tracking-wide">
                  👥 Músicos
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-bold opacity-85 mt-1 font-display">
              {setlist.name} {subtitleExtra && <span className="opacity-60 font-medium">— {subtitleExtra}</span>}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-sm sm:text-base font-black font-mono-stage">
              {regularSongsCount} TEMAS {encoreSongsCount > 0 ? `+ ${encoreSongsCount} BISES` : ''}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold opacity-70">
              Duración: {formatTotalDuration(totalSeconds)}
            </div>
            {pageNumberTag && (
              <span className="inline-block mt-0.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-stone-950 shadow-xs">
                {pageNumberTag}
              </span>
            )}
          </div>
        </div>

        {/* Venue & Date */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs font-bold uppercase tracking-wider pt-1.5 border-t border-dashed border-current/25 opacity-90 font-mono-stage">
          {setlist.venue && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              {setlist.venue}
            </span>
          )}
          {setlist.concertDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {setlist.concertDate}
            </span>
          )}
        </div>

        {/* Stage Notes */}
        {showNotes && setlist.stageNotes && (
          <div className={`p-2.5 rounded-xl text-xs border ${
            sheetTheme === 'stage-dark' 
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' 
              : 'bg-amber-50/80 border-amber-300 text-amber-950'
          }`}>
            <span className="font-black mr-2">NOTAS GENERALES:</span>
            <span>{setlist.stageNotes}</span>
          </div>
        )}
      </div>
    );
  }

  // Helper Song Row
  function renderSongRow(song: SongItem, displayNum: string, isEncore = false) {
    const isBreak = song.isBreak;

    if (isBreak) {
      return (
        <div 
          key={song.id} 
          className={`col-span-full my-2 p-2.5 rounded-2xl text-center font-bold tracking-wider uppercase border border-dashed ${
            sheetTheme === 'stage-dark'
              ? 'bg-stone-900 border-stone-700 text-stone-300'
              : 'bg-stone-100 border-stone-300 text-stone-700'
          }`}
        >
          <span className="text-xs">⏸  {song.title}</span>
          {showNotes && song.notes && (
            <span className="block text-[11px] font-normal normal-case mt-0.5 opacity-80 italic">
              {song.notes}
            </span>
          )}
        </div>
      );
    }

    const songIndex = setlist.songs.findIndex((s) => s.id === song.id);
    const prevSong = songIndex > 0 ? setlist.songs[songIndex - 1] : undefined;
    const songChanges = detectSongChanges(song, prevSong);
    const normalizedAssignments = getNormalizedAssignments(song);

    // Musician Filtered Profile
    const isSpecificMusician = viewProfile === 'musician' && selectedMusician !== 'all';
    const musicianAssignment = isSpecificMusician 
      ? normalizedAssignments.find(a => a.musicianName.trim().toLowerCase() === selectedMusician.trim().toLowerCase())
      : null;
    const musicianChange = isSpecificMusician
      ? songChanges.find(c => c.musicianName.trim().toLowerCase() === selectedMusician.trim().toLowerCase())
      : null;

    // Musician specific capo and tuning
    const effectiveCapo = musicianAssignment?.capoFret !== undefined 
      ? musicianAssignment.capoFret 
      : (song.capoFret || song.techDetails?.capoFret || 0);
    const effectiveTuning = musicianAssignment?.tuning || song.tuning;

    return (
      <div
        key={song.id}
        className={`flex items-start justify-between gap-2 p-2 sm:p-2.5 rounded-xl border-b border-current/15 transition-all ${
          isSpecificMusician && !musicianAssignment ? 'opacity-60' : ''
        }`}
      >
        {/* Number + Title */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className={`flex items-center justify-center rounded-xl font-black font-mono-stage shrink-0 border border-current/30 ${numberClass} ${
            isEncore
              ? 'bg-rose-600 text-white'
              : (sheetTheme === 'stage-dark' ? 'bg-[#1c1a17] text-amber-400' : 'bg-stone-950 text-white')
          }`}>
            {displayNum}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className={`font-mono-stage uppercase tracking-tight ${titleClass}`}>
                {song.title}
              </span>
              {song.artist && song.artist !== setlist.bandName && (
                <span className="text-xs opacity-60 font-semibold truncate">
                  ({song.artist})
                </span>
              )}
              {song.isOptionalEncore && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300">
                  OPCIONAL
                </span>
              )}
            </div>

            {/* Stage Note Cue */}
            {showNotes && song.notes && (
              <div className="text-[11px] sm:text-xs font-semibold italic mt-0.5 opacity-85 text-amber-700 dark:text-amber-400">
                ▶ {song.notes}
              </div>
            )}

            {/* SPECIFIC MUSICIAN VIEW CUES */}
            {isSpecificMusician && (
              <div className="mt-1 space-y-1">
                {musicianAssignment ? (
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-stone-500"
                      style={{ backgroundColor: musicianAssignment.colorHex || '#f59e0b' }}
                    />
                    <span className="font-extrabold text-amber-800 dark:text-amber-300">
                      🎸 {musicianAssignment.instrumentName}
                    </span>
                    {musicianAssignment.instrumentNickname && (
                      <span className="italic opacity-80">
                        "{musicianAssignment.instrumentNickname}"
                      </span>
                    )}
                    {musicianAssignment.stringGauge && (
                      <span className="text-[10px] font-mono-stage px-1.5 py-0.2 rounded bg-current/10 font-bold">
                        Cuerdas: {musicianAssignment.stringGauge.split(' ')[0]}
                      </span>
                    )}
                    {musicianAssignment.techNotes && (
                      <span className="text-[11px] opacity-75 italic">
                        • {musicianAssignment.techNotes}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 italic">
                    ⏸ No participa en este tema (Pausa)
                  </div>
                )}

                {/* Specific Musician Change Alert */}
                {musicianChange && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-950 dark:text-amber-200 text-xs font-black animate-pulse">
                    <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-current shrink-0" />
                    <span>⚡ CAMBIO: {musicianChange.alertText}</span>
                  </div>
                )}
              </div>
            )}

            {/* ROADIE ASSISTANCE ALERT */}
            {(showTech || viewProfile === 'tech') && song.techDetails?.needsAssistance && (
              <div className="flex items-center gap-1.5 my-1 px-2.5 py-0.5 rounded-lg bg-amber-400/25 dark:bg-amber-900/40 border border-amber-500 text-amber-950 dark:text-amber-200 text-[10px] sm:text-[11px] font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-current shrink-0" />
                <span>⚡ ASISTENCIA ROADIE: {song.techDetails.assistanceReason || 'Cambio de instrumento / afinación'}</span>
              </div>
            )}

            {/* TECHNICAL STAGE VIEW (ROADIE RIDER) */}
            {(viewProfile === 'tech' || (showTech && !isSpecificMusician)) && normalizedAssignments.length > 0 && (
              <div className="flex flex-col gap-1 mt-1 text-[10px] sm:text-[11px]">
                {normalizedAssignments.map((asgn, asgnIdx) => (
                  <div key={asgnIdx} className="flex items-center gap-1.5 flex-wrap">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-stone-500"
                      style={{ backgroundColor: asgn.colorHex || '#f59e0b' }}
                    />
                    <span className="font-extrabold text-amber-800 dark:text-amber-400">
                      [{asgn.musicianName}]:
                    </span>
                    <span className="font-bold opacity-90 font-mono-stage">
                      {asgn.instrumentName}
                    </span>
                    {asgn.instrumentNickname && (
                      <span className="opacity-75 italic">
                        "{asgn.instrumentNickname}"
                      </span>
                    )}
                    {asgn.backupInstrument && (
                      <span className="opacity-70 flex items-center gap-1">
                        (Bkp: <strong>{asgn.backupInstrument}</strong>
                        {asgn.backupColorHex && (
                          <span 
                            className="w-2 h-2 rounded-full inline-block border border-stone-400 ml-0.5" 
                            style={{ backgroundColor: asgn.backupColorHex }} 
                          />
                        )})
                      </span>
                    )}
                    {asgn.stringGauge && (
                      <span className="opacity-80 font-mono-stage px-1 rounded bg-current/10">
                        Cuerdas: {asgn.stringGauge.split(' ')[0]}
                      </span>
                    )}
                    {asgn.tuning && asgn.tuning !== 'Estándar (E)' && (
                      <span className="text-amber-700 dark:text-amber-300 font-bold px-1 rounded bg-amber-500/15">
                        Afinación: {asgn.tuning}
                      </span>
                    )}
                    {asgn.techNotes && (
                      <span className="opacity-75 italic">
                        • {asgn.techNotes}
                      </span>
                    )}
                  </div>
                ))}

                {/* Change alerts in technical mode */}
                {viewProfile === 'tech' && songChanges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {songChanges.map((alert, aIdx) => (
                      <span key={aIdx} className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-900 dark:text-amber-200 text-[10px] font-bold border border-amber-400/50">
                        <Zap className="w-2.5 h-2.5 text-amber-600 fill-current" />
                        <span>⚡ Cambio {alert.musicianName}: {alert.alertText}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {effectiveCapo > 0 ? (
            <span className={`rounded-lg font-black border font-mono-stage ${badgesClass} ${
              sheetTheme === 'stage-dark'
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-amber-200 border-amber-400 text-amber-950'
            }`}>
              CAPO {effectiveCapo}
            </span>
          ) : isSpecificMusician && (
            <span className={`rounded-lg font-bold border font-mono-stage opacity-60 ${badgesClass}`}>
              SIN CAPO
            </span>
          )}

          {showKeys && song.keyNote && (
            <span className={`rounded-lg font-black border font-mono-stage ${badgesClass} ${
              sheetTheme === 'stage-dark'
                ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
                : 'bg-indigo-100 border-indigo-300 text-indigo-950'
            }`}>
              {song.keyNote}
            </span>
          )}

          {showTuning && effectiveTuning && effectiveTuning !== 'Estándar (E)' && (
            <span className={`rounded-lg font-black border font-mono-stage ${badgesClass} ${
              sheetTheme === 'stage-dark'
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-amber-100 border-amber-400 text-amber-950'
            }`}>
              {effectiveTuning}
            </span>
          )}

          {showBpm && song.bpm && (
            <span className={`rounded-lg font-bold font-mono-stage opacity-90 ${badgesClass}`}>
              {song.bpm} bit
            </span>
          )}

          {showDuration && song.durationSec > 0 && (
            <span className="font-mono-stage opacity-70 font-semibold text-xs">
              {formatDuration(song.durationSec)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Helper Footer
  function renderSheetFooter(pageText: string) {
    return (
      <div className="mt-6 pt-3 border-t border-current/20 flex items-center justify-between text-[10px] sm:text-[11px] opacity-60 font-mono-stage">
        <span>SETLIST STUDIO • HOJA OFICIAL DE ESCENARIO (ESTÁNDAR A4)</span>
        <span>HOJA {pageText} • IMPRESO: {new Date().toLocaleDateString('es-ES')}</span>
      </div>
    );
  }
};
