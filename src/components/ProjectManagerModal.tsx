import React, { useState, useRef } from 'react';
import { 
  X, Plus, Users, Music2, FolderOpen, Download, Upload, 
  Trash2, RefreshCw, Check, AlertTriangle, FileText, ChevronRight, Edit3,
  Guitar, Database
} from 'lucide-react';
import { BandProject, Setlist, SetlistFolder } from '../types';
import { exportBandJSON } from '../services/storage';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: BandProject[];
  activeProjectId: string;
  setlists: Setlist[];
  folders?: SetlistFolder[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, genre?: string) => void;
  onUpdateProject: (projectId: string, updates: Partial<BandProject>) => void;
  onDeleteProject: (projectId: string) => void;
  onExportAll: () => void;
  onImportBackup: (fileContent: string) => void;
  onResetAll: () => void;
  onOpenMusicians?: (projectId: string) => void;
  onOpenExportImport?: () => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  setlists,
  folders = [],
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onExportAll,
  onImportBackup,
  onResetAll,
  onOpenMusicians,
  onOpenExportImport,
}) => {
  const [newBandName, setNewBandName] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGenre, setEditGenre] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBandName.trim()) return;
    onCreateProject(newBandName.trim(), newGenre.trim());
    setNewBandName('');
    setNewGenre('');
    setShowCreateForm(false);
  };

  const handleStartEdit = (proj: BandProject) => {
    setEditingProjectId(proj.id);
    setEditName(proj.name);
    setEditGenre(proj.genre || '');
  };

  const handleSaveEdit = (projectId: string) => {
    if (!editName.trim()) return;
    onUpdateProject(projectId, {
      name: editName.trim(),
      genre: editGenre.trim() || undefined,
    });
    setEditingProjectId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        onImportBackup(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#fcfbf9] dark:bg-[#181614] rounded-3xl shadow-2xl border border-stone-200/90 dark:border-[#2e2a25] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200/90 dark:border-[#2b2722] flex items-center justify-between bg-white dark:bg-[#1d1a17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                Proyectos (Bandas y Artistas)
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Selecciona la banda con la que vas a trabajar para ver sus listas y repertorios
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-[#28241f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toolbar: Create Band, Export, Import, Reset */}
        <div className="p-4 sm:p-5 border-b border-stone-200/70 dark:border-[#27231e] bg-stone-50/50 dark:bg-[#1b1916] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-xs transition-all active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Crear Nuevo Proyecto / Banda</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Granular Center */}
              {onOpenExportImport && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenExportImport();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 text-xs font-bold transition-colors shadow-2xs"
                  title="Abrir centro de exportación e importación granular por carpetas, bandas o general"
                >
                  <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Centro de Respaldos</span>
                </button>
              )}

              {/* Export Full Backup */}
              <button
                onClick={onExportAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#221e1a] text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-300/80 dark:border-stone-700 text-xs font-bold transition-colors shadow-2xs"
                title="Exportar archivo de seguridad con todos los proyectos y setlists"
              >
                <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Exportar Todo</span>
              </button>

              {/* Import Backup */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#221e1a] text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-300/80 dark:border-stone-700 text-xs font-bold transition-colors shadow-2xs"
                title="Importar un archivo de respaldo JSON generado previamente"
              >
                <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Importar</span>
              </button>
            </div>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <form onSubmit={handleCreate} className="p-3 bg-white dark:bg-[#151412] rounded-2xl border border-amber-400/80 dark:border-amber-600/70 shadow-xs space-y-2.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  autoFocus
                  value={newBandName}
                  onChange={(e) => setNewBandName(e.target.value)}
                  placeholder="Nombre de la Banda o Artista *"
                  className="w-full text-xs font-bold bg-stone-50 dark:bg-[#1e1a17] text-stone-900 dark:text-stone-100 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  placeholder="Género o estilo (opcional)"
                  className="w-full text-xs bg-stone-50 dark:bg-[#1e1a17] text-stone-900 dark:text-stone-100 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newBandName.trim()}
                  className="px-4 py-1.5 text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl disabled:opacity-50"
                >
                  Guardar Banda
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            const projSetlists = setlists.filter((s) => s.projectId === proj.id || s.bandName === proj.name);
            const isEditing = editingProjectId === proj.id;
            const isConfirming = confirmDeleteId === proj.id;

            return (
              <div
                key={proj.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-amber-50/70 dark:bg-[#231f1a] border-amber-400 dark:border-amber-600/70 shadow-sm'
                    : 'bg-white dark:bg-[#1d1a17] hover:bg-stone-50/70 dark:hover:bg-[#221e1a] border-stone-200/90 dark:border-[#2e2a25]'
                }`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-xs font-bold bg-white dark:bg-[#151412] p-2 rounded-xl border border-amber-500 text-stone-900 dark:text-stone-100"
                      />
                      <input
                        type="text"
                        value={editGenre}
                        onChange={(e) => setEditGenre(e.target.value)}
                        placeholder="Género musical"
                        className="text-xs bg-white dark:bg-[#151412] p-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingProjectId(null)}
                        className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(proj.id)}
                        className="px-3 py-1 text-xs font-black bg-amber-500 text-stone-950 rounded-xl"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Project info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-extrabold text-base text-stone-900 dark:text-stone-100 truncate">
                          {proj.name}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-stone-950">
                            Proyecto Actual
                          </span>
                        )}
                        {proj.genre && (
                          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-[#25221d] text-stone-600 dark:text-stone-400 font-semibold border border-stone-200 dark:border-stone-800">
                            {proj.genre}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                        <span className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400">
                          <Music2 className="w-3.5 h-3.5" />
                          {projSetlists.length} {projSetlists.length === 1 ? 'lista guardada' : 'listas guardadas'}
                        </span>
                        {projSetlists.length > 0 && (
                          <span className="text-stone-400 dark:text-stone-600">
                            • {projSetlists.map(s => s.name).slice(0, 2).join(', ')}{projSetlists.length > 2 ? '...' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {/* Manage Musicians & Arsenal */}
                      {onOpenMusicians && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenMusicians(proj.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#28241f] dark:hover:bg-[#332e27] text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors"
                          title="Gestionar integrantes y su arsenal de instrumentos para esta banda"
                        >
                          <Guitar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span className="hidden md:inline">Músicos</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 font-black">
                            {proj.musicians?.length || 0}
                          </span>
                        </button>
                      )}

                      {/* Export Band JSON */}
                      <button
                        onClick={() => {
                          const projFolders = folders.filter((f) => f.projectId === proj.id);
                          exportBandJSON(proj, projSetlists, projFolders);
                        }}
                        className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#28241f] rounded-xl transition-colors"
                        title="Exportar archivo JSON completo de esta banda (incluye listas, carpetas y músicos)"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleStartEdit(proj)}
                        className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-[#28241f]"
                        title="Editar nombre o detalles de la banda"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Select Project Button */}
                      <button
                        onClick={() => {
                          onSelectProject(proj.id);
                          onClose();
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-black'
                            : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-xs active:scale-95'
                        }`}
                      >
                        {isActive ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                        <span>{isActive ? 'Seleccionado' : 'Elegir esta banda'}</span>
                      </button>

                      {/* Delete Project (Allowed for any project) */}
                      {isConfirming ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/80 p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs">
                          <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 pl-1">
                            ¿Borrar {projSetlists.length > 0 ? `con ${projSetlists.length} listas` : 'banda'}?
                          </span>
                          <button
                            onClick={() => {
                              onDeleteProject(proj.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1 text-[11px] font-black bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-2xs"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-[11px] text-stone-600 dark:text-stone-300 hover:text-stone-900 font-bold"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(proj.id)}
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                          title="Eliminar este proyecto de banda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: Reset App to Zero option & Accept */}
        <div className="p-4 sm:p-5 border-t border-stone-200/90 dark:border-[#2b2722] bg-white dark:bg-[#1d1a17] flex flex-wrap items-center justify-between gap-3">
          
          {/* Reset App to Zero */}
          <div>
            {showResetConfirm ? (
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-300 dark:border-rose-900/60 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-rose-800 dark:text-rose-300 font-bold">¿Borrar todo y volver a cero?</span>
                <button
                  onClick={() => {
                    onResetAll();
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-1 bg-rose-600 text-white font-black rounded-lg hover:bg-rose-700"
                >
                  Sí, reiniciar
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 text-stone-600 dark:text-stone-300 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-rose-600 transition-colors"
                title="Llevar la aplicación a cero y eliminar todos los datos almacenados"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Llevar app a cero (Reiniciar todo)</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 text-xs font-bold hover:bg-stone-800 dark:hover:bg-amber-400 transition-colors"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
