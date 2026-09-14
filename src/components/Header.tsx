import React from 'react';
import { Music, ListMusic, FileText, Sun, Moon, Plus, Disc, Sparkles, Users, ChevronDown, Guitar, Database, Download } from 'lucide-react';
import { Setlist, BandProject } from '../types';

interface HeaderProps {
  activeSetlist: Setlist;
  activeProject?: BandProject;
  savedSetlistsCount: number;
  currentView: 'editor' | 'sheet';
  onViewChange: (view: 'editor' | 'sheet') => void;
  onOpenManager: () => void;
  onOpenProjects: () => void;
  onOpenSearch: () => void;
  onNewSetlist: () => void;
  onOpenMusicians?: () => void;
  onOpenExportImport?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSetlist,
  activeProject,
  savedSetlistsCount,
  currentView,
  onViewChange,
  onOpenManager,
  onOpenProjects,
  onOpenSearch,
  onNewSetlist,
  onOpenMusicians,
  onOpenExportImport,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 backdrop-blur-md bg-[#faf8f5]/90 dark:bg-[#141311]/90 border-b border-[#e8e4dc] dark:border-[#272420] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Brand Identity & Current Setlist Indicator */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Boutique Vinyl / Studio Badge Icon */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-stone-950 font-bold shadow-md shadow-amber-500/15 ring-1 ring-amber-400/30 shrink-0">
              <Disc className="w-5 h-5 text-stone-950 stroke-[2.2] animate-[spin_12s_linear_infinite]" />
              <div className="absolute w-2 h-2 rounded-full bg-stone-950/80"></div>
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-stone-900 dark:text-stone-100 truncate">
                  Setlist Studio
                </span>
                {/* Project / Band Selector Badge */}
                <button
                  onClick={onOpenProjects}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide uppercase bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/30 transition-colors"
                  title="Cambiar de banda o gestionar proyectos"
                >
                  <Users className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span className="truncate max-w-[120px]">{activeProject?.name || activeSetlist.bandName || 'Banda'}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              </div>

              {/* Active Setlist dropdown toggle button */}
              <button
                id="header-switch-list-btn"
                onClick={onOpenManager}
                className="group flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors truncate text-left mt-0.5"
                title="Cambiar o gestionar setlists guardados"
              >
                <span className="font-semibold text-stone-800 dark:text-stone-200 group-hover:underline truncate max-w-[130px] sm:max-w-[210px]">
                  {activeSetlist.name || 'Setlist Sin Título'}
                </span>
                <span className="text-[10px] font-mono-stage bg-stone-200/70 dark:bg-stone-800/80 px-1.5 py-0.5 rounded-md text-stone-700 dark:text-stone-300 font-medium">
                  {savedSetlistsCount} {savedSetlistsCount === 1 ? 'lista' : 'listas'}
                </span>
              </button>
            </div>
          </div>

          {/* Navigation Controls & Main CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* View Switcher: Segmented Pill */}
            <div className="flex items-center bg-stone-200/60 dark:bg-[#1f1d1a] p-1 rounded-2xl border border-stone-300/60 dark:border-[#2f2b25]">
              <button
                id="nav-view-editor-btn"
                onClick={() => onViewChange('editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  currentView === 'editor'
                    ? 'bg-white dark:bg-[#2c2823] text-stone-900 dark:text-stone-100 shadow-sm border border-stone-200/80 dark:border-[#3d3730]'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-200'
                }`}
              >
                <ListMusic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Repertorio</span>
                <span className="sm:hidden">Lista</span>
              </button>

              <button
                id="nav-view-sheet-btn"
                onClick={() => onViewChange('sheet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  currentView === 'sheet'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-sm font-black'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hoja Escenario</span>
                <span className="sm:hidden">Hoja</span>
              </button>
            </div>

            {/* Musicians & Arsenal modal button */}
            {onOpenMusicians && (
              <button
                id="header-musicians-btn"
                onClick={onOpenMusicians}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#1f1d1a] hover:bg-stone-100 dark:hover:bg-[#282420] text-stone-700 dark:text-stone-300 border border-stone-300/70 dark:border-[#2f2b25] transition-colors shadow-2xs"
                title="Configurar músicos del grupo y su arsenal de instrumentos"
              >
                <Guitar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden lg:inline">Músicos & Arsenal</span>
              </button>
            )}

            {/* Granular Export / Import Center */}
            {onOpenExportImport && (
              <button
                id="header-export-import-btn"
                onClick={onOpenExportImport}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#1f1d1a] hover:bg-stone-100 dark:hover:bg-[#282420] text-stone-700 dark:text-stone-300 border border-stone-300/70 dark:border-[#2f2b25] transition-colors shadow-2xs"
                title="Centro de Exportación e Importación (Listas, Carpetas, Bandas o Copia General)"
              >
                <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden lg:inline">Respaldos</span>
              </button>
            )}

            {/* Song Search button */}
            <button
              id="header-open-search-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 transition-all shadow-sm active:scale-98"
              title="Buscar y añadir canciones de artistas o composiciones propias"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden md:inline">Buscar Temas</span>
            </button>

            {/* Manage setlists folder */}
            <button
              id="header-manager-btn"
              onClick={onOpenManager}
              className="p-2 text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-[#23201c] rounded-xl transition-colors border border-stone-300/60 dark:border-[#2f2b25]"
              title="Explorar mis listas guardadas"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Dark/Light mode toggle */}
            <button
              id="header-theme-toggle-btn"
              onClick={onToggleDarkMode}
              className="p-2 text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-[#23201c] rounded-xl transition-colors border border-stone-300/60 dark:border-[#2f2b25]"
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
