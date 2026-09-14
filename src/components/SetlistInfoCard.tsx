import React, { useState } from 'react';
import { Calendar, MapPin, Users, Music2, FileDown, Eye, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Setlist } from '../types';
import { formatTotalDuration } from '../services/musicSearch';
import { exportSetlistToPDF } from '../services/pdfExport';

interface SetlistInfoCardProps {
  setlist: Setlist;
  onUpdate: (updated: Partial<Setlist>) => void;
  onOpenSearch: () => void;
  onViewSheet: () => void;
}

export const SetlistInfoCard: React.FC<SetlistInfoCardProps> = ({
  setlist,
  onUpdate,
  onViewSheet,
}) => {
  const [showNotes, setShowNotes] = useState(Boolean(setlist.stageNotes && setlist.stageNotes.trim()));

  const totalSeconds = setlist.songs.reduce((acc, s) => acc + (s.durationSec || 0), 0);
  const regularSongsCount = setlist.songs.filter(s => !s.isBreak && !s.isEncore).length;
  const encoresCount = setlist.songs.filter(s => s.isEncore).length;

  return (
    <div className="no-print bg-white dark:bg-[#191715] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-stone-200/90 dark:border-[#2d2822] shadow-xs transition-all">
      
      {/* Top single compact row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left: Show Title & Inline Metadata Inputs */}
        <div className="flex-1 min-w-0 space-y-2">
          
          {/* Main Title row */}
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <input
              id="setlist-name-input"
              type="text"
              value={setlist.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Título del Show o Gira (ej: Gira 2026)"
              className="w-full font-display font-black text-base sm:text-lg text-stone-900 dark:text-stone-100 bg-transparent px-2 py-0.5 rounded-lg border border-transparent hover:border-stone-300 dark:hover:border-stone-700 focus:border-amber-500 focus:bg-stone-50/50 dark:focus:bg-[#201d1a] focus:outline-none transition-all placeholder:text-stone-400"
            />
          </div>

          {/* Inline Compact Metadata Fields */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            
            {/* Band / Artist */}
            <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-[#201d1a] px-2.5 py-1 rounded-lg border border-stone-200/80 dark:border-[#2e2924] flex-1 sm:flex-initial min-w-[140px]">
              <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <input
                id="setlist-band-input"
                type="text"
                value={setlist.bandName}
                onChange={(e) => onUpdate({ bandName: e.target.value })}
                placeholder="Banda / Artista"
                className="w-full text-xs font-bold text-stone-800 dark:text-stone-200 bg-transparent focus:outline-none placeholder:text-stone-400"
              />
            </div>

            {/* Venue */}
            <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-[#201d1a] px-2.5 py-1 rounded-lg border border-stone-200/80 dark:border-[#2e2924] flex-1 sm:flex-initial min-w-[140px]">
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <input
                id="setlist-venue-input"
                type="text"
                value={setlist.venue}
                onChange={(e) => onUpdate({ venue: e.target.value })}
                placeholder="Lugar / Sala"
                className="w-full text-xs font-bold text-stone-800 dark:text-stone-200 bg-transparent focus:outline-none placeholder:text-stone-400"
              />
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-[#201d1a] px-2.5 py-1 rounded-lg border border-stone-200/80 dark:border-[#2e2924]">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <input
                id="setlist-date-input"
                type="date"
                value={setlist.concertDate}
                onChange={(e) => onUpdate({ concertDate: e.target.value })}
                className="text-xs font-bold text-stone-800 dark:text-stone-200 bg-transparent focus:outline-none"
              />
            </div>

            {/* Toggle Stage Notes button */}
            <button
              id="toggle-stage-notes-btn"
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                showNotes || (setlist.stageNotes && setlist.stageNotes.trim())
                  ? 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <span>Notas de sonido</span>
              {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

          </div>

        </div>

        {/* Right: Compact Stats & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-stone-100 dark:border-[#26221d]">
          
          {/* Quick Stat pill */}
          <div className="flex items-center gap-2 bg-stone-100/80 dark:bg-[#201d1a] px-3 py-1.5 rounded-xl border border-stone-200/80 dark:border-[#2e2924] text-xs">
            <span className="font-bold text-stone-900 dark:text-stone-100 font-display">
              {regularSongsCount} {regularSongsCount === 1 ? 'tema' : 'temas'}
              {encoresCount > 0 && (
                <span className="text-rose-600 dark:text-rose-400 ml-1">+{encoresCount} bis</span>
              )}
            </span>
            <span className="text-stone-300 dark:text-stone-600">•</span>
            <span className="font-mono-stage font-bold text-amber-700 dark:text-amber-400">
              {formatTotalDuration(totalSeconds)}
            </span>
            <span className="text-stone-300 dark:text-stone-600">•</span>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-tight flex items-center gap-1">
              <FileText className="w-3 h-3" />
              A4
            </span>
          </div>

          {/* Quick Buttons */}
          <button
            id="setlist-export-pdf-quick-btn"
            onClick={() => exportSetlistToPDF(setlist)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all border border-stone-300/70 dark:border-stone-700"
            title="Descargar Setlist en PDF formato estándar A4"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">PDF A4</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <button
            id="setlist-view-sheet-quick-btn"
            onClick={onViewSheet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition-all shadow-xs active:scale-98"
            title="Ver en vista de Atril / Hoja A4"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Atril</span>
          </button>

        </div>

      </div>

      {/* Collapsible Stage Notes row */}
      {showNotes && (
        <div className="mt-2.5 pt-2.5 border-t border-stone-100 dark:border-[#27231e] animate-in fade-in duration-150">
          <input
            id="setlist-stage-notes-textarea"
            type="text"
            value={setlist.stageNotes || ''}
            onChange={(e) => onUpdate({ stageNotes: e.target.value })}
            placeholder="Notas para el show: Afinaciones alternativas, prueba de sonido, retornos, cues..."
            className="w-full text-xs text-stone-800 dark:text-stone-200 bg-stone-50/70 dark:bg-[#201d1a] px-3 py-1.5 rounded-xl border border-amber-300/80 dark:border-amber-900/60 focus:border-amber-500 focus:outline-none transition-all placeholder:text-stone-400 placeholder:italic"
          />
        </div>
      )}

    </div>
  );
};
