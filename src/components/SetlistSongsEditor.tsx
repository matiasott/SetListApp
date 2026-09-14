import React, { useState } from 'react';
import { 
  ChevronUp, ChevronDown, Trash2, Edit2, Plus, Sparkles, 
  Clock, Hash, Music, Volume2, MoveUp, MoveDown, Layers, Flag,
  Star, FileText, Layers2, Check, X, ArrowUpRight, ArrowDownRight,
  HelpCircle, CornerDownRight, CornerUpLeft, Disc3, Wrench, ShieldAlert,
  GripVertical, Zap
} from 'lucide-react';
import { Setlist, SheetPageMode, SongItem, BandMusician } from '../types';
import { formatDuration, formatTotalDuration } from '../services/musicSearch';
import { detectSongChanges } from '../services/changeAlerts';
import { SongEditModal } from './SongEditModal';

interface SetlistSongsEditorProps {
  setlist: Setlist;
  onUpdateSetlist: (updates: Partial<Setlist>) => void;
  songs: SongItem[];
  onUpdateSongs: (songs: SongItem[]) => void;
  onOpenSearch: () => void;
  bandMusicians?: BandMusician[];
}

const COMMON_TUNINGS = [
  'Estándar (E)',
  'Drop D',
  'Medio tono abajo (Eb)',
  'Tono abajo (D)',
  'Drop C',
  'DADGAD',
  'Open G',
  'Open D',
];

const COMMON_KEYS = [
  'C', 'Cm', 'C#m', 'D', 'Dm', 'Eb', 'E', 'Em', 'F', 'F#m', 'G', 'Gm', 'Ab', 'A', 'Am', 'Bb', 'B', 'Bm'
];

export const SetlistSongsEditor: React.FC<SetlistSongsEditorProps> = ({
  setlist,
  onUpdateSetlist,
  songs,
  onUpdateSongs,
  onOpenSearch,
  bandMusicians = [],
}) => {
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [modalSong, setModalSong] = useState<SongItem | null>(null);
  const [newBlockName, setNewBlockName] = useState('');
  const [isAddingBlock, setIsAddingBlock] = useState(false);

  // Mouse Drag & Drop State
  const [draggingSongId, setDraggingSongId] = useState<string | null>(null);
  const [dragOverSongId, setDragOverSongId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below'>('above');

  const pageMode: SheetPageMode = setlist.pageMode || 'single_page';

  // Extract blocks (with fallbacks)
  const currentBlocks: string[] = (setlist.blocks && setlist.blocks.length > 0) 
    ? setlist.blocks 
    : ['Bloque 1: Set Eléctrico', 'Bloque 2: Acústico', 'Bises'];

  const handleTogglePageMode = (newMode: SheetPageMode) => {
    onUpdateSetlist({ pageMode: newMode });
  };

  // Reorder handlers (Keyboard & Touch buttons)
  const moveSong = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= songs.length) return;

    const updated = [...songs];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onUpdateSongs(updated);
  };

  // Mouse Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, songId: string) => {
    setDraggingSongId(songId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', songId);
  };

  const handleDragOver = (e: React.DragEvent, targetSongId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggingSongId === targetSongId) return;

    const targetRect = e.currentTarget.getBoundingClientRect();
    const hoverMiddleY = (targetRect.bottom - targetRect.top) / 2;
    const hoverClientY = e.clientY - targetRect.top;
    const position = hoverClientY < hoverMiddleY ? 'above' : 'below';

    if (dragOverSongId !== targetSongId || dropPosition !== position) {
      setDragOverSongId(targetSongId);
      setDropPosition(position);
    }
  };

  const handleDragLeave = (e: React.DragEvent, targetSongId: string) => {
    if (dragOverSongId === targetSongId && !e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSongId(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    targetSongId: string,
    isEncoreSection = false,
    targetBlockTitle?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const sourceId = draggingSongId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetSongId) {
      setDraggingSongId(null);
      setDragOverSongId(null);
      return;
    }

    const sourceIndex = songs.findIndex((s) => s.id === sourceId);
    if (sourceIndex === -1) {
      setDraggingSongId(null);
      setDragOverSongId(null);
      return;
    }

    const updated = [...songs];
    const [movedSong] = updated.splice(sourceIndex, 1);

    // Cross-section adaptation
    if (isEncoreSection) {
      movedSong.isEncore = true;
      if (movedSong.blockTitle === 'Bloque 1') {
        movedSong.blockTitle = 'Bises';
      }
    } else if (pageMode === 'single_page' && !isEncoreSection && movedSong.isEncore) {
      movedSong.isEncore = false;
      movedSong.isOptionalEncore = false;
      if (movedSong.blockTitle === 'Bises') {
        movedSong.blockTitle = 'Bloque 1';
      }
    }

    if (pageMode === 'by_blocks' && targetBlockTitle) {
      movedSong.blockTitle = targetBlockTitle;
      movedSong.isEncore = targetBlockTitle.toLowerCase().includes('bis') || targetBlockTitle.toLowerCase().includes('encore');
    }

    const targetIndex = updated.findIndex((s) => s.id === targetSongId);
    if (targetIndex === -1) {
      updated.push(movedSong);
    } else {
      const insertIndex = dropPosition === 'above' ? targetIndex : targetIndex + 1;
      updated.splice(insertIndex, 0, movedSong);
    }

    onUpdateSongs(updated);
    setDraggingSongId(null);
    setDragOverSongId(null);
  };

  const handleDragEnd = () => {
    setDraggingSongId(null);
    setDragOverSongId(null);
  };

  const moveToExtreme = (index: number, position: 'top' | 'bottom') => {
    const updated = [...songs];
    const [item] = updated.splice(index, 1);
    if (position === 'top') {
      updated.unshift(item);
    } else {
      updated.push(item);
    }
    onUpdateSongs(updated);
  };

  const removeSong = (id: string) => {
    onUpdateSongs(songs.filter((s) => s.id !== id));
  };

  const updateSongField = (id: string, updates: Partial<SongItem>) => {
    onUpdateSongs(
      songs.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  // Toggle Encore status
  const toggleEncore = (id: string) => {
    onUpdateSongs(
      songs.map((s) => {
        if (s.id === id) {
          const nextEncore = !s.isEncore;
          return {
            ...s,
            isEncore: nextEncore,
            isOptionalEncore: nextEncore ? s.isOptionalEncore : false,
            blockTitle: nextEncore ? 'Bises' : (s.blockTitle === 'Bises' ? 'Bloque 1' : s.blockTitle),
          };
        }
        return s;
      })
    );
  };

  // Toggle Optional Encore status
  const toggleOptionalEncore = (id: string) => {
    onUpdateSongs(
      songs.map((s) => (s.id === id ? { ...s, isOptionalEncore: !s.isOptionalEncore } : s))
    );
  };

  // Add Break
  const addBreakMarker = (targetBlockTitle?: string) => {
    const newBreak: SongItem = {
      id: `break-${Date.now()}`,
      title: 'Intermedio / Pausa',
      artist: 'Banda',
      durationSec: 300,
      isBreak: true,
      blockTitle: targetBlockTitle || (pageMode === 'by_blocks' ? currentBlocks[0] : undefined),
      notes: 'Descanso de 5 minutos o afinación de instrumentos',
    };
    onUpdateSongs([...songs, newBreak]);
  };

  // Add Manual Song to Bises
  const handleAddDirectEncore = () => {
    const newEncoreTrack: SongItem = {
      id: `track-bis-${Date.now()}`,
      title: 'Tema de Bis / Cierre',
      artist: setlist.bandName || 'Banda',
      durationSec: 240,
      isEncore: true,
      blockTitle: 'Bises',
      keyNote: 'A',
      tuning: 'Estándar (E)',
      notes: 'Regreso al escenario tras ovación',
    };
    onUpdateSongs([...songs, newEncoreTrack]);
    setEditingSongId(newEncoreTrack.id);
  };

  // Block management
  const handleCreateBlock = () => {
    if (!newBlockName.trim()) return;
    const trimmed = newBlockName.trim();
    if (!currentBlocks.includes(trimmed)) {
      const updated = [...currentBlocks, trimmed];
      onUpdateSetlist({ blocks: updated });
    }
    setNewBlockName('');
    setIsAddingBlock(false);
  };

  const handleRemoveBlock = (blockToRemove: string) => {
    const updated = currentBlocks.filter((b) => b !== blockToRemove);
    const fallbackBlock = updated[0] || 'Bloque 1';
    const updatedSongs = songs.map((s) => (s.blockTitle === blockToRemove ? { ...s, blockTitle: fallbackBlock } : s));
    onUpdateSetlist({ blocks: updated });
    onUpdateSongs(updatedSongs);
  };

  const handleMoveSongToBlock = (songId: string, targetBlock: string) => {
    const isEncoreBlock = targetBlock.toLowerCase().includes('bis') || targetBlock.toLowerCase().includes('encore');
    onUpdateSongs(
      songs.map((s) => {
        if (s.id === songId) {
          return {
            ...s,
            blockTitle: targetBlock,
            isEncore: isEncoreBlock ? true : (s.blockTitle === 'Bises' ? false : s.isEncore),
          };
        }
        return s;
      })
    );
  };

  // Song Partition for Standard Mode
  const mainSongs = songs.filter((s) => !s.isEncore);
  const encoreSongs = songs.filter((s) => s.isEncore);

  const mainDuration = mainSongs.reduce((acc, s) => acc + (s.durationSec || 0), 0);
  const encoreDuration = encoreSongs.reduce((acc, s) => acc + (s.durationSec || 0), 0);
  const totalSongsCount = songs.length;

  return (
    <div className="no-print space-y-6">
      
      {/* 1. SHOW FORMAT SELECTOR (SINGLE PAGE VS BY BLOCKS) - Compact */}
      <div className="bg-white dark:bg-[#191715] p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 dark:border-[#2d2822] shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Disc3 className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                  Formato de Impresión y Atril
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-stone-100 dark:bg-stone-800 text-amber-700 dark:text-amber-400 border border-stone-200 dark:border-stone-700">
                  Estándar A4
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {pageMode === 'single_page'
                  ? 'Garantizado en 1 sola hoja A4 (ajuste vertical u horizontal según cantidad de temas).'
                  : '1 hoja A4 individual por cada bloque o set del show.'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex bg-stone-100 dark:bg-[#221f1b] p-1 rounded-xl border border-stone-200 dark:border-[#332e27] shrink-0">
            <button
              id="mode-single-page-btn"
              onClick={() => handleTogglePageMode('single_page')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                pageMode === 'single_page'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1 Hoja A4 Única</span>
            </button>

            <button
              id="mode-by-blocks-btn"
              onClick={() => handleTogglePageMode('by_blocks')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                pageMode === 'by_blocks'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Layers2 className="w-3.5 h-3.5" />
              <span>1 Hoja x Bloque</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. REPERTOIRE ACTION TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#191715] p-4 sm:p-5 rounded-3xl border border-stone-200/90 dark:border-[#2d2822] shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-display font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2 flex-wrap">
              <span>{pageMode === 'single_page' ? 'Repertorio del Concierto' : 'Bloques y Repertorio'}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                <GripVertical className="w-3 h-3" /> Arrastra con el mouse para reordenar
              </span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {pageMode === 'single_page'
                ? `Principal: ${mainSongs.length} temas (${formatTotalDuration(mainDuration)}) • Bises: ${encoreSongs.length} temas (${formatTotalDuration(encoreDuration)})`
                : `${currentBlocks.length} bloques organizados`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            id="editor-search-songs-btn"
            onClick={onOpenSearch}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-sm transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buscar Temas</span>
          </button>

          {pageMode === 'single_page' && (
            <button
              id="editor-add-direct-encore-btn"
              onClick={handleAddDirectEncore}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800/80 transition-colors"
              title="Añadir canción directamente a la sección de Bises"
            >
              <Star className="w-3.5 h-3.5 fill-current text-rose-600 dark:text-rose-400" />
              <span>+ Bis</span>
            </button>
          )}

          {pageMode === 'by_blocks' && (
            <button
              id="editor-new-block-btn"
              onClick={() => setIsAddingBlock(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300/80 dark:border-stone-700 transition-colors"
            >
              <Layers2 className="w-3.5 h-3.5 text-amber-500" />
              <span>+ Nuevo Bloque</span>
            </button>
          )}

          <button
            id="editor-add-break-btn"
            onClick={() => addBreakMarker()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300/80 dark:border-stone-700 transition-colors"
            title="Añadir descanso o cambio de instrumentos"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pausa</span>
          </button>
        </div>
      </div>

      {/* Block Creation Input Drawer if open */}
      {isAddingBlock && (
        <div className="bg-amber-50/70 dark:bg-[#201d19] p-4 sm:p-5 rounded-3xl border border-amber-300 dark:border-[#403728] flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
              Nombre de la Nueva Tanda / Bloque de Show
            </label>
            <input
              type="text"
              value={newBlockName}
              onChange={(e) => setNewBlockName(e.target.value)}
              placeholder="Ej: Bloque 3: Acústico Íntimo, Acto II, Bises Finales..."
              className="w-full text-xs font-bold bg-white dark:bg-[#151412] p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateBlock()}
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleCreateBlock}
              className="px-4 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl"
            >
              Crear Bloque
            </button>
            <button
              onClick={() => setIsAddingBlock(false)}
              className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {songs.length === 0 && (
        <div className="bg-white dark:bg-[#191715] rounded-3xl p-12 border border-dashed border-stone-300 dark:border-stone-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
            <Music className="w-7 h-7" />
          </div>
          <h4 className="font-display font-extrabold text-lg text-stone-900 dark:text-stone-100">
            Tu repertorio está listo para armarse
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            Busca temas en el catálogo de artistas o agrega canciones propias para empezar a preparar tu hoja de escenario.
          </p>
          <button
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-md transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buscar Canciones Ahora</span>
          </button>
        </div>
      )}

      {/* 3. MODE: SINGLE PAGE WITH DEDICATED BISES SECTION */}
      {pageMode === 'single_page' && songs.length > 0 && (
        <div className="space-y-6">
          
          {/* A. REPERTORIO PRINCIPAL (MAIN SET) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-[#2a2621]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-900 dark:bg-amber-400"></span>
                <h4 className="font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  Repertorio Principal (Main Set)
                </h4>
              </div>
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                {mainSongs.length} {mainSongs.length === 1 ? 'canción' : 'canciones'} • {formatTotalDuration(mainDuration)}
              </span>
            </div>

            {mainSongs.length === 0 ? (
              <p className="text-xs italic text-stone-400 p-5 text-center bg-stone-50 dark:bg-[#1d1b18] rounded-2xl">
                No hay canciones en el repertorio principal. Agrega temas arriba.
              </p>
            ) : (
              <div className="space-y-2.5">
                {mainSongs.map((song) => {
                  const fullIndex = songs.findIndex((s) => s.id === song.id);
                  const trackNumber = songs.slice(0, fullIndex + 1).filter((s) => !s.isBreak && !s.isEncore).length;
                  return renderSongCard(song, fullIndex, trackNumber.toString(), false, undefined, 'Bloque 1');
                })}
              </div>
            )}
          </div>

          {/* B. SECCIÓN DEDICADA DE BISES / ENCORE (WARM BACKSTAGE WINE & GOLD) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-rose-50/70 via-amber-50/30 to-white dark:from-[#241517] dark:via-[#1c1817] dark:to-[#151413] border-2 border-rose-300/90 dark:border-rose-900/60 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/80 dark:border-rose-950/80 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-rose-600/20">
                  ★
                </div>
                <div>
                  <h4 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-rose-950 dark:text-rose-200 flex items-center gap-2">
                    <span>Bises / Encores del Show</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-200/80 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200">
                      {encoreSongs.length} {encoreSongs.length === 1 ? 'bis' : 'bises'}
                    </span>
                  </h4>
                  <p className="text-xs text-rose-800/80 dark:text-rose-300/80">
                    Temas de cierre para el regreso al escenario. Entran dentro de la misma carátula única.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddDirectEncore}
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-black rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all active:scale-98"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Añadir a Bises</span>
                </button>
              </div>
            </div>

            {encoreSongs.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceId = draggingSongId || e.dataTransfer.getData('text/plain');
                  if (sourceId) {
                    const sourceIndex = songs.findIndex((s) => s.id === sourceId);
                    if (sourceIndex !== -1) {
                      const updated = [...songs];
                      const [movedSong] = updated.splice(sourceIndex, 1);
                      movedSong.isEncore = true;
                      movedSong.blockTitle = 'Bises';
                      updated.push(movedSong);
                      onUpdateSongs(updated);
                    }
                  }
                  setDraggingSongId(null);
                  setDragOverSongId(null);
                }}
                className="p-6 text-center rounded-2xl bg-white/70 dark:bg-[#181615]/70 border-2 border-dashed border-rose-300/80 dark:border-rose-900/60 space-y-2 transition-colors hover:border-rose-500"
              >
                <Star className="w-7 h-7 text-rose-400 mx-auto opacity-70" />
                <p className="text-xs font-bold text-rose-950 dark:text-rose-200">
                  Arrastra canciones aquí para pasarlas a los bises
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Haz clic en el botón <strong>"★ Bis"</strong> de cualquier canción de la lista para pasarla al bis, o crea uno con el botón superior.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {encoreSongs.map((song, encoreIdx) => {
                  const fullIndex = songs.findIndex((s) => s.id === song.id);
                  const encoreBadge = `Bis ${encoreIdx + 1}`;
                  return renderSongCard(song, fullIndex, encoreBadge, true, undefined, 'Bises');
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* 4. MODE: BY BLOCKS (1 HOJA POR BLOQUE) */}
      {pageMode === 'by_blocks' && songs.length > 0 && (
        <div className="space-y-6">
          {currentBlocks.map((blockTitle, blockIndex) => {
            const isEncoreBlock = blockTitle.toLowerCase().includes('bis') || blockTitle.toLowerCase().includes('encore');
            const songsInThisBlock = songs.filter((s) => {
              if (isEncoreBlock) return s.isEncore;
              return !s.isEncore && (s.blockTitle === blockTitle || (!s.blockTitle && blockIndex === 0));
            });
            const blockSeconds = songsInThisBlock.reduce((acc, s) => acc + (s.durationSec || 0), 0);

            return (
              <div 
                key={blockTitle} 
                className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 transition-all ${
                  isEncoreBlock
                    ? 'bg-gradient-to-b from-rose-50/50 to-white dark:from-[#241517] dark:to-[#171514] border-rose-300 dark:border-rose-900/60'
                    : 'bg-white dark:bg-[#191715] border-stone-200/90 dark:border-[#2d2822]'
                }`}
              >
                {/* Block Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-[#28241f]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono-stage font-black text-xs ${
                      isEncoreBlock 
                        ? 'bg-rose-600 text-white' 
                        : 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950'
                    }`}>
                      {isEncoreBlock ? '★' : `H${blockIndex + 1}`}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          Hoja Independiente {blockIndex + 1} de {currentBlocks.length}
                        </span>
                      </div>
                      <h4 className="font-display font-black text-base text-stone-900 dark:text-stone-100 uppercase">
                        {blockTitle}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                      {songsInThisBlock.length} temas • {formatTotalDuration(blockSeconds)}
                    </span>
                    {currentBlocks.length > 1 && (
                      <button
                        onClick={() => handleRemoveBlock(blockTitle)}
                        className="text-xs text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Eliminar este bloque"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Songs in Block */}
                {songsInThisBlock.length === 0 ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const sourceId = draggingSongId || e.dataTransfer.getData('text/plain');
                      if (sourceId) {
                        handleMoveSongToBlock(sourceId, blockTitle);
                      }
                      setDraggingSongId(null);
                      setDragOverSongId(null);
                    }}
                    className="p-5 text-center rounded-2xl bg-stone-50 dark:bg-[#1f1c19] border-2 border-dashed border-stone-200 dark:border-stone-800 space-y-1 transition-colors hover:border-amber-400"
                  >
                    <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
                      Arrastra canciones aquí para colocarlas en este bloque
                    </p>
                    <p className="text-[11px] text-stone-400">
                      O selecciónalo desde el selector de bloque en cada tema
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {songsInThisBlock.map((song, songIdx) => {
                      const fullIndex = songs.findIndex((s) => s.id === song.id);
                      const displayNum = isEncoreBlock ? `★${songIdx + 1}` : (songIdx + 1).toString();
                      return renderSongCard(song, fullIndex, displayNum, isEncoreBlock, currentBlocks, blockTitle);
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Song Edit & Technical Assistance Modal */}
      {(() => {
        const modalSongIndex = modalSong ? songs.findIndex((s) => s.id === modalSong.id) : -1;
        const previousSongForModal = modalSongIndex > 0 ? songs[modalSongIndex - 1] : null;

        return (
          <SongEditModal
            isOpen={Boolean(modalSong)}
            song={modalSong}
            bandMusicians={bandMusicians}
            previousSong={previousSongForModal}
            onClose={() => setModalSong(null)}
            onSave={(updatedSong) => {
              if (!modalSong) return;
              updateSongField(modalSong.id, updatedSong);
              setModalSong(null);
            }}
          />
        );
      })()}

    </div>
  );

  // HELPER FUNCTION: Renders individual song card
  function renderSongCard(
    song: SongItem,
    fullIndex: number,
    displayTrackBadge: string,
    isEncoreSection = false,
    availableBlocks?: string[],
    parentBlockTitle?: string
  ) {
    const isEditing = editingSongId === song.id;
    const isBreak = song.isBreak;
    const isDragging = draggingSongId === song.id;
    const isDragOver = dragOverSongId === song.id && !isDragging;

    if (isBreak) {
      return (
        <div
          key={song.id}
          draggable
          onDragStart={(e) => handleDragStart(e, song.id)}
          onDragOver={(e) => handleDragOver(e, song.id)}
          onDragLeave={(e) => handleDragLeave(e, song.id)}
          onDrop={(e) => handleDrop(e, song.id, isEncoreSection, parentBlockTitle)}
          onDragEnd={handleDragEnd}
          className={`group relative flex items-center justify-between p-3.5 rounded-2xl bg-stone-100/90 dark:bg-[#221f1b] border transition-all ${
            isDragging
              ? 'opacity-40 ring-2 ring-amber-500 scale-[0.99] border-dashed border-amber-500'
              : 'border-stone-300/80 dark:border-[#332e27] shadow-xs'
          }`}
        >
          {/* Top insertion line */}
          {isDragOver && dropPosition === 'above' && (
            <div className="absolute -top-1.5 left-2 right-2 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.9)] z-30 pointer-events-none animate-pulse" />
          )}

          {/* Bottom insertion line */}
          {isDragOver && dropPosition === 'below' && (
            <div className="absolute -bottom-1.5 left-2 right-2 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.9)] z-30 pointer-events-none animate-pulse" />
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="p-1 -ml-1 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-grab active:cursor-grabbing rounded-lg transition-colors"
              title="Arrastrar pausa con el mouse para reordenar"
            >
              <GripVertical className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="w-7 h-7 rounded-lg bg-stone-700 dark:bg-stone-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              ⏸
            </div>
            <div>
              <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200 uppercase tracking-wide">
                {song.title}
              </span>
              <input
                type="text"
                value={song.notes || ''}
                onChange={(e) => updateSongField(song.id, { notes: e.target.value })}
                placeholder="Nota de pausa (ej. 'Descanso de 5 min / afinación')"
                className="text-xs text-stone-600 dark:text-stone-400 bg-transparent focus:outline-none border-b border-transparent focus:border-stone-400 w-full max-w-sm block mt-0.5"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => moveSong(fullIndex, 'up')}
              disabled={fullIndex === 0}
              className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-white disabled:opacity-20 rounded-lg"
              title="Mover arriba"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => moveSong(fullIndex, 'down')}
              disabled={fullIndex === songs.length - 1}
              className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-white disabled:opacity-20 rounded-lg"
              title="Mover abajo"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeSong(song.id)}
              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
              title="Eliminar pausa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={song.id}
        draggable={!isEditing}
        onDragStart={(e) => handleDragStart(e, song.id)}
        onDragOver={(e) => handleDragOver(e, song.id)}
        onDragLeave={(e) => handleDragLeave(e, song.id)}
        onDrop={(e) => handleDrop(e, song.id, isEncoreSection, parentBlockTitle)}
        onDragEnd={handleDragEnd}
        className={`group relative rounded-2xl bg-white dark:bg-[#1a1815] border transition-all ${
          isDragging
            ? 'opacity-40 ring-2 ring-amber-500 scale-[0.99] border-dashed border-amber-500'
            : isEditing
            ? 'border-amber-500 shadow-md ring-1 ring-amber-500/20'
            : isEncoreSection
            ? 'border-rose-200/90 dark:border-rose-900/60 hover:border-rose-400'
            : 'border-stone-200/90 dark:border-[#2d2822] hover:border-amber-400/80 dark:hover:border-stone-600 shadow-xs'
        }`}
      >
        {/* Top insertion bar */}
        {isDragOver && dropPosition === 'above' && (
          <div className="absolute -top-1.5 left-2 right-2 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.9)] z-30 pointer-events-none animate-pulse" />
        )}

        {/* Bottom insertion bar */}
        {isDragOver && dropPosition === 'below' && (
          <div className="absolute -bottom-1.5 left-2 right-2 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.9)] z-30 pointer-events-none animate-pulse" />
        )}

        <div className="flex items-center justify-between p-3 sm:p-3.5 gap-2 sm:gap-3">
          
          {/* Left: Drag Handle + Reorder Controls + Track Number */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Grab handle for dragging with mouse */}
            <div
              className="p-1 -ml-1 text-stone-300 dark:text-stone-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 cursor-grab active:cursor-grabbing rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Arrastrar con el mouse a la posición deseada"
            >
              <GripVertical className="w-4 h-4 stroke-[2.2]" />
            </div>

            {/* Reorder Buttons (Accessibility & Touch) */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveSong(fullIndex, 'up')}
                disabled={fullIndex === 0}
                className="p-1 rounded-md text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-20 transition-colors"
                title="Mover tema hacia arriba"
              >
                <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                onClick={() => moveSong(fullIndex, 'down')}
                disabled={fullIndex === songs.length - 1}
                className="p-1 rounded-md text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-20 transition-colors"
                title="Mover tema hacia abajo"
              >
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Track Number Badge */}
            <div className={`px-2 h-7 sm:h-8 rounded-xl font-mono-stage font-black text-xs sm:text-sm flex items-center justify-center shrink-0 border ${
              isEncoreSection
                ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                : 'bg-stone-100 dark:bg-[#27231f] text-stone-900 dark:text-stone-100 border-stone-200/80 dark:border-[#38332a]'
            }`}>
              {displayTrackBadge}
            </div>
          </div>

          {/* Center: Title, Artist, & Badges */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h4 className="font-display font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 truncate">
                {song.title}
              </h4>
              <span className="text-xs text-stone-500 dark:text-stone-400 truncate">
                {song.artist}
              </span>
              {song.isOptionalEncore && (
                <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300">
                  Reserva / Opcional
                </span>
              )}
            </div>

            {/* Badges row with pleasant musical accents */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono-stage font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-[#25221d] px-2 py-0.5 rounded-lg border border-stone-200/60 dark:border-stone-800">
                <Clock className="w-3 h-3 text-stone-400" />
                {formatDuration(song.durationSec)}
              </span>

              {/* Key badge */}
              <button
                onClick={() => setEditingSongId(isEditing ? null : song.id)}
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                  song.keyNote
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60'
                    : 'bg-stone-100 dark:bg-[#25221d] text-stone-400 hover:text-stone-600'
                }`}
                title="Editar tono"
              >
                <span>Tono:</span>
                <span className="font-mono-stage">{song.keyNote || '—'}</span>
              </button>

              {/* Capo badge */}
              {(song.capoFret || song.techDetails?.capoFret) ? (
                <button
                  onClick={() => setModalSong(song)}
                  className="inline-flex items-center gap-1 text-[11px] font-black font-mono-stage px-2 py-0.5 rounded-lg bg-amber-500 text-stone-950 shadow-2xs"
                  title={`Cejilla en traste ${song.capoFret || song.techDetails?.capoFret}`}
                >
                  CAPO {song.capoFret || song.techDetails?.capoFret}
                </button>
              ) : null}

              {/* Tuning badge */}
              <button
                onClick={() => setEditingSongId(isEditing ? null : song.id)}
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                  song.tuning && song.tuning !== 'Estándar (E)'
                    ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/70 dark:border-amber-800/70'
                    : 'bg-stone-100 dark:bg-[#25221d] text-stone-500 dark:text-stone-400'
                }`}
                title="Editar afinación"
              >
                <span>{song.tuning || 'Estándar'}</span>
              </button>

              {/* BPM / Tempo bit badge */}
              {song.bpm && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono-stage font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-lg border border-teal-200/80 dark:border-teal-800/60">
                  {song.bpm} bit
                </span>
              )}

              {/* Technical / Roadie / Guitar Badge */}
              {song.techDetails && (song.techDetails.primaryInstrument || song.techDetails.backupInstrument) && (
                <button
                  type="button"
                  onClick={() => setModalSong(song)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-[#25221d] dark:hover:bg-[#2e2a24] text-stone-800 dark:text-stone-200 border border-stone-300/80 dark:border-stone-700 transition-colors"
                  title="Ver / editar ficha técnica para roadies y técnicos"
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-stone-400" 
                    style={{ backgroundColor: song.techDetails.colorHex || '#f59e0b' }}
                  />
                  <span className="truncate max-w-[130px]">
                    {song.techDetails.primaryInstrument}
                  </span>
                  {song.techDetails.backupInstrument && (
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">
                      (Bkp: {song.techDetails.backupInstrument})
                    </span>
                  )}
                  {song.techDetails.stringGauge && (
                    <span className="text-[10px] font-mono-stage text-amber-700 dark:text-amber-400 ml-0.5">
                      [{song.techDetails.stringGauge.split(' ')[0]}]
                    </span>
                  )}
                </button>
              )}

              {/* Roadie assistance cue */}
              {song.techDetails?.needsAssistance && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-500 text-stone-950 shadow-2xs">
                  <Wrench className="w-3 h-3 stroke-[2.5]" />
                  <span>Asistencia Roadie</span>
                </span>
              )}

              {/* Notes preview */}
              {song.notes && !isEditing && (
                <span className="text-[11px] text-stone-600 dark:text-stone-400 italic truncate max-w-[180px] sm:max-w-xs">
                  "{song.notes}"
                </span>
              )}
            </div>

            {/* REAL-TIME CHANGE ALERT BADGES FROM PREVIOUS SONG */}
            {(() => {
              const prevSong = fullIndex > 0 ? songs[fullIndex - 1] : null;
              const songChanges = detectSongChanges(song, prevSong);

              if (songChanges.length === 0) return null;

              return (
                <div className="mt-2 space-y-1">
                  {songChanges.map((alert, alertIdx) => (
                    <div
                      key={alertIdx}
                      onClick={() => setModalSong(song)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 text-xs font-semibold cursor-pointer hover:border-amber-500 transition-colors shadow-2xs"
                      title="Haz clic para ver y editar los detalles del cambio"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-current shrink-0" />
                      <span className="font-extrabold text-[11px] uppercase tracking-wide text-amber-800 dark:text-amber-300">
                        ⚡ Cambio ({alert.musicianName}):
                      </span>
                      <span className="text-[11px] font-bold truncate max-w-md">
                        {alert.alertText}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Right: Actions & Fast Toggles */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Tech & Instrument Notes Modal Quick Action */}
            <button
              onClick={() => setModalSong(song)}
              className={`p-2 rounded-xl transition-all ${
                song.techDetails?.primaryInstrument
                  ? 'bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/80'
                  : 'text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              title="Ficha técnica de guitarras/bajos/cuerdas para técnicos"
            >
              <Wrench className="w-4 h-4" />
            </button>
            
            {/* If in Block Mode: Quick Block Selector Dropdown */}
            {availableBlocks && availableBlocks.length > 1 && (
              <select
                value={song.isEncore ? 'Bises' : (song.blockTitle || availableBlocks[0])}
                onChange={(e) => handleMoveSongToBlock(song.id, e.target.value)}
                className="text-[11px] font-bold bg-stone-100 dark:bg-[#25221d] text-stone-700 dark:text-stone-300 p-1.5 rounded-xl border border-stone-300/80 dark:border-stone-700 focus:outline-none"
                title="Mover a otro bloque de show"
              >
                {availableBlocks.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}

            {/* Encore Toggle Star Button */}
            <button
              onClick={() => toggleEncore(song.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                song.isEncore
                  ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm'
                  : 'bg-stone-100 dark:bg-[#25221d] text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
              title={song.isEncore ? 'Quitar de los bises (volver al set principal)' : 'Marcar como Bis / Encore'}
            >
              <Star className={`w-3.5 h-3.5 ${song.isEncore ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{song.isEncore ? 'Es Bis' : 'Bis'}</span>
            </button>

            {/* Optional encore toggle (only visible if isEncore) */}
            {song.isEncore && (
              <button
                onClick={() => toggleOptionalEncore(song.id)}
                className={`p-1.5 rounded-xl text-xs font-bold transition-colors ${
                  song.isOptionalEncore
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : 'text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
                title={song.isOptionalEncore ? 'Marcado como bis opcional de reserva' : 'Marcar como opcional (por si piden otra)'}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}

            {/* Edit Drawer Button */}
            <button
              onClick={() => setEditingSongId(isEditing ? null : song.id)}
              className={`p-2 rounded-xl transition-colors ${
                isEditing
                  ? 'bg-amber-500 text-stone-950 font-black'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              title={isEditing ? 'Cerrar edición' : 'Editar detalles'}
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete Song */}
            <button
              onClick={() => removeSong(song.id)}
              className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              title="Eliminar tema del setlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Inline Drawer for Detailed Editing */}
        {isEditing && (
          <div className="p-4 bg-stone-50/90 dark:bg-[#1f1c19] border-t border-stone-200 dark:border-[#2f2b25] rounded-b-2xl space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Tono / Key Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Tonalidad / Key
                </label>
                <input
                  type="text"
                  list={`keys-${song.id}`}
                  value={song.keyNote || ''}
                  onChange={(e) => updateSongField(song.id, { keyNote: e.target.value })}
                  placeholder="Ej. Am, G, E"
                  className="w-full text-xs font-bold font-mono-stage bg-white dark:bg-[#151412] p-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                />
                <datalist id={`keys-${song.id}`}>
                  {COMMON_KEYS.map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
              </div>

              {/* Afinación Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Afinación
                </label>
                <select
                  value={song.tuning || 'Estándar (E)'}
                  onChange={(e) => updateSongField(song.id, { tuning: e.target.value })}
                  className="w-full text-xs font-bold bg-white dark:bg-[#151412] p-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                >
                  {COMMON_TUNINGS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* BPM */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Tempo / BPM
                </label>
                <input
                  type="number"
                  min="40"
                  max="280"
                  value={song.bpm || ''}
                  onChange={(e) => updateSongField(song.id, { bpm: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                  placeholder="Ej. 120"
                  className="w-full text-xs font-bold font-mono-stage bg-white dark:bg-[#151412] p-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Quick Move Extreme */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Posición Rápida
                </label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => moveToExtreme(fullIndex, 'top')}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs bg-white dark:bg-[#151412] border border-stone-300 dark:border-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold"
                    title="Llevar al inicio del repertorio"
                  >
                    <MoveUp className="w-3 h-3" />
                    <span>Inicio</span>
                  </button>
                  <button
                    onClick={() => moveToExtreme(fullIndex, 'bottom')}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs bg-white dark:bg-[#151412] border border-stone-300 dark:border-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold"
                    title="Llevar al final del repertorio"
                  >
                    <MoveDown className="w-3 h-3" />
                    <span>Final</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Notes / Cues for musicians */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                Indicaciones de Escenario (Cues, transiciones, solos, instrumentos)
              </label>
              <input
                type="text"
                value={song.notes || ''}
                onChange={(e) => updateSongField(song.id, { notes: e.target.value })}
                placeholder="Ej: Empezar con guitarra acústica, sin pausa al tema siguiente, solo extendido..."
                className="w-full text-xs bg-white dark:bg-[#151412] p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={!!song.isOptionalEncore}
                  onChange={(e) => updateSongField(song.id, { isOptionalEncore: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>Tema de reserva / Bis opcional (por si el público pide otra)</span>
              </label>

              <button
                onClick={() => setEditingSongId(null)}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-black bg-amber-500 text-stone-950 rounded-xl hover:bg-amber-400"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Listo</span>
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }
};
