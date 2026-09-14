import React, { useState } from 'react';
import { 
  X, Plus, Search, Calendar, MapPin, Music, Copy, Trash2, 
  Check, FileDown, Clock, FolderOpen, AlertTriangle, Disc3,
  Filter, Users, ArrowUpDown, Tag, Download
} from 'lucide-react';
import { Setlist, BandProject, SetlistFolder } from '../types';
import { formatTotalDuration } from '../services/musicSearch';
import { exportSetlistToPDF } from '../services/pdfExport';
import { exportSingleSetlistJSON, exportFolderJSON } from '../services/storage';

interface SetlistManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  setlists: Setlist[];
  folders?: SetlistFolder[];
  projects?: BandProject[];
  activeProjectId?: string;
  activeSetlistId: string;
  onSelectSetlist: (id: string) => void;
  onCreateNewSetlist: (name: string, folderId?: string) => void;
  onDuplicateSetlist: (setlist: Setlist) => void;
  onDeleteSetlist: (id: string) => void;
  onCreateFolder?: (name: string, description?: string) => void;
  onAssignFolder?: (setlistId: string, folderId?: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onOpenProjectModal?: () => void;
}

export const SetlistManagerModal: React.FC<SetlistManagerModalProps> = ({
  isOpen,
  onClose,
  setlists,
  folders = [],
  projects = [],
  activeProjectId,
  activeSetlistId,
  onSelectSetlist,
  onCreateNewSetlist,
  onDuplicateSetlist,
  onDeleteSetlist,
  onCreateFolder,
  onAssignFolder,
  onDeleteFolder,
  onOpenProjectModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newListName, setNewListName] = useState('');
  const [selectedFolderForNewList, setSelectedFolderForNewList] = useState<string>('');
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [showCreateFolderInput, setShowCreateFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedBandFilter, setSelectedBandFilter] = useState<string>('all');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');

  if (!isOpen) return null;

  // Active project details
  const activeProj = projects.find((p) => p.id === activeProjectId);
  const bandFolders = folders.filter((f) => f.projectId === activeProjectId);

  // Filtered lists
  const filteredSetlists = setlists.filter((list) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      list.name.toLowerCase().includes(term) ||
      list.bandName.toLowerCase().includes(term) ||
      list.venue.toLowerCase().includes(term)
    );

    if (!matchesSearch) return false;

    // Band filter
    if (selectedBandFilter === 'current' && activeProjectId) {
      if (list.projectId !== activeProjectId && list.bandName !== activeProj?.name) return false;
    } else if (selectedBandFilter !== 'all') {
      if (list.projectId !== selectedBandFilter && list.bandName !== selectedBandFilter) return false;
    }

    // Folder filter
    if (selectedFolderFilter === 'none') {
      if (list.folderId) return false;
    } else if (selectedFolderFilter !== 'all') {
      if (list.folderId !== selectedFolderFilter) return false;
    }

    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newListName.trim();
    if (!trimmed) return;
    onCreateNewSetlist(trimmed, selectedFolderForNewList || undefined);
    setNewListName('');
    setShowCreateInput(false);
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed || !onCreateFolder) return;
    onCreateFolder(trimmed);
    setNewFolderName('');
    setShowCreateFolderInput(false);
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-[#fcfbf9] dark:bg-[#181614] rounded-3xl shadow-2xl border border-stone-200/90 dark:border-[#2e2a25] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/90 dark:border-[#2b2722] flex items-center justify-between bg-white dark:bg-[#1d1a17]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                  Carpetas y Listas de Temas
                </h2>
                {activeProj && (
                  <span className="hidden sm:inline text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/80">
                    Banda: {activeProj.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {setlists.length} {setlists.length === 1 ? 'repertorio guardado' : 'repertorios guardados'} • {bandFolders.length} carpetas de gira
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenProjectModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenProjectModal();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors"
                title="Cambiar de banda / proyecto"
              >
                <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Ver Bandas</span>
              </button>
            )}

            <button
              id="close-manager-modal-btn"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-[#28241f] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar & Actions */}
        <div className="p-4 border-b border-stone-200/70 dark:border-[#27231e] space-y-3 bg-stone-50/50 dark:bg-[#1b1916]">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search filter input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="manager-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre de lista, banda o sala..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Quick band tabs/filter */}
            {projects.length > 0 && (
              <div className="flex items-center gap-1 bg-white dark:bg-[#151412] p-1 rounded-xl border border-stone-300 dark:border-stone-700 shrink-0 overflow-x-auto text-xs">
                <button
                  onClick={() => setSelectedBandFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    selectedBandFilter === 'all'
                      ? 'bg-amber-500 text-stone-950 shadow-2xs font-black'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Todas ({setlists.length})
                </button>
                {activeProj && (
                  <button
                    onClick={() => setSelectedBandFilter('current')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all truncate max-w-[130px] ${
                      selectedBandFilter === 'current'
                        ? 'bg-amber-500 text-stone-950 shadow-2xs font-black'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                    title={`Filtrar solo listas de ${activeProj.name}`}
                  >
                    {activeProj.name}
                  </button>
                )}
              </div>
            )}

            {/* Actions: New Folder & New Setlist */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onCreateFolder && (
                <button
                  onClick={() => setShowCreateFolderInput(!showCreateFolderInput)}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#201c18] border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 transition-all active:scale-98"
                  title="Crear una nueva carpeta / gira para agrupar setlists"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>+ Carpeta / Gira</span>
                </button>
              )}

              <button
                id="manager-create-new-toggle-btn"
                onClick={() => setShowCreateInput(!showCreateInput)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-xs transition-all active:scale-98"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nuevo Setlist</span>
              </button>
            </div>
          </div>

          {/* Folder Filter Pill Row */}
          {bandFolders.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
              <span className="text-stone-400 text-[11px] font-bold shrink-0">Carpeta:</span>
              <button
                onClick={() => setSelectedFolderFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all shrink-0 ${
                  selectedFolderFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-[#1a1815] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
                }`}
              >
                Todas las carpetas
              </button>

              {bandFolders.map((f) => {
                const count = setlists.filter(s => s.folderId === f.id).length;
                const isSel = selectedFolderFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFolderFilter(f.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all shrink-0 ${
                      isSel
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-[#1a1815] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <span>📁 {f.name}</span>
                    <span className="text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}

              <button
                onClick={() => setSelectedFolderFilter('none')}
                className={`px-2 py-1 rounded-lg font-medium text-[11px] transition-all shrink-0 ${
                  selectedFolderFilter === 'none'
                    ? 'bg-stone-700 text-white'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                Sin carpeta
              </button>
            </div>
          )}

          {/* Inline Create Folder Form */}
          {showCreateFolderInput && (
            <form onSubmit={handleCreateFolderSubmit} className="flex gap-2 p-2.5 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-300 dark:border-blue-800 animate-in fade-in">
              <input
                type="text"
                required
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nombre de la nueva carpeta / gira (ej. Gira Teatros 2026, Festivales de Verano)..."
                className="flex-1 px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 rounded-xl border border-blue-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-black rounded-xl bg-blue-600 text-white hover:bg-blue-500"
              >
                Crear Carpeta
              </button>
              <button
                type="button"
                onClick={() => setShowCreateFolderInput(false)}
                className="px-2 text-xs text-stone-500"
              >
                Cancelar
              </button>
            </form>
          )}

          {/* Inline Create Setlist Form */}
          {showCreateInput && (
            <form onSubmit={handleCreateSubmit} className="flex flex-col sm:flex-row gap-2 p-2.5 bg-amber-500/10 rounded-2xl border border-amber-300 dark:border-amber-600/40 animate-in fade-in">
              <input
                id="new-setlist-name-input"
                type="text"
                required
                autoFocus
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder={`Nombre de lista para ${activeProj ? activeProj.name : 'tu banda'}...`}
                className="flex-1 px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 rounded-xl border border-amber-500 focus:outline-none"
              />

              {/* Optional folder picker */}
              {bandFolders.length > 0 && (
                <select
                  value={selectedFolderForNewList}
                  onChange={(e) => setSelectedFolderForNewList(e.target.value)}
                  className="text-xs p-1.5 bg-white dark:bg-[#151412] border border-amber-400 rounded-xl text-stone-900 dark:text-stone-100 font-bold"
                >
                  <option value="">📁 En la raíz (sin carpeta)</option>
                  {bandFolders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 Carpeta: {f.name}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex gap-1.5">
                <button
                  id="confirm-create-setlist-btn"
                  type="submit"
                  disabled={!newListName.trim()}
                  className="px-4 py-1.5 text-xs font-black rounded-xl bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 hover:bg-stone-800 disabled:opacity-50"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateInput(false)}
                  className="px-2 text-xs text-stone-500"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Setlists Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredSetlists.length === 0 && (
            <div className="py-12 text-center text-stone-400">
              <Music className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
              <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                No se encontraron listas en esta vista
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {searchTerm ? 'Prueba con otro término de búsqueda' : 'Crea tu primera lista para comenzar'}
              </p>
            </div>
          )}

          {filteredSetlists.map((list) => {
            const isActive = list.id === activeSetlistId;
            const songCount = list.songs.filter((s) => !s.isBreak && !s.isEncore).length;
            const encoreCount = list.songs.filter((s) => s.isEncore).length;
            const totalDuration = list.songs.reduce((acc, s) => acc + (s.durationSec || 0), 0);
            const isConfirming = confirmDeleteId === list.id;
            const currentFolder = folders.find((f) => f.id === list.folderId);

            return (
              <div
                key={list.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-amber-50/70 dark:bg-[#231f1a] border-amber-400 dark:border-amber-600/70 shadow-sm'
                    : 'bg-white dark:bg-[#1d1a17] hover:bg-stone-50/70 dark:hover:bg-[#221e1a] border-stone-200/90 dark:border-[#2e2a25]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Info & Folder Badge */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-extrabold text-base text-stone-900 dark:text-stone-100 truncate">
                        {list.name}
                      </h3>
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-stone-950">
                          Abierto en edición
                        </span>
                      )}
                      
                      {/* Folder indicator */}
                      {currentFolder ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-300/60">
                          📁 {currentFolder.name}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                      {list.bandName || 'Sin banda definida'}
                    </p>

                    <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs text-stone-500 dark:text-stone-400 flex-wrap">
                      {list.concertDate && (
                        <span className="flex items-center gap-1 font-mono-stage text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {list.concertDate}
                        </span>
                      )}

                      {list.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          {list.venue}
                        </span>
                      )}

                      <span className="flex items-center gap-1 font-mono-stage text-[11px]">
                        <Music className="w-3.5 h-3.5 text-stone-400" />
                        {songCount} {songCount === 1 ? 'tema' : 'temas'} {encoreCount > 0 ? `+ ${encoreCount} bises` : ''} ({formatTotalDuration(totalDuration)})
                      </span>
                    </div>

                    {/* Move to folder dropdown if folders exist */}
                    {onAssignFolder && bandFolders.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-stone-400">
                        <span className="text-[10px]">Mover a:</span>
                        <select
                          value={list.folderId || ''}
                          onChange={(e) => onAssignFolder(list.id, e.target.value || undefined)}
                          className="text-[11px] py-0.5 px-2 bg-stone-100 dark:bg-[#201c18] border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300"
                        >
                          <option value="">📁 Sin carpeta</option>
                          {bandFolders.map((f) => (
                            <option key={f.id} value={f.id}>
                              📁 {f.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    
                    {/* Select / Open button */}
                    <button
                      onClick={() => {
                        onSelectSetlist(list.id);
                        onClose();
                      }}
                      className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-black'
                          : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-xs active:scale-95'
                      }`}
                    >
                      {isActive ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : null}
                      <span>{isActive ? 'Activo' : 'Cargar lista'}</span>
                    </button>

                    {/* Quick export JSON for this single list */}
                    <button
                      onClick={() => exportSingleSetlistJSON(list, list.bandName || 'Banda', currentFolder?.name)}
                      className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#28241f] transition-colors"
                      title="Exportar archivo JSON de esta lista individual"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Quick export PDF */}
                    <button
                      onClick={() => exportSetlistToPDF(list)}
                      className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#28241f] transition-colors"
                      title="Descargar PDF de esta lista"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>

                    {/* Duplicate button */}
                    <button
                      onClick={() => onDuplicateSetlist(list)}
                      className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#28241f] transition-colors"
                      title="Duplicar como plantilla"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Delete button with safety confirm */}
                    {setlists.length > 1 && (
                      <>
                        {isConfirming ? (
                          <div className="flex items-center gap-1 bg-rose-100 dark:bg-rose-950/60 p-1 rounded-xl">
                            <button
                              onClick={() => {
                                onDeleteSetlist(list.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2.5 py-1 text-[11px] font-black bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                            >
                              Borrar
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-1 text-[11px] text-stone-600 dark:text-stone-300 font-bold"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(list.id)}
                            className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Eliminar lista"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}

                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200/90 dark:border-[#2b2722] bg-white dark:bg-[#1d1a17] flex items-center justify-between text-xs text-stone-500">
          <span>Tus listas y carpetas se guardan automáticamente en tu navegador.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 font-bold hover:bg-stone-800 dark:hover:bg-amber-400 transition-colors"
          >
            Aceptar
          </button>
        </div>

      </div>
    </div>
  );
};

