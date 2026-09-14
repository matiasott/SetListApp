import React, { useState, useRef } from 'react';
import { 
  X, Download, Upload, FolderOpen, Music, Users, 
  Database, FileText, CheckCircle2, AlertCircle, ArrowRight,
  ShieldCheck, Info, FileCode2
} from 'lucide-react';
import { BandProject, SetlistFolder, Setlist } from '../types';
import { 
  exportFullBackupJSON, exportBandJSON, exportFolderJSON, exportSingleSetlistJSON,
  inspectImportFile, executeImport, ImportInspectionResult
} from '../services/storage';

interface GranularExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: BandProject[];
  folders: SetlistFolder[];
  setlists: Setlist[];
  activeProjectId: string;
  activeSetlistId: string;
  onApplyImportResult: (result: {
    projects: BandProject[];
    folders: SetlistFolder[];
    setlists: Setlist[];
    activeProjectId: string;
    activeSetlistId: string;
    message: string;
  }) => void;
}

export const GranularExportImportModal: React.FC<GranularExportImportModalProps> = ({
  isOpen,
  onClose,
  projects,
  folders,
  setlists,
  activeProjectId,
  activeSetlistId,
  onApplyImportResult,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  
  // Export selectors
  const [selectedFolderIdForExport, setSelectedFolderIdForExport] = useState<string>(
    folders.find(f => f.projectId === activeProjectId)?.id || folders[0]?.id || ''
  );
  const [selectedSetlistIdForExport, setSelectedSetlistIdForExport] = useState<string>(
    activeSetlistId || setlists[0]?.id || ''
  );

  // Import flow state
  const [importInspection, setImportInspection] = useState<ImportInspectionResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [targetProjectIdForImport, setTargetProjectIdForImport] = useState<string>(activeProjectId);
  const [targetFolderIdForImport, setTargetFolderIdForImport] = useState<string>('');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const currentSetlist = setlists.find(s => s.id === activeSetlistId) || setlists[0];
  const currentBandFolders = folders.filter(f => f.projectId === currentProject?.id);
  const currentBandSetlists = setlists.filter(s => s.projectId === currentProject?.id || s.bandName === currentProject?.name);

  // Handle file selection for inspection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string;
        const inspection = inspectImportFile(content);
        setImportInspection(inspection);
      } catch (err: any) {
        setImportError(err.message || 'Error al procesar el archivo JSON.');
        setImportInspection(null);
      }
    };
    reader.onerror = () => {
      setImportError('No se pudo leer el archivo seleccionado.');
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Confirm import execution
  const handleConfirmImport = () => {
    if (!importInspection) return;

    try {
      const result = executeImport(
        importInspection,
        projects,
        folders,
        setlists,
        targetProjectIdForImport,
        targetFolderIdForImport
      );

      onApplyImportResult(result);
      setImportSuccessMsg(result.message);
      setImportInspection(null);
    } catch (err: any) {
      setImportError(err.message || 'Error al importar datos.');
    }
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-[#fcfbf9] dark:bg-[#181614] rounded-3xl shadow-2xl border border-stone-200/90 dark:border-[#2e2a25] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/90 dark:border-[#2b2722] flex items-center justify-between bg-white dark:bg-[#1d1a17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                Centro de Exportación e Importación
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Guarda o transfiere archivos claros por Lista individual, Carpeta de gira, Banda completa o Copia general
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

        {/* Tab switcher: Exportar vs Importar */}
        <div className="p-3 bg-stone-100 dark:bg-[#141210] border-b border-stone-200 dark:border-[#27231e] flex gap-2">
          <button
            onClick={() => {
              setActiveTab('export');
              setImportInspection(null);
              setImportError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>1. Exportar Archivos (Guardar)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('import');
              setImportError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>2. Importar Archivo (Cargar)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50 dark:bg-[#181614]">
          
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              
              {/* Option 1: Full Backup */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1f1b17] border border-stone-200/90 dark:border-[#2d2822] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
                      <Database className="w-4 h-4" />
                    </span>
                    <h3 className="font-display font-black text-sm text-stone-900 dark:text-stone-100">
                      Copia de Seguridad General (Todas las Bandas)
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Exporta todos los proyectos ({projects.length}), carpetas ({folders.length}) y repertorios ({setlists.length}).
                  </p>
                  <p className="text-[11px] font-mono text-stone-400">
                    Archivo: <strong className="text-stone-600 dark:text-stone-300">Backup_General_Todas_Las_Bandas_[FECHA].json</strong>
                  </p>
                </div>

                <button
                  onClick={() => exportFullBackupJSON(projects, folders, setlists, activeProjectId, activeSetlistId)}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 font-bold text-xs hover:bg-stone-800 dark:hover:bg-amber-400 transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar General</span>
                </button>
              </div>

              {/* Option 2: Band Export */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1f1b17] border border-stone-200/90 dark:border-[#2d2822] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
                      <Users className="w-4 h-4" />
                    </span>
                    <h3 className="font-display font-black text-sm text-stone-900 dark:text-stone-100">
                      Banda Completa: "{currentProject.name}"
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Exporta los {currentProject.musicians?.length || 0} músicos con su arsenal, {currentBandFolders.length} carpetas y {currentBandSetlists.length} listas asociadas.
                  </p>
                  <p className="text-[11px] font-mono text-stone-400">
                    Archivo: <strong className="text-stone-600 dark:text-stone-300">Banda_{currentProject.name.replace(/\s+/g, '_')}_Completa_[FECHA].json</strong>
                  </p>
                </div>

                <button
                  onClick={() => exportBandJSON(currentProject, folders, setlists)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Exportar Banda</span>
                </button>
              </div>

              {/* Option 3: Folder / Tour Export */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1f1b17] border border-stone-200/90 dark:border-[#2d2822] shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <FolderOpen className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-display font-black text-sm text-stone-900 dark:text-stone-100">
                      Carpeta o Gira Específica
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Exporta una carpeta completa de la banda con todos los setlists organizados en ella
                    </p>
                  </div>
                </div>

                {currentBandFolders.length > 0 ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                    <select
                      value={selectedFolderIdForExport}
                      onChange={(e) => setSelectedFolderIdForExport(e.target.value)}
                      className="flex-1 text-xs font-bold p-2.5 rounded-xl bg-stone-50 dark:bg-[#141210] border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
                    >
                      {currentBandFolders.map((f) => {
                        const inCount = setlists.filter(s => s.folderId === f.id).length;
                        return (
                          <option key={f.id} value={f.id}>
                            📁 {f.name} ({inCount} {inCount === 1 ? 'lista' : 'listas'})
                          </option>
                        );
                      })}
                    </select>

                    <button
                      onClick={() => {
                        const fold = folders.find(f => f.id === selectedFolderIdForExport);
                        if (fold) {
                          exportFolderJSON(fold, currentProject.name, setlists);
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar Carpeta</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">
                    No hay carpetas creadas en esta banda todavía. Puedes crearlas en el administrador de listas.
                  </p>
                )}
              </div>

              {/* Option 4: Single Setlist Export */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1f1b17] border border-stone-200/90 dark:border-[#2d2822] shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Music className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-display font-black text-sm text-stone-900 dark:text-stone-100">
                      Setlist / Lista Individual
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Exporta únicamente una lista individual para compartirla o respaldarla
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  <select
                    value={selectedSetlistIdForExport}
                    onChange={(e) => setSelectedSetlistIdForExport(e.target.value)}
                    className="flex-1 text-xs font-bold p-2.5 rounded-xl bg-stone-50 dark:bg-[#141210] border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
                  >
                    {setlists.map((s) => (
                      <option key={s.id} value={s.id}>
                        🎵 {s.name} ({s.bandName || 'Sin banda'}) - {s.songs?.length || 0} temas
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      const s = setlists.find(l => l.id === selectedSetlistIdForExport);
                      if (s) {
                        const folder = folders.find(f => f.id === s.folderId);
                        exportSingleSetlistJSON(s, currentProject.name, folder?.name);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar Lista</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              
              {/* File upload prompt */}
              <div className="p-6 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-3xl text-center bg-white dark:bg-[#1b1916]">
                <FileCode2 className="w-10 h-10 mx-auto text-amber-500 mb-2" />
                <h3 className="font-display font-black text-sm sm:text-base text-stone-900 dark:text-stone-100">
                  Selecciona el archivo de Setlist Studio (.json)
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
                  El sistema detectará automáticamente si es una <strong>Banda Completa</strong>, una <strong>Carpeta de Gira</strong>, un <strong>Setlist Individual</strong> o un <strong>Backup General</strong>.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-xs"
                >
                  Examinar Archivo JSON...
                </button>
              </div>

              {/* Error box */}
              {importError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Error en el archivo</strong>
                    <span>{importError}</span>
                  </div>
                </div>
              )}

              {/* Success notification */}
              {importSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <strong className="block font-bold">¡Operación exitosa!</strong>
                    <span>{importSuccessMsg}</span>
                  </div>
                </div>
              )}

              {/* Inspection preview card */}
              {importInspection && (
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1f1b17] border-2 border-amber-500/80 shadow-md space-y-4 animate-in fade-in">
                  
                  <div className="flex items-start justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                        {importInspection.type === 'full_backup' ? 'Backup General' :
                         importInspection.type === 'band' ? 'Banda Completa' :
                         importInspection.type === 'folder' ? 'Carpeta / Gira' : 'Setlist Individual'}
                      </span>
                      <h4 className="font-display font-extrabold text-base text-stone-900 dark:text-stone-100 mt-1">
                        {importInspection.title}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                        {importInspection.summary}
                      </p>
                    </div>

                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  </div>

                  {/* Destination chooser depending on type */}
                  {(importInspection.type === 'setlist' || importInspection.type === 'folder') && (
                    <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-300/80 dark:border-amber-600/40 space-y-2.5">
                      <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                        ¿En qué banda deseas guardar este contenido?
                      </label>
                      <select
                        value={targetProjectIdForImport}
                        onChange={(e) => setTargetProjectIdForImport(e.target.value)}
                        className="w-full text-xs font-bold p-2 bg-white dark:bg-[#141210] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            Banda: {p.name}
                          </option>
                        ))}
                      </select>

                      {importInspection.type === 'setlist' && (
                        <div>
                          <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                            Guardar dentro de una carpeta (opcional):
                          </label>
                          <select
                            value={targetFolderIdForImport}
                            onChange={(e) => setTargetFolderIdForImport(e.target.value)}
                            className="w-full text-xs p-2 bg-white dark:bg-[#141210] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                          >
                            <option value="">Sin carpeta (Repertorio raíz)</option>
                            {folders
                              .filter((f) => f.projectId === targetProjectIdForImport)
                              .map((f) => (
                                <option key={f.id} value={f.id}>
                                  📁 {f.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {importInspection.type === 'band' && (
                    <div className="p-3 bg-stone-100 dark:bg-[#141210] rounded-xl text-xs text-stone-600 dark:text-stone-400">
                      Se creará una nueva banda en tu catálogo con todos sus músicos, instrumentos registrados, carpetas y listas intactas.
                    </div>
                  )}

                  {importInspection.type === 'full_backup' && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-900 dark:text-amber-300 border border-amber-300">
                      ⚠️ Esta acción restaurará la copia general del sistema con todas las bandas y listas incluidas en el archivo.
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setImportInspection(null)}
                      className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-sm flex items-center gap-1.5"
                    >
                      <span>Confirmar e Importar</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/90 dark:border-[#2b2722] bg-white dark:bg-[#1d1a17] flex items-center justify-between">
          <span className="text-xs text-stone-500">
            {projects.length} bandas • {folders.length} carpetas • {setlists.length} listas
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 text-xs font-bold hover:bg-stone-800 dark:hover:bg-amber-400"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
