import React, { useState } from 'react';
import { 
  Users, Music2, Plus, ArrowRight, Sparkles, FolderKanban, 
  Disc, Check, Calendar, ChevronRight, Upload, Trash2
} from 'lucide-react';
import { BandProject, Setlist } from '../types';

interface ProjectSelectorWelcomeProps {
  projects: BandProject[];
  activeProjectId: string;
  setlists: Setlist[];
  onSelectProjectAndList: (projectId: string, listId?: string) => void;
  onCreateProjectAndList: (bandName: string, genre: string, listName: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onImportBackup: (content: string) => void;
}

export const ProjectSelectorWelcome: React.FC<ProjectSelectorWelcomeProps> = ({
  projects,
  activeProjectId,
  setlists,
  onSelectProjectAndList,
  onCreateProjectAndList,
  onDeleteProject,
  onImportBackup,
}) => {
  const [mode, setMode] = useState<'pick' | 'create'>('pick');
  const [bandName, setBandName] = useState('');
  const [genre, setGenre] = useState('');
  const [listName, setListName] = useState('Repertorio Principal');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bandName.trim()) return;
    onCreateProjectAndList(bandName.trim(), genre.trim(), listName.trim() || 'Lista 1');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#fffdfa] dark:bg-[#181614] rounded-3xl shadow-2xl border border-stone-200/90 dark:border-[#2e2a25] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Banner Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-stone-900 via-stone-900 to-[#1e1a17] text-white flex items-start justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-3">
              <Disc className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>SETLIST STUDIO • WORKSPACE</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-stone-100 tracking-tight">
              ¿Con qué banda o artista vas a trabajar hoy?
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm mt-1.5 max-w-xl">
              Organiza los proyectos de cada agrupación, gestiona múltiples listas guardadas y prepara hojas de escenario A4 con notas de técnicos.
            </p>
          </div>

          <div className="hidden sm:block shrink-0 pl-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-semibold border border-white/20 transition-all"
              title="Cargar archivo de respaldo JSON de proyectos previos"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Importar copia</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle: Seleccionar existente vs Crear nuevo */}
        <div className="flex border-b border-stone-200 dark:border-[#28241f] bg-stone-50 dark:bg-[#151412] px-6 pt-3 gap-3">
          <button
            onClick={() => setMode('pick')}
            className={`pb-3 text-xs sm:text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 ${
              mode === 'pick'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Mis Bandas ({projects.length})</span>
          </button>

          <button
            onClick={() => setMode('create')}
            className={`pb-3 text-xs sm:text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 ${
              mode === 'create'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Crear Nueva Banda / Proyecto</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {mode === 'pick' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {projects.map((proj) => {
                  const projSetlists = setlists.filter(s => s.projectId === proj.id || s.bandName === proj.name);
                  const isCurrent = proj.id === activeProjectId;

                  return (
                    <div
                      key={proj.id}
                      className={`p-4 rounded-2xl border transition-all text-left group hover:border-amber-500/80 ${
                        isCurrent
                          ? 'bg-amber-50/70 dark:bg-[#231f1a] border-amber-400 dark:border-amber-600 shadow-sm'
                          : 'bg-white dark:bg-[#1b1916] border-stone-200 dark:border-[#2d2822]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-display font-extrabold text-base text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {proj.name}
                            </h3>
                            {isCurrent && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Activo" />
                            )}
                          </div>
                          {proj.genre && (
                            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                              {proj.genre}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 font-bold border border-stone-200 dark:border-stone-800">
                            {projSetlists.length} {projSetlists.length === 1 ? 'lista' : 'listas'}
                          </span>

                          {onDeleteProject && (
                            confirmDeleteId === proj.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 p-1 rounded-xl border border-rose-200 dark:border-rose-900/60 z-10">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteProject(proj.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2 py-0.5 text-[10px] font-black bg-rose-600 text-white rounded-md hover:bg-rose-700"
                                >
                                  Borrar
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-1.5 py-0.5 text-[10px] text-stone-600 dark:text-stone-300 font-bold"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(proj.id);
                                }}
                                className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                                title="Eliminar este proyecto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Setlists belonging to this project */}
                      <div className="mt-3 pt-3 border-t border-stone-100 dark:border-[#24211d] space-y-1.5">
                        {projSetlists.length > 0 ? (
                          projSetlists.map((sl) => (
                            <button
                              key={sl.id}
                              onClick={() => onSelectProjectAndList(proj.id, sl.id)}
                              className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-amber-100/60 dark:hover:bg-[#2c2721] text-stone-700 dark:text-stone-300 transition-colors group/item"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Music2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="font-semibold truncate">{sl.name}</span>
                              </div>
                              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono-stage group-hover/item:text-stone-700 dark:group-hover/item:text-stone-200 flex items-center gap-1 shrink-0">
                                {sl.songs.length} temas <ChevronRight className="w-3 h-3" />
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="text-xs text-stone-400 py-1 italic">
                            Sin listas aún.
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2">
                        <button
                          onClick={() => onSelectProjectAndList(proj.id, projSetlists[0]?.id)}
                          className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <span>Entrar a {proj.name}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile backup import button */}
              <div className="sm:hidden pt-4 text-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-stone-500 dark:text-stone-400 underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-500" />
                  <span>Importar archivo de respaldo (.json)</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} className="max-w-lg mx-auto space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Nombre de la Banda o Artista *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={bandName}
                  onChange={(e) => setBandName(e.target.value)}
                  placeholder="Ej. Soda Stereo, Los Auténticos, Cuarteto Acústico..."
                  className="w-full px-4 py-2.5 text-sm font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none ring-2 ring-amber-500/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Género o Estilo Musical
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Ej. Rock / Pop / Indie / Folklore..."
                  className="w-full px-4 py-2 text-xs bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Nombre de la Primera Lista (Setlist)
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Ej. Gira 2026, Show Teatros, Acústico..."
                  className="w-full px-4 py-2 text-xs bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setMode('pick')}
                  className="px-4 py-2 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                  Volver a mis bandas
                </button>
                <button
                  type="submit"
                  disabled={!bandName.trim()}
                  className="px-5 py-2.5 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md transition-all disabled:opacity-50"
                >
                  Crear Proyecto y Comenzar
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
