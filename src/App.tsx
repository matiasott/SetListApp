import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SetlistInfoCard } from './components/SetlistInfoCard';
import { SetlistSongsEditor } from './components/SetlistSongsEditor';
import { StageSheetView } from './components/StageSheetView';
import { SongSearchDrawer } from './components/SongSearchDrawer';
import { SetlistManagerModal } from './components/SetlistManagerModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { ProjectSelectorWelcome } from './components/ProjectSelectorWelcome';
import { BandMusiciansModal } from './components/BandMusiciansModal';
import { GranularExportImportModal } from './components/GranularExportImportModal';
import { Setlist, SongItem, BandProject, SetlistFolder, BandMusician } from './types';
import { 
  loadSavedProjects, saveAllProjects, loadActiveProjectId, saveActiveProjectId,
  createNewProject, loadSavedSetlists, saveAllSetlists, loadActiveSetlistId, 
  saveActiveSetlistId, createNewSetlist, exportFullBackupJSON, parseBackupFile,
  resetAppToZero, loadSavedFolders, saveAllFolders, createNewFolder,
  DEFAULT_SAMPLE_PROJECT, DEFAULT_SAMPLE_SETLIST
} from './services/storage';
import { Check } from 'lucide-react';

export default function App() {
  // Projects State
  const [projects, setProjects] = useState<BandProject[]>(() => loadSavedProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() => loadActiveProjectId());

  // Folders State
  const [folders, setFolders] = useState<SetlistFolder[]>(() => loadSavedFolders());

  // Setlists State
  const [setlists, setSetlists] = useState<Setlist[]>(() => loadSavedSetlists());
  const [activeSetlistId, setActiveSetlistId] = useState<string>(() => loadActiveSetlistId());

  // Views & Modals
  const [currentView, setCurrentView] = useState<'editor' | 'sheet'>('editor');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMusiciansModalOpen, setIsMusiciansModalOpen] = useState(false);
  const [musiciansProjectId, setMusiciansProjectId] = useState<string>(activeProjectId);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);

  const [showWelcomeSelector, setShowWelcomeSelector] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('setlist_studio_session_started');
    } catch {
      return false;
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('setlist_studio_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('setlist_studio_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('setlist_studio_theme', 'light');
    }
  }, [darkMode]);

  // Persist projects
  useEffect(() => {
    saveAllProjects(projects);
  }, [projects]);

  // Persist folders
  useEffect(() => {
    saveAllFolders(folders);
  }, [folders]);

  // Persist active project ID
  useEffect(() => {
    saveActiveProjectId(activeProjectId);
  }, [activeProjectId]);

  // Persist setlists
  useEffect(() => {
    saveAllSetlists(setlists);
  }, [setlists]);

  // Persist active setlist ID
  useEffect(() => {
    saveActiveSetlistId(activeSetlistId);
  }, [activeSetlistId]);

  // Active Project & Setlist lookup
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || DEFAULT_SAMPLE_PROJECT;
  const activeSetlist = setlists.find((s) => s.id === activeSetlistId) || setlists[0] || DEFAULT_SAMPLE_SETLIST;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3000);
  };

  // Switch Active Project
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    const targetProj = projects.find(p => p.id === projectId);

    // Find any setlist belonging to this project
    const projectSetlist = setlists.find(s => s.projectId === projectId || (targetProj && s.bandName === targetProj.name));
    if (projectSetlist) {
      setActiveSetlistId(projectSetlist.id);
    } else if (targetProj) {
      // Create a default first setlist for this project if none exists
      const newList = createNewSetlist('Repertorio 1', targetProj);
      setSetlists(prev => [newList, ...prev]);
      setActiveSetlistId(newList.id);
    }
    showToast(`Proyecto cambiado a: "${targetProj?.name || 'Banda'}"`);
  };

  // Welcome selector action (Select existing project and optional setlist)
  const handleWelcomeSelect = (projectId: string, listId?: string) => {
    setActiveProjectId(projectId);
    if (listId) {
      setActiveSetlistId(listId);
    } else {
      handleSelectProject(projectId);
    }
    try {
      sessionStorage.setItem('setlist_studio_session_started', 'true');
    } catch {
      // ignore
    }
    setShowWelcomeSelector(false);
  };

  // Welcome selector action (Create brand new project + first setlist)
  const handleWelcomeCreate = (bandName: string, genre: string, listName: string) => {
    const newProj = createNewProject(bandName, genre);
    const newList = createNewSetlist(listName, newProj);
    
    setProjects(prev => [newProj, ...prev]);
    setActiveProjectId(newProj.id);

    setSetlists(prev => [newList, ...prev]);
    setActiveSetlistId(newList.id);

    try {
      sessionStorage.setItem('setlist_studio_session_started', 'true');
    } catch {
      // ignore
    }
    setShowWelcomeSelector(false);
    showToast(`¡Proyecto "${newProj.name}" creado con éxito!`);
  };

  // Create Project
  const handleCreateProject = (name: string, genre?: string) => {
    const newProj = createNewProject(name, genre);
    const newList = createNewSetlist('Lista 1', newProj);

    setProjects(prev => [newProj, ...prev]);
    setActiveProjectId(newProj.id);

    setSetlists(prev => [newList, ...prev]);
    setActiveSetlistId(newList.id);

    showToast(`Proyecto "${newProj.name}" creado`);
  };

  // Update Project
  const handleUpdateProject = (projectId: string, updates: Partial<BandProject>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates, updatedAt: Date.now() } : p));
    // If name changed, update corresponding setlist bandName
    if (updates.name) {
      setSetlists(prev => prev.map(s => s.projectId === projectId ? { ...s, bandName: updates.name! } : s));
    }
    showToast('Proyecto actualizado');
  };

  // Delete Project (Can delete any project; removes its setlists and sets next active project)
  const handleDeleteProject = (projectId: string) => {
    const targetProject = projects.find(p => p.id === projectId);
    const projectName = targetProject?.name || 'Proyecto';
    
    // Remove setlists associated with this project
    const remainingSetlists = setlists.filter(s => s.projectId !== projectId);
    const remainingProjects = projects.filter(p => p.id !== projectId);

    if (remainingProjects.length === 0) {
      // If user deleted the last project, create a fresh clean workspace
      const freshProject = createNewProject('Mi Banda', 'Rock');
      const freshSetlist = createNewSetlist('Lista 1', freshProject);
      setProjects([freshProject]);
      setActiveProjectId(freshProject.id);
      setSetlists([freshSetlist]);
      setActiveSetlistId(freshSetlist.id);
      showToast(`Proyecto "${projectName}" eliminado. Se creó un nuevo proyecto en blanco.`);
      return;
    }

    setProjects(remainingProjects);

    // If active project was deleted, switch to the first remaining one
    if (activeProjectId === projectId) {
      const nextProj = remainingProjects[0];
      setActiveProjectId(nextProj.id);
      const nextList = remainingSetlists.find(s => s.projectId === nextProj.id || s.bandName === nextProj.name);
      if (nextList) {
        setSetlists(remainingSetlists);
        setActiveSetlistId(nextList.id);
      } else {
        const newList = createNewSetlist('Lista 1', nextProj);
        setSetlists([newList, ...remainingSetlists]);
        setActiveSetlistId(newList.id);
      }
    } else {
      setSetlists(remainingSetlists);
    }

    showToast(`Proyecto "${projectName}" eliminado`);
  };

  // Folders handlers
  const handleCreateFolder = (name: string, description?: string) => {
    const newF = createNewFolder(activeProjectId, name, description);
    setFolders((prev) => [newF, ...prev]);
    showToast(`Carpeta "${name}" creada`);
  };

  const handleAssignFolder = (setlistId: string, folderId?: string) => {
    setSetlists((prev) =>
      prev.map((s) =>
        s.id === setlistId
          ? { ...s, folderId: folderId || undefined, updatedAt: Date.now() }
          : s
      )
    );
    showToast('Carpeta del setlist actualizada');
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setSetlists((prev) =>
      prev.map((s) =>
        s.folderId === folderId ? { ...s, folderId: undefined, updatedAt: Date.now() } : s
      )
    );
    showToast('Carpeta eliminada');
  };

  // Musicians Modal handlers
  const handleOpenMusicians = (projectId?: string) => {
    const pId = projectId || activeProjectId;
    setMusiciansProjectId(pId);
    setIsMusiciansModalOpen(true);
  };

  const handleSaveBandMusicians = (updatedMusicians: BandMusician[]) => {
    const targetProjId = musiciansProjectId || activeProjectId;
    handleUpdateProject(targetProjId, { musicians: updatedMusicians });
    showToast('Músicos y arsenal técnico guardados');
  };

  // Update Active Setlist
  const handleUpdateActiveSetlist = (updates: Partial<Setlist>) => {
    setSetlists((prev) =>
      prev.map((s) =>
        s.id === activeSetlist.id
          ? { ...s, ...updates, updatedAt: Date.now() }
          : s
      )
    );
  };

  const handleUpdateSongs = (songs: SongItem[]) => {
    handleUpdateActiveSetlist({ songs });
  };

  const handleAddSong = (song: SongItem) => {
    handleUpdateActiveSetlist({
      songs: [...activeSetlist.songs, song],
    });
    showToast(`"${song.title}" agregada al setlist`);
  };

  const handleCreateNewSetlist = (name: string) => {
    const newList = createNewSetlist(name, activeProject);
    setSetlists((prev) => [newList, ...prev]);
    setActiveSetlistId(newList.id);
    showToast(`Setlist "${name}" creado exitosamente`);
  };

  const handleDuplicateSetlist = (source: Setlist) => {
    const duplicated: Setlist = {
      ...source,
      id: `copy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${source.name} (Copia)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      songs: source.songs.map((song) => ({
        ...song,
        id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      })),
    };
    setSetlists((prev) => [duplicated, ...prev]);
    setActiveSetlistId(duplicated.id);
    showToast(`Copia creada: "${duplicated.name}"`);
  };

  const handleDeleteSetlist = (idToDelete: string) => {
    if (setlists.length <= 1) return;
    const remaining = setlists.filter((s) => s.id !== idToDelete);
    setSetlists(remaining);
    if (activeSetlistId === idToDelete) {
      setActiveSetlistId(remaining[0].id);
    }
    showToast('Setlist eliminado');
  };

  // Export Full App Backup JSON
  const handleExportAll = () => {
    exportFullBackupJSON(projects, setlists, activeProjectId, activeSetlistId, folders);
    showToast('Archivo de respaldo exportado correctamente');
  };

  // Import Full App Backup JSON
  const handleImportBackup = (fileContent: string) => {
    try {
      const parsed = parseBackupFile(fileContent);
      setProjects(parsed.projects);
      setSetlists(parsed.setlists);
      if (parsed.folders) setFolders(parsed.folders);
      if (parsed.activeProjectId) {
        setActiveProjectId(parsed.activeProjectId);
        setMusiciansProjectId(parsed.activeProjectId);
      }
      if (parsed.activeSetlistId) setActiveSetlistId(parsed.activeSetlistId);
      
      saveAllProjects(parsed.projects);
      if (parsed.folders) saveAllFolders(parsed.folders);
      saveAllSetlists(parsed.setlists);

      try {
        sessionStorage.setItem('setlist_studio_session_started', 'true');
      } catch {
        // ignore
      }
      setShowWelcomeSelector(false);
      showToast('¡Copia de respaldo importada con éxito!');
    } catch (err) {
      console.error(err);
      alert('Error al importar el archivo. Verifica que sea un JSON de respaldo válido de Setlist Studio.');
    }
  };

  // Reset App to Zero
  const handleResetAll = () => {
    const resetData = resetAppToZero();
    setProjects(resetData.projects);
    setFolders([]);
    setSetlists(resetData.setlists);
    setActiveProjectId(resetData.activeProjectId);
    setMusiciansProjectId(resetData.activeProjectId);
    setActiveSetlistId(resetData.activeSetlistId);
    setCurrentView('editor');
    setIsProjectModalOpen(false);
    setIsManagerOpen(false);
    setIsMusiciansModalOpen(false);
    setIsExportImportModalOpen(false);
    showToast('Aplicación reiniciada a cero.');
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-[#12110f] text-stone-900 dark:text-stone-100 transition-colors selection:bg-amber-500 selection:text-stone-950 font-sans">
      
      {/* Navigation Header */}
      <Header
        activeSetlist={activeSetlist}
        activeProject={activeProject}
        savedSetlistsCount={setlists.length}
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenManager={() => setIsManagerOpen(true)}
        onOpenProjects={() => setIsProjectModalOpen(true)}
        onOpenMusicians={() => handleOpenMusicians(activeProjectId)}
        onOpenExportImport={() => setIsExportImportModalOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNewSetlist={() => handleCreateNewSetlist('Nuevo Setlist')}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {currentView === 'editor' ? (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Concert Details & Band Info Card */}
            <SetlistInfoCard
              setlist={activeSetlist}
              onUpdate={handleUpdateActiveSetlist}
              onOpenSearch={() => setIsSearchOpen(true)}
              onViewSheet={() => setCurrentView('sheet')}
            />

            {/* Song List & Reordering Editor */}
            <SetlistSongsEditor
              setlist={activeSetlist}
              onUpdateSetlist={handleUpdateActiveSetlist}
              songs={activeSetlist.songs}
              onUpdateSongs={handleUpdateSongs}
              onOpenSearch={() => setIsSearchOpen(true)}
              bandMusicians={activeProject.musicians || []}
            />
          </div>
        ) : (
          <div className="animate-in fade-in duration-150">
            {/* Stage Sheet & PDF Print View */}
            <StageSheetView
              setlist={activeSetlist}
              bandMusicians={activeProject.musicians || []}
              onUpdateSetlist={handleUpdateActiveSetlist}
              onBackToEditor={() => setCurrentView('editor')}
            />
          </div>
        )}

      </main>

      {/* Music Search Drawer */}
      <SongSearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAddSong={handleAddSong}
        existingSongTitles={activeSetlist.songs.map((s) => s.title.toLowerCase())}
      />

      {/* Setlist Manager Modal (Saved Lists & Folders) */}
      <SetlistManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        setlists={setlists}
        projects={projects}
        folders={folders}
        activeProjectId={activeProjectId}
        activeSetlistId={activeSetlist.id}
        onSelectSetlist={(id) => setActiveSetlistId(id)}
        onCreateNewSetlist={handleCreateNewSetlist}
        onDuplicateSetlist={handleDuplicateSetlist}
        onDeleteSetlist={handleDeleteSetlist}
        onCreateFolder={handleCreateFolder}
        onAssignFolder={handleAssignFolder}
        onDeleteFolder={handleDeleteFolder}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
      />

      {/* Project Manager Modal (Band Projects, Musicians, Export/Import, Reset) */}
      <ProjectManagerModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projects={projects}
        folders={folders}
        activeProjectId={activeProjectId}
        setlists={setlists}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onOpenMusicians={handleOpenMusicians}
        onOpenExportImport={() => setIsExportImportModalOpen(true)}
        onExportAll={handleExportAll}
        onImportBackup={handleImportBackup}
        onResetAll={handleResetAll}
      />

      {/* Musician Arsenal Modal (Guitars, Strings, Tunings per Musician) */}
      <BandMusiciansModal
        isOpen={isMusiciansModalOpen}
        onClose={() => setIsMusiciansModalOpen(false)}
        bandName={projects.find(p => p.id === musiciansProjectId)?.name || activeProject.name}
        musicians={projects.find(p => p.id === musiciansProjectId)?.musicians || activeProject.musicians || []}
        onSaveMusicians={handleSaveBandMusicians}
      />

      {/* Granular Export/Import Modal (Per Band, Folder, Setlist, or All) */}
      <GranularExportImportModal
        isOpen={isExportImportModalOpen}
        onClose={() => setIsExportImportModalOpen(false)}
        projects={projects}
        folders={folders}
        setlists={setlists}
        activeProjectId={activeProjectId}
        activeSetlistId={activeSetlist.id}
        onApplyImportResult={(res) => {
          setProjects(res.projects);
          setFolders(res.folders);
          setSetlists(res.setlists);
          setActiveProjectId(res.activeProjectId);
          setMusiciansProjectId(res.activeProjectId);
          setActiveSetlistId(res.activeSetlistId);
          saveAllProjects(res.projects);
          saveAllFolders(res.folders);
          saveAllSetlists(res.setlists);
          showToast(res.message);
        }}
      />

      {/* Initial Project Selector Welcome (Pick band/artist upon starting) */}
      {showWelcomeSelector && (
        <ProjectSelectorWelcome
          projects={projects}
          activeProjectId={activeProjectId}
          setlists={setlists}
          onSelectProjectAndList={handleWelcomeSelect}
          onCreateProjectAndList={handleWelcomeCreate}
          onDeleteProject={handleDeleteProject}
          onImportBackup={handleImportBackup}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-stone-900 dark:bg-[#fffdfa] text-white dark:text-stone-950 px-4 py-3 rounded-2xl shadow-xl border border-stone-700 dark:border-stone-300 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-amber-400 dark:text-amber-600 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
