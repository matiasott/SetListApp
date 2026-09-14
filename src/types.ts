// Color definitions for instrument tags
export interface InstrumentColor {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  hex: string;
}

export const INSTRUMENT_COLORS: InstrumentColor[] = [
  { id: 'red', name: 'Rojo Carmesí / Fiesta Red', bgClass: 'bg-red-500/15', textClass: 'text-red-700 dark:text-red-300', borderClass: 'border-red-500/40', hex: '#ef4444' },
  { id: 'amber', name: 'Sunburst / Ámbar / Tabaco', bgClass: 'bg-amber-500/15', textClass: 'text-amber-800 dark:text-amber-300', borderClass: 'border-amber-500/40', hex: '#f59e0b' },
  { id: 'blue', name: 'Azul Pelham / Sonic Blue', bgClass: 'bg-sky-500/15', textClass: 'text-sky-800 dark:text-sky-300', borderClass: 'border-sky-500/40', hex: '#0284c7' },
  { id: 'emerald', name: 'Verde Surf / Esmeralda', bgClass: 'bg-emerald-500/15', textClass: 'text-emerald-800 dark:text-emerald-300', borderClass: 'border-emerald-500/40', hex: '#10b981' },
  { id: 'purple', name: 'Púrpura / Midnight', bgClass: 'bg-purple-500/15', textClass: 'text-purple-800 dark:text-purple-300', borderClass: 'border-purple-500/40', hex: '#9333ea' },
  { id: 'black', name: 'Negro Ébano / Blackie', bgClass: 'bg-stone-800/20 dark:bg-stone-700/40', textClass: 'text-stone-900 dark:text-stone-200', borderClass: 'border-stone-600', hex: '#1c1917' },
  { id: 'white', name: 'Blanco Olímpico / Crema', bgClass: 'bg-stone-200/50 dark:bg-stone-800/50', textClass: 'text-stone-800 dark:text-stone-200', borderClass: 'border-stone-400', hex: '#f8fafc' },
  { id: 'gold', name: 'Goldtop / Dorado', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-800 dark:text-yellow-300', borderClass: 'border-yellow-500/50', hex: '#eab308' },
  { id: 'butterscotch', name: 'Butterscotch Blonde', bgClass: 'bg-amber-200/40', textClass: 'text-amber-900 dark:text-amber-200', borderClass: 'border-amber-400', hex: '#fde047' },
  { id: 'natural', name: 'Madera Natural / Maple', bgClass: 'bg-orange-100 dark:bg-orange-950/40', textClass: 'text-orange-900 dark:text-orange-300', borderClass: 'border-orange-300', hex: '#d97706' },
];

export type InstrumentCategory = 
  | 'guitar'          // Eléctrica
  | 'bass'            // Bajo
  | 'acoustic'        // Acústica / Electroacústica
  | 'keys'            // Teclados
  | 'drums'           // Batería / Percusión
  | 'ukulele'         // Ukelele
  | 'mandolin'        // Mandolina
  | 'banjo'           // Banjo
  | 'other_strings'   // Ronroco, charango, cuatro, lap steel, 12 cuerdas, etc.
  | 'winds'           // Vientos (saxo, trompeta, trombón, armónica, etc.)
  | 'vocals'          // Cantante / Coros
  | 'other';

export type InstrumentTypeBasic = 
  | 'guitar_electric'  // guitarra electrica
  | 'bass'             // bajo
  | 'keys'             // teclado
  | 'drums'            // bateria
  | 'acoustic'         // acustica
  | 'strings'          // cuerdas (ronroco, charango, ukelele, mandolina, banjo, etc.)
  | 'winds'            // vientos (saxo, trompeta, flauta, armónica, etc.)
  | 'vocals';          // cantante (voz líder, coros, in-ear)

export interface MusicianInstrumentItem {
  id: string;
  name: string;              // ej. "Fender Stratocaster Sunburst"
  nickname?: string;          // ej. "La Roja", "Blackie"
  type: InstrumentTypeBasic;
  categoryDetail?: string;    // ej. "Ronroco", "Saxo Tenor", "Bajo 5 cuerdas"
  colorHex?: string;          // Color visual
  colorName?: string;
  tuning?: string;            // Afinación predeterminada (ej. "Estándar E", "Drop D")
  stringGauge?: string;       // ej. "09", "10", "11", "12", "45", etc.
  capoFret?: number;          // Cejilla por defecto si aplica
  backupInstrument?: string;  // Modelo de backup
  backupColorHex?: string;    // Color de backup
  backupColorName?: string;
  notesOrChannel?: string;    // ej. "Inalámbrico Canal 3", "D.I. Caja directa Stereo"
}

export interface BandMusician {
  id: string;
  name: string;               // ej. "Juan", "Pedro", "Martín"
  role: string;               // ej. "Guitarra Líder", "Bajo & Coros", "Batería"
  instruments: MusicianInstrumentItem[]; // Arsenal de instrumentos de este músico
}

export interface MusicianAssignment {
  id: string;
  musicianId?: string;          // Referencia al BandMusician
  musicianName: string;         // ej. "Charly (Guitarra 1)"
  role?: string;                // ej. "Guitarra Líder"
  instrumentId?: string;        // Referencia al instrumento del arsenal
  instrumentName: string;       // ej. "Fender Telecaster"
  instrumentNickname?: string;  // ej. "La Rubia"
  instrumentType?: InstrumentTypeBasic | InstrumentCategory;
  colorHex?: string;            // Color del instrumento
  backupInstrument?: string;    // ej. "Gibson Les Paul"
  backupColorHex?: string;      // Color del backup
  stringGauge?: string;         // ej. "09", "10", "11", "12", etc.
  tuning?: string;              // Afinación específica
  capoFret?: number;            // Capo (ej. Traste 2)
  needsAssistance?: boolean;    // ¿Requiere asistencia de roadie en el cambio?
  assistanceNote?: string;      // ej. "Alcanzar acústica afinada en DADGAD"
  hasChangeFromPrev?: boolean;  // ¿Hay cambio respecto al tema anterior?
  changeDescription?: string;   // ej. "Cambia de Stratocaster a Acústica Taylor [Capo 2]"
  techNotes?: string;           // Notas técnicas de monitoreo / canal / pedalera
  notesOrChannel?: string;      // Notas de canal/sonido
}

export interface InstrumentAssistance {
  instrumentType: InstrumentCategory;
  musicianId?: string;          // Músico asociado
  musicianName?: string;        // Músico principal (ej. "Juan")
  primaryInstrument: string;    // ej. "Fender Stratocaster Sunburst"
  instrumentNickname?: string;  // Nombre/Apodo de la guitarra ej. "La Roja", "Blackie"
  colorHex?: string;            // Hexadecimal visual
  colorName?: string;           // ej. "Sunburst / Ámbar"
  backupInstrument?: string;    // ej. "Gibson Les Paul Negra"
  backupColorHex?: string;      // Hexadecimal para el backup
  backupColorName?: string;     // Nombre del color del backup
  stringGauge?: string;         // ej. "09 (.009 - .042)", "10", "11", "12", "45", etc.
  capoFret?: number;            // ej. Capo traste 2
  tuningOverride?: string;      // afinación específica para este instrumento
  techNotes?: string;           // ej. "Pasa guitarra inalámbrica por canal 2"
  needsAssistance?: boolean;    // Requiere interacción/asistencia de roadie entre canciones
  assistanceReason?: string;    // ej. "Cambio a Acústica con Capo 3", "Afinación Drop D en vivo"
  hasChangeFromPrev?: boolean;  // Cambio automático detectado respecto al tema previo
  changeAlert?: string;         // Alerta visual de cambio
  secondaryMusicians?: MusicianAssignment[]; // Más músicos asignados al tema
  allMusiciansAssignments?: MusicianAssignment[]; // Todos los músicos en este tema
}

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  album?: string;
  durationSec: number;
  previewUrl?: string;
  artworkUrl?: string;
  keyNote?: string;          // e.g. "Am", "G#m", "D"
  tuning?: string;           // e.g. "Estándar (E)", "Drop D", "Eb", "Open G"
  capoFret?: number;         // e.g. 1, 2, 3 (Capo en Traste)
  bpm?: number;              // e.g. 120 (BPM / bit)
  notes?: string;            // e.g. "Entra con solo de bajo", "Sin corte al tema 3"
  isEncore?: boolean;        // Bis / Bises
  isOptionalEncore?: boolean;// Bis opcional / reserva ("por si piden otra")
  isBreak?: boolean;         // Pausa / Intermedio
  blockTitle?: string;       // Título de bloque (ej. "Bloque 1: Eléctrico", "Bloque 2: Acústico")
  techDetails?: InstrumentAssistance; // Detalles para técnicos (cambios de guitarra, color, backup, calibre, asistencia)
  musicianAssignments?: MusicianAssignment[]; // Asignación de cada músico en esta canción
}

export type SheetPageMode = 'single_page' | 'by_blocks';

export interface SetlistFolder {
  id: string;
  projectId: string;         // ID de la banda a la que pertenece la carpeta
  name: string;              // ej. "Gira 2026 - Latinoamérica", "Shows Acústicos", "Ensayos"
  description?: string;      // ej. "Fechas del tour por estadios"
  color?: string;            // Color identificatorio de la carpeta
  createdAt: number;
  updatedAt: number;
}

export interface Setlist {
  id: string;
  projectId?: string;        // ID del proyecto / banda al que pertenece
  folderId?: string;         // ID de la carpeta / gira dentro de la banda
  name: string;              // Nombre del setlist (ej. "Gira 2026 - Show Eléctrico")
  bandName: string;          // Nombre de la banda / artista
  concertDate: string;       // Fecha del concierto
  venue: string;             // Lugar / Sala / Festival
  stageNotes?: string;       // Notas generales para la banda / sonido
  pageMode?: SheetPageMode;  // 'single_page' (predeterminado: todo en 1 sola hoja) o 'by_blocks' (1 hoja por bloque)
  blocks?: string[];         // Bloques definidos
  songs: SongItem[];
  createdAt: number;
  updatedAt: number;
}

export interface BandProject {
  id: string;
  name: string;              // Nombre de la banda / artista (ej. "Los Vértigos", "Soda Stereo")
  genre?: string;            // Género o estilo
  defaultVenue?: string;     // Lugar habitual o de ensayo
  membersNote?: string;      // Miembros o notas técnicas del rider
  musicians?: BandMusician[]; // Músicos configurados y su arsenal de instrumentos
  createdAt: number;
  updatedAt: number;
}

export type SheetFontSize = 'auto' | 'normal' | 'large' | 'giant';
export type SheetTheme = 'paper' | 'stage-dark';
export type StageViewMode = 'musician' | 'tech' | 'hybrid';

// Granular Export & Import Structures
export interface SetlistExportFile {
  exportType: 'setlist';
  exportedAt: string;
  appName: 'Setlist Studio';
  bandName: string;
  folderName?: string;
  setlist: Setlist;
}

export interface FolderExportFile {
  exportType: 'folder';
  exportedAt: string;
  appName: 'Setlist Studio';
  bandName: string;
  folder: SetlistFolder;
  setlists: Setlist[];
}

export interface BandExportFile {
  exportType: 'band';
  exportedAt: string;
  appName: 'Setlist Studio';
  project: BandProject;
  folders: SetlistFolder[];
  setlists: Setlist[];
}

// Complete Backup Export Structure
export interface FullAppBackup {
  exportType?: 'full_backup';
  version: '2.0';
  exportedAt: string;
  appName: 'Setlist Studio';
  projects: BandProject[];
  folders?: SetlistFolder[];
  setlists: Setlist[];
  activeProjectId?: string;
  activeSetlistId?: string;
}
