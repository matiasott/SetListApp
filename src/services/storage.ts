import { 
  Setlist, SongItem, BandProject, SetlistFolder, FullAppBackup, 
  BandExportFile, FolderExportFile, SetlistExportFile 
} from '../types';
import { getDefaultBandMusicians } from '../data/instrumentPresets';

const PROJECTS_STORAGE_KEY = 'setlist_studio_projects_v2';
const ACTIVE_PROJECT_ID_KEY = 'setlist_studio_active_project_id_v2';
const FOLDERS_STORAGE_KEY = 'setlist_studio_folders_v2';
const SETLISTS_STORAGE_KEY = 'setlist_studio_lists_v2';
const ACTIVE_SETLIST_ID_KEY = 'setlist_studio_active_id_v2';

// Legacy keys for automatic migration
const LEGACY_STORAGE_KEY = 'setlist_studio_lists_v1';
const LEGACY_ACTIVE_ID_KEY = 'setlist_studio_active_id_v1';

export const DEFAULT_SAMPLE_PROJECT: BandProject = {
  id: 'proj-vertigos',
  name: 'Los Vértigos',
  genre: 'Rock / Pop Alternativo',
  defaultVenue: 'Teatro Flores / Niceto Club',
  membersNote: 'Voz & Guitarra líder, Bajo & Coros, Guitarra Rítmica, Batería & Secuencias',
  musicians: getDefaultBandMusicians(),
  createdAt: Date.now() - 30 * 86400000,
  updatedAt: Date.now(),
};

export const DEFAULT_SAMPLE_FOLDER: SetlistFolder = {
  id: 'folder-gira-2026',
  projectId: 'proj-vertigos',
  name: 'Gira Grandes Éxitos 2026',
  description: 'Shows oficiales del tour por teatros y festivales',
  color: '#f59e0b',
  createdAt: Date.now() - 25 * 86400000,
  updatedAt: Date.now(),
};

export const DEFAULT_SAMPLE_SETLIST: Setlist = {
  id: 'sample-tour-2026',
  projectId: 'proj-vertigos',
  folderId: 'folder-gira-2026',
  name: 'Show Principal - Teatro Flores',
  bandName: 'Los Vértigos',
  concertDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  venue: 'Teatro Flores / Escenario Principal',
  stageNotes: 'Prueba de sonido 18:00hs. Monitores 1 y 2 con guitarra líder al 70%. Cambio a acústica en tema 4.',
  pageMode: 'single_page',
  blocks: ['Bloque 1: Eléctrico', 'Bloque 2: Acústico', 'Bises'],
  songs: [
    {
      id: 'sample-1',
      title: 'De Música Ligera',
      artist: 'Soda Stereo',
      album: 'Canción Animal',
      durationSec: 212,
      keyNote: 'Bm',
      tuning: 'Estándar (E)',
      bpm: 126,
      notes: 'Intro potente con batería y bajo',
      blockTitle: 'Bloque 1: Eléctrico',
      techDetails: {
        instrumentType: 'guitar',
        musicianName: 'Guitarra Líder & Voz',
        primaryInstrument: 'Fender Stratocaster Sunburst',
        colorHex: '#f59e0b',
        colorName: 'Sunburst / Ámbar',
        backupInstrument: 'Gibson Les Paul Standard',
        stringGauge: '.010 - .046',
        techNotes: 'Selector puente, afinación estándar',
      },
      musicianAssignments: [
        {
          id: 'asgn-1-1',
          musicianName: 'Guitarra Líder & Voz',
          instrumentName: 'Fender Stratocaster Sunburst',
          instrumentNickname: 'La Titular',
          colorHex: '#f59e0b',
          stringGauge: '10 (.010 - .046)',
          tuning: 'Estándar (E)',
        },
        {
          id: 'asgn-1-2',
          musicianName: 'Bajo & Coros',
          instrumentName: 'Fender Jazz Bass (J-Bass)',
          instrumentNickname: 'El Jazz Bass',
          colorHex: '#1c1917',
          stringGauge: '45 (.045 - .105)',
          tuning: 'Bajo Estándar 4C (E A D G)',
        },
        {
          id: 'asgn-1-3',
          musicianName: 'Guitarra Rítmica & Cuerdas',
          instrumentName: 'Fender Telecaster Butterscotch',
          instrumentNickname: 'La Rubia',
          colorHex: '#fde047',
          stringGauge: '10 (.010 - .046)',
          tuning: 'Estándar (E)',
        },
      ],
    },
    {
      id: 'sample-2',
      title: 'Flaca',
      artist: 'Andrés Calamaro',
      album: 'Alta Suciedad',
      durationSec: 287,
      keyNote: 'G',
      tuning: 'Estándar (E)',
      bpm: 96,
      notes: 'Solo de armónica / coros en el estribillo',
      blockTitle: 'Bloque 1: Eléctrico',
      techDetails: {
        instrumentType: 'guitar',
        musicianName: 'Guitarra Líder & Voz',
        primaryInstrument: 'Fender Stratocaster Sunburst',
        colorHex: '#f59e0b',
        backupInstrument: 'Gibson Les Paul Standard',
        stringGauge: '.010 - .046',
        capoFret: 0,
      },
      musicianAssignments: [
        {
          id: 'asgn-2-1',
          musicianName: 'Guitarra Líder & Voz',
          instrumentName: 'Fender Stratocaster Sunburst',
          colorHex: '#f59e0b',
          tuning: 'Estándar (E)',
        },
        {
          id: 'asgn-2-2',
          musicianName: 'Bajo & Coros',
          instrumentName: 'Fender Jazz Bass (J-Bass)',
          colorHex: '#1c1917',
          tuning: 'Bajo Estándar 4C (E A D G)',
        },
      ],
    },
    {
      id: 'sample-3',
      title: 'Ji Ji Ji',
      artist: 'Patricio Rey y sus Redonditos de Ricota',
      album: 'Oktubre',
      durationSec: 334,
      keyNote: 'Am',
      tuning: 'Estándar (E)',
      bpm: 138,
      notes: 'El pogo más grande. Subir volumen guitarras',
      blockTitle: 'Bloque 1: Eléctrico',
      techDetails: {
        instrumentType: 'guitar',
        musicianName: 'Guitarra Líder & Voz',
        primaryInstrument: 'Gibson Les Paul Standard',
        colorHex: '#1c1917',
        colorName: 'Negro / Ébano',
        stringGauge: '.010 - .052 (Heavy Bottom)',
        techNotes: 'Canal Overdrive con Boost',
        hasChangeFromPrev: true,
        changeAlert: 'CAMBIO: Pasa a Gibson Les Paul Standard',
        needsAssistance: true,
        assistanceReason: 'Cambio de guitarra de Stratocaster a Les Paul',
      },
      musicianAssignments: [
        {
          id: 'asgn-3-1',
          musicianName: 'Guitarra Líder & Voz',
          instrumentName: 'Gibson Les Paul Standard',
          instrumentNickname: 'La Negra',
          colorHex: '#1c1917',
          tuning: 'Estándar (E)',
          hasChangeFromPrev: true,
          changeDescription: 'Cambia de Stratocaster a Les Paul Standard',
          needsAssistance: true,
          assistanceNote: 'Alcanzar Les Paul con canal Distorsión listo',
        },
      ],
    },
    {
      id: 'sample-4',
      title: 'Spaghetti del Rock',
      artist: 'Divididos',
      album: 'Narigón del Siglo',
      durationSec: 213,
      keyNote: 'D',
      tuning: 'Drop D',
      bpm: 82,
      notes: 'Set acústico íntimo. Iluminación cálida',
      blockTitle: 'Bloque 2: Acústico',
      techDetails: {
        instrumentType: 'acoustic',
        musicianName: 'Guitarra Líder & Voz',
        primaryInstrument: 'Martin D-28 Dreadnought',
        colorHex: '#d97706',
        colorName: 'Madera Natural',
        backupInstrument: 'Taylor 814ce Acústica',
        stringGauge: '.012 - .053',
        tuningOverride: 'Drop D (D-A-D-G-B-E)',
        techNotes: 'Conectar caja directa canal 4 (D.I.)',
        hasChangeFromPrev: true,
        changeAlert: 'CAMBIO: Pasa a Acústica Martin D-28 [Drop D]',
        needsAssistance: true,
        assistanceReason: 'Alcanzar acústica Martin afinada en Drop D',
      },
      musicianAssignments: [
        {
          id: 'asgn-4-1',
          musicianName: 'Guitarra Líder & Voz',
          instrumentName: 'Martin D-28 Dreadnought',
          instrumentNickname: 'La Acústica',
          colorHex: '#d97706',
          tuning: 'Drop D',
          hasChangeFromPrev: true,
          changeDescription: 'Cambia a Acústica Martin en Drop D',
          needsAssistance: true,
        },
        {
          id: 'asgn-4-3',
          musicianName: 'Guitarra Rítmica & Cuerdas',
          instrumentName: 'Ronroco (Grave / Tradicional)',
          instrumentNickname: 'Ronroco Andino',
          colorHex: '#d97706',
          tuning: 'Estándar Ronroco (D G B E B)',
          hasChangeFromPrev: true,
          changeDescription: 'Cambia de Telecaster a Ronroco',
          needsAssistance: true,
          assistanceNote: 'Alcanzar Ronroco por mic condensador',
        },
      ],
    },
    {
      id: 'sample-5',
      title: 'La bifurcada',
      artist: 'Memphis La Blusera',
      album: 'Nunca Tuve Tanto Blues',
      durationSec: 275,
      keyNote: 'A',
      tuning: 'Estándar (E)',
      bpm: 110,
      notes: 'Vientos y solo de piano',
      blockTitle: 'Bloque 2: Acústico',
      techDetails: {
        instrumentType: 'bass',
        musicianName: 'Bajo & Coros',
        primaryInstrument: 'Fender Jazz Bass (J-Bass)',
        colorHex: '#1c1917',
        backupInstrument: 'Fender Precision Bass',
        stringGauge: '.045 - .105',
        techNotes: 'Groove de bajo marcado',
      },
    },
  ],
  createdAt: Date.now() - 10 * 86400000,
  updatedAt: Date.now(),
};

// FOLDERS STORAGE
export function loadSavedFolders(): SetlistFolder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (!raw) {
      const initial = [DEFAULT_SAMPLE_FOLDER];
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [DEFAULT_SAMPLE_FOLDER];
  } catch (e) {
    console.error('Error loading folders from storage', e);
    return [DEFAULT_SAMPLE_FOLDER];
  }
}

export function saveAllFolders(folders: SetlistFolder[]): void {
  try {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  } catch (e) {
    console.error('Error saving folders to storage', e);
  }
}

export function createNewFolder(projectId: string, name: string, description = '', color = '#3b82f6'): SetlistFolder {
  const newId = `folder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: newId,
    projectId,
    name: name.trim(),
    description: description.trim(),
    color,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// PROJECT STORAGE
export function loadSavedProjects(): BandProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      const initial = [DEFAULT_SAMPLE_PROJECT];
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure musicians array exists on each project
      return parsed.map((p: BandProject) => ({
        ...p,
        musicians: p.musicians && p.musicians.length > 0 ? p.musicians : (p.id === DEFAULT_SAMPLE_PROJECT.id ? getDefaultBandMusicians() : []),
      }));
    }
    return [DEFAULT_SAMPLE_PROJECT];
  } catch (e) {
    console.error('Error loading projects from storage', e);
    return [DEFAULT_SAMPLE_PROJECT];
  }
}

export function saveAllProjects(projects: BandProject[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects to storage', e);
  }
}

export function loadActiveProjectId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
    return id || DEFAULT_SAMPLE_PROJECT.id;
  } catch {
    return DEFAULT_SAMPLE_PROJECT.id;
  }
}

export function saveActiveProjectId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id);
  } catch {
    // ignore
  }
}

export function createNewProject(name: string, genre = ''): BandProject {
  const newId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: newId,
    name: name.trim(),
    genre: genre.trim(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// SETLISTS STORAGE
export function loadSavedSetlists(): Setlist[] {
  try {
    const raw = localStorage.getItem(SETLISTS_STORAGE_KEY);
    if (!raw) {
      // Check legacy key
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const migrated = parsed.map((s: Setlist) => ({
              ...s,
              projectId: s.projectId || DEFAULT_SAMPLE_PROJECT.id,
            }));
            localStorage.setItem(SETLISTS_STORAGE_KEY, JSON.stringify(migrated));
            return migrated;
          }
        } catch {
          // continue to default
        }
      }
      const initial = [DEFAULT_SAMPLE_SETLIST];
      localStorage.setItem(SETLISTS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [DEFAULT_SAMPLE_SETLIST];
  } catch (e) {
    console.error('Error loading setlists from localStorage', e);
    return [DEFAULT_SAMPLE_SETLIST];
  }
}

export function saveAllSetlists(setlists: Setlist[]): void {
  try {
    localStorage.setItem(SETLISTS_STORAGE_KEY, JSON.stringify(setlists));
  } catch (e) {
    console.error('Error saving setlists to localStorage', e);
  }
}

export function loadActiveSetlistId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_SETLIST_ID_KEY);
    if (id) return id;
    const legacyId = localStorage.getItem(LEGACY_ACTIVE_ID_KEY);
    return legacyId || DEFAULT_SAMPLE_SETLIST.id;
  } catch {
    return DEFAULT_SAMPLE_SETLIST.id;
  }
}

export function saveActiveSetlistId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_SETLIST_ID_KEY, id);
  } catch {
    // ignore
  }
}

export function createNewSetlist(name = 'Nuevo Setlist', project?: BandProject, folderId?: string): Setlist {
  const newId = `setlist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: newId,
    projectId: project ? project.id : undefined,
    folderId: folderId || undefined,
    name: name.trim(),
    bandName: project ? project.name : '',
    concertDate: new Date().toISOString().split('T')[0],
    venue: project?.defaultVenue || '',
    stageNotes: '',
    pageMode: 'single_page',
    blocks: ['Bloque 1', 'Bises'],
    songs: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function sanitizeFilename(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_').substring(0, 40);
}

function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. FULL BACKUP EXPORT
export function exportFullBackupJSON(
  projects: BandProject[], 
  folders: SetlistFolder[], 
  setlists: Setlist[], 
  activeProjectId?: string, 
  activeSetlistId?: string
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const backup: FullAppBackup = {
    exportType: 'full_backup',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    appName: 'Setlist Studio',
    projects,
    folders,
    setlists,
    activeProjectId,
    activeSetlistId,
  };
  const filename = `Backup_General_Todas_Las_Bandas_${dateStr}.json`;
  triggerDownload(JSON.stringify(backup, null, 2), filename);
}

// 2. BAND EXPORT
export function exportBandJSON(
  project: BandProject, 
  allFolders: SetlistFolder[], 
  allSetlists: Setlist[]
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const bandFolders = allFolders.filter(f => f.projectId === project.id);
  const bandSetlists = allSetlists.filter(s => s.projectId === project.id || s.bandName === project.name);
  
  const payload: BandExportFile = {
    exportType: 'band',
    exportedAt: new Date().toISOString(),
    appName: 'Setlist Studio',
    project,
    folders: bandFolders,
    setlists: bandSetlists,
  };
  const filename = `Banda_${sanitizeFilename(project.name)}_Completa_${dateStr}.json`;
  triggerDownload(JSON.stringify(payload, null, 2), filename);
}

// 3. FOLDER / TOUR EXPORT
export function exportFolderJSON(
  folder: SetlistFolder, 
  bandName: string, 
  allSetlists: Setlist[]
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const folderSetlists = allSetlists.filter(s => s.folderId === folder.id);

  const payload: FolderExportFile = {
    exportType: 'folder',
    exportedAt: new Date().toISOString(),
    appName: 'Setlist Studio',
    bandName,
    folder,
    setlists: folderSetlists,
  };
  const filename = `Carpeta_${sanitizeFilename(folder.name)}_${sanitizeFilename(bandName)}_${dateStr}.json`;
  triggerDownload(JSON.stringify(payload, null, 2), filename);
}

// 4. SINGLE SETLIST EXPORT
export function exportSingleSetlistJSON(
  setlist: Setlist, 
  bandName: string, 
  folderName?: string
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const payload: SetlistExportFile = {
    exportType: 'setlist',
    exportedAt: new Date().toISOString(),
    appName: 'Setlist Studio',
    bandName: bandName || setlist.bandName || 'Banda',
    folderName: folderName,
    setlist,
  };
  const filename = `Setlist_${sanitizeFilename(setlist.name)}_${sanitizeFilename(bandName || 'Banda')}_${dateStr}.json`;
  triggerDownload(JSON.stringify(payload, null, 2), filename);
}

export interface ImportInspectionResult {
  type: 'full_backup' | 'band' | 'folder' | 'setlist' | 'legacy';
  title: string;
  summary: string;
  itemCounts: {
    bands: number;
    folders: number;
    setlists: number;
    songs: number;
    musicians: number;
  };
  data: any;
}

export function inspectImportFile(fileContent: string): ImportInspectionResult {
  let parsed: any;
  try {
    parsed = JSON.parse(fileContent);
  } catch (err) {
    throw new Error('El archivo no tiene un formato JSON válido.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('El archivo no contiene un objeto válido de Setlist Studio.');
  }

  // 1. Check if Single Setlist
  if (parsed.exportType === 'setlist' && parsed.setlist) {
    const s = parsed.setlist as Setlist;
    const songCount = s.songs ? s.songs.length : 0;
    return {
      type: 'setlist',
      title: `Setlist Individual: "${s.name}"`,
      summary: `Contiene 1 lista de temas para la banda "${parsed.bandName || s.bandName || 'Sin especificar'}" con ${songCount} canciones.`,
      itemCounts: { bands: 0, folders: 0, setlists: 1, songs: songCount, musicians: 0 },
      data: parsed,
    };
  }

  // 2. Check if Folder / Tour
  if (parsed.exportType === 'folder' && parsed.folder) {
    const f = parsed.folder as SetlistFolder;
    const listCount = Array.isArray(parsed.setlists) ? parsed.setlists.length : 0;
    const totalSongs = Array.isArray(parsed.setlists) 
      ? parsed.setlists.reduce((acc: number, item: Setlist) => acc + (item.songs?.length || 0), 0)
      : 0;
    return {
      type: 'folder',
      title: `Carpeta / Gira: "${f.name}"`,
      summary: `Carpeta de la banda "${parsed.bandName || 'Banda'}" con ${listCount} listas de temas (${totalSongs} canciones en total).`,
      itemCounts: { bands: 0, folders: 1, setlists: listCount, songs: totalSongs, musicians: 0 },
      data: parsed,
    };
  }

  // 3. Check if Band
  if (parsed.exportType === 'band' && parsed.project) {
    const p = parsed.project as BandProject;
    const fCount = Array.isArray(parsed.folders) ? parsed.folders.length : 0;
    const sCount = Array.isArray(parsed.setlists) ? parsed.setlists.length : 0;
    const mCount = p.musicians ? p.musicians.length : 0;
    const totalSongs = Array.isArray(parsed.setlists)
      ? parsed.setlists.reduce((acc: number, item: Setlist) => acc + (item.songs?.length || 0), 0)
      : 0;
    return {
      type: 'band',
      title: `Banda Completa: "${p.name}"`,
      summary: `Proyecto completo con ${mCount} músicos y su arsenal, ${fCount} carpetas y ${sCount} listas (${totalSongs} temas).`,
      itemCounts: { bands: 1, folders: fCount, setlists: sCount, songs: totalSongs, musicians: mCount },
      data: parsed,
    };
  }

  // 4. Check if Full App Backup
  if (Array.isArray(parsed.projects) || parsed.exportType === 'full_backup') {
    const pCount = Array.isArray(parsed.projects) ? parsed.projects.length : 0;
    const fCount = Array.isArray(parsed.folders) ? parsed.folders.length : 0;
    const sCount = Array.isArray(parsed.setlists) ? parsed.setlists.length : 0;
    const totalMusicians = Array.isArray(parsed.projects)
      ? parsed.projects.reduce((acc: number, item: BandProject) => acc + (item.musicians?.length || 0), 0)
      : 0;
    const totalSongs = Array.isArray(parsed.setlists)
      ? parsed.setlists.reduce((acc: number, item: Setlist) => acc + (item.songs?.length || 0), 0)
      : 0;
    return {
      type: 'full_backup',
      title: `Copia de Seguridad General (Todas las Bandas)`,
      summary: `Backup total del sistema con ${pCount} bandas, ${fCount} carpetas, ${sCount} listas y ${totalSongs} canciones.`,
      itemCounts: { bands: pCount, folders: fCount, setlists: sCount, songs: totalSongs, musicians: totalMusicians },
      data: parsed,
    };
  }

  // 5. Legacy Array of Setlists
  if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.title === undefined) {
    return {
      type: 'legacy',
      title: `Listas de Temas (Formato V1)`,
      summary: `Contiene ${parsed.length} listas en formato anterior.`,
      itemCounts: { bands: 0, folders: 0, setlists: parsed.length, songs: 0, musicians: 0 },
      data: parsed,
    };
  }

  throw new Error('El archivo no coincide con ninguna estructura conocida de Setlist Studio.');
}

export function executeImport(
  inspection: ImportInspectionResult,
  existingProjects: BandProject[],
  existingFolders: SetlistFolder[],
  existingSetlists: Setlist[],
  targetProjectId?: string,
  targetFolderId?: string
): {
  projects: BandProject[];
  folders: SetlistFolder[];
  setlists: Setlist[];
  activeProjectId: string;
  activeSetlistId: string;
  message: string;
} {
  const timestamp = Date.now();

  if (inspection.type === 'setlist') {
    const rawSetlist = inspection.data.setlist as Setlist;
    const destProjectId = targetProjectId || existingProjects[0]?.id || DEFAULT_SAMPLE_PROJECT.id;
    const targetProject = existingProjects.find(p => p.id === destProjectId);
    
    const newSetlist: Setlist = {
      ...rawSetlist,
      id: `setlist-${timestamp}-${Math.random().toString(36).substring(2, 6)}`,
      projectId: destProjectId,
      bandName: targetProject?.name || rawSetlist.bandName || 'Banda',
      folderId: targetFolderId || undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const nextSetlists = [newSetlist, ...existingSetlists];
    return {
      projects: existingProjects,
      folders: existingFolders,
      setlists: nextSetlists,
      activeProjectId: destProjectId,
      activeSetlistId: newSetlist.id,
      message: `Setlist "${newSetlist.name}" importado exitosamente a "${targetProject?.name || 'Banda'}".`,
    };
  }

  if (inspection.type === 'folder') {
    const rawFolder = inspection.data.folder as SetlistFolder;
    const rawSetlists = (inspection.data.setlists || []) as Setlist[];
    const destProjectId = targetProjectId || existingProjects[0]?.id || DEFAULT_SAMPLE_PROJECT.id;
    const targetProject = existingProjects.find(p => p.id === destProjectId);

    const newFolderId = `folder-${timestamp}-${Math.random().toString(36).substring(2, 6)}`;
    const newFolder: SetlistFolder = {
      ...rawFolder,
      id: newFolderId,
      projectId: destProjectId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const newSetlists = rawSetlists.map(s => ({
      ...s,
      id: `setlist-${timestamp}-${Math.random().toString(36).substring(2, 6)}`,
      projectId: destProjectId,
      bandName: targetProject?.name || s.bandName,
      folderId: newFolderId,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    const nextFolders = [newFolder, ...existingFolders];
    const nextSetlists = [...newSetlists, ...existingSetlists];
    return {
      projects: existingProjects,
      folders: nextFolders,
      setlists: nextSetlists,
      activeProjectId: destProjectId,
      activeSetlistId: newSetlists[0]?.id || existingSetlists[0]?.id,
      message: `Carpeta "${newFolder.name}" importada con ${newSetlists.length} listas en "${targetProject?.name || 'Banda'}".`,
    };
  }

  if (inspection.type === 'band') {
    const rawBand = inspection.data.project as BandProject;
    const rawFolders = (inspection.data.folders || []) as SetlistFolder[];
    const rawSetlists = (inspection.data.setlists || []) as Setlist[];

    const newBandId = `proj-${timestamp}-${Math.random().toString(36).substring(2, 6)}`;
    const newBand: BandProject = {
      ...rawBand,
      id: newBandId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Map old folder IDs to new folder IDs
    const folderIdMap = new Map<string, string>();
    const newFolders = rawFolders.map(f => {
      const nid = `folder-${timestamp}-${Math.random().toString(36).substring(2, 6)}`;
      folderIdMap.set(f.id, nid);
      return {
        ...f,
        id: nid,
        projectId: newBandId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });

    const newSetlists = rawSetlists.map(s => ({
      ...s,
      id: `setlist-${timestamp}-${Math.random().toString(36).substring(2, 6)}`,
      projectId: newBandId,
      bandName: newBand.name,
      folderId: s.folderId ? (folderIdMap.get(s.folderId) || undefined) : undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    const nextProjects = [newBand, ...existingProjects];
    const nextFolders = [...newFolders, ...existingFolders];
    const nextSetlists = [...newSetlists, ...existingSetlists];

    return {
      projects: nextProjects,
      folders: nextFolders,
      setlists: nextSetlists,
      activeProjectId: newBandId,
      activeSetlistId: newSetlists[0]?.id || existingSetlists[0]?.id,
      message: `Banda "${newBand.name}" importada con ${newFolders.length} carpetas y ${newSetlists.length} listas.`,
    };
  }

  if (inspection.type === 'full_backup') {
    const incomingProjects = (inspection.data.projects || []) as BandProject[];
    const incomingFolders = (inspection.data.folders || []) as SetlistFolder[];
    const incomingSetlists = (inspection.data.setlists || []) as Setlist[];

    const nextProjects = incomingProjects.length > 0 ? incomingProjects : existingProjects;
    const nextFolders = incomingFolders;
    const nextSetlists = incomingSetlists.length > 0 ? incomingSetlists : existingSetlists;
    const nextActiveProjectId = inspection.data.activeProjectId || nextProjects[0]?.id;
    const nextActiveSetlistId = inspection.data.activeSetlistId || nextSetlists[0]?.id;

    return {
      projects: nextProjects,
      folders: nextFolders,
      setlists: nextSetlists,
      activeProjectId: nextActiveProjectId,
      activeSetlistId: nextActiveSetlistId,
      message: `Copia de seguridad general restaurada (${nextProjects.length} bandas, ${nextSetlists.length} listas).`,
    };
  }

  // Legacy fallback
  const parsedBackup = parseBackupFile(JSON.stringify(inspection.data));
  return {
    projects: parsedBackup.projects,
    folders: existingFolders,
    setlists: parsedBackup.setlists,
    activeProjectId: parsedBackup.activeProjectId || parsedBackup.projects[0]?.id,
    activeSetlistId: parsedBackup.activeSetlistId || parsedBackup.setlists[0]?.id,
    message: 'Datos heredados importados correctamente.',
  };
}

export function parseBackupFile(fileContent: string): { 
  projects: BandProject[]; 
  folders?: SetlistFolder[]; 
  setlists: Setlist[]; 
  activeProjectId?: string; 
  activeSetlistId?: string;
} {
  const data = JSON.parse(fileContent);
  if (!data || typeof data !== 'object') {
    throw new Error('El archivo no tiene formato JSON válido.');
  }

  let projects: BandProject[] = [];
  let setlists: Setlist[] = [];
  let folders: SetlistFolder[] = [];

  // Version 2.0 or legacy checks
  if (Array.isArray(data.projects)) {
    projects = data.projects;
  }
  if (Array.isArray(data.folders)) {
    folders = data.folders;
  }
  if (Array.isArray(data.setlists)) {
    setlists = data.setlists;
  } else if (Array.isArray(data)) {
    // Array of setlists directly
    setlists = data;
  }

  if (projects.length === 0 && setlists.length > 0) {
    // Generate projects from band names
    const bandNames = Array.from(new Set(setlists.map((s) => s.bandName).filter(Boolean)));
    if (bandNames.length > 0) {
      projects = bandNames.map((name) => ({
        id: `proj-${Math.random().toString(36).substring(2, 8)}`,
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
      // Link setlists
      setlists = setlists.map((s) => {
        const found = projects.find((p) => p.name === s.bandName);
        return found ? { ...s, projectId: found.id } : s;
      });
    } else {
      projects = [DEFAULT_SAMPLE_PROJECT];
    }
  }

  return {
    projects: projects.length > 0 ? projects : [DEFAULT_SAMPLE_PROJECT],
    folders: folders.length > 0 ? folders : undefined,
    setlists: setlists.length > 0 ? setlists : [DEFAULT_SAMPLE_SETLIST],
    activeProjectId: data.activeProjectId || projects[0]?.id,
    activeSetlistId: data.activeSetlistId || setlists[0]?.id,
  };
}

// RESET ALL TO ZERO
export function resetAppToZero(): { projects: BandProject[]; folders: SetlistFolder[]; setlists: Setlist[]; activeProjectId: string; activeSetlistId: string } {
  localStorage.removeItem(PROJECTS_STORAGE_KEY);
  localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
  localStorage.removeItem(FOLDERS_STORAGE_KEY);
  localStorage.removeItem(SETLISTS_STORAGE_KEY);
  localStorage.removeItem(ACTIVE_SETLIST_ID_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  localStorage.removeItem(LEGACY_ACTIVE_ID_KEY);

  const cleanProject: BandProject = {
    id: `proj-nuevo-${Date.now()}`,
    name: 'Mi Banda',
    musicians: getDefaultBandMusicians(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const cleanFolder: SetlistFolder = {
    id: `folder-nuevo-${Date.now()}`,
    projectId: cleanProject.id,
    name: 'Repertorio Principal',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const cleanSetlist: Setlist = {
    id: `setlist-nuevo-${Date.now()}`,
    projectId: cleanProject.id,
    folderId: cleanFolder.id,
    name: 'Primer Setlist',
    bandName: cleanProject.name,
    concertDate: new Date().toISOString().split('T')[0],
    venue: '',
    stageNotes: '',
    pageMode: 'single_page',
    blocks: ['Bloque 1', 'Bises'],
    songs: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  saveAllProjects([cleanProject]);
  saveActiveProjectId(cleanProject.id);
  saveAllFolders([cleanFolder]);
  saveAllSetlists([cleanSetlist]);
  saveActiveSetlistId(cleanSetlist.id);

  return {
    projects: [cleanProject],
    folders: [cleanFolder],
    setlists: [cleanSetlist],
    activeProjectId: cleanProject.id,
    activeSetlistId: cleanSetlist.id,
  };
}
