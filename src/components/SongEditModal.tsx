import React, { useState } from 'react';
import { 
  X, Check, Wrench, Guitar, Disc, Palette, ShieldAlert, 
  HelpCircle, Star, Music, AlertCircle, Info, User, Plus, Trash2, Zap, ArrowRight, CheckCircle2
} from 'lucide-react';
import { 
  SongItem, InstrumentAssistance, MusicianAssignment, 
  InstrumentCategory, INSTRUMENT_COLORS, BandMusician, MusicianInstrumentItem 
} from '../types';
import { 
  STANDARD_ELECTRIC_GUITARS,
  STANDARD_BASSES,
  STANDARD_ACOUSTICS,
  SPECIALIZED_STRING_INSTRUMENTS,
  GUITAR_ELECTRIC_GAUGES,
  GUITAR_ACOUSTIC_GAUGES,
  BASS_GAUGES,
  ALL_INSTRUMENT_TUNINGS,
} from '../data/instrumentPresets';
import { getNormalizedAssignments } from '../services/changeAlerts';

interface SongEditModalProps {
  song: SongItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSong: Partial<SongItem>) => void;
  bandMusicians?: BandMusician[];
  previousSong?: SongItem | null;
}

const COMMON_KEYS = ['C', 'Cm', 'C#', 'C#m', 'D', 'Dm', 'D#', 'D#m', 'Eb', 'E', 'Em', 'F', 'Fm', 'F#', 'F#m', 'G', 'Gm', 'G#', 'G#m', 'Ab', 'A', 'Am', 'A#', 'Bb', 'B', 'Bm'];

export const SongEditModal: React.FC<SongEditModalProps> = ({
  song,
  isOpen,
  onClose,
  onSave,
  bandMusicians = [],
  previousSong = null,
}) => {
  if (!isOpen || !song) return null;

  // Local state for musical metadata
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [keyNote, setKeyNote] = useState(song.keyNote || '');
  const [tuning, setTuning] = useState(song.tuning || 'Estándar (E A D G B E)');
  const [capoFret, setCapoFret] = useState<number>(song.capoFret || song.techDetails?.capoFret || 0);
  const [bpm, setBpm] = useState<number | undefined>(song.bpm);
  const [notes, setNotes] = useState(song.notes || '');
  const [isEncore, setIsEncore] = useState(!!song.isEncore);
  const [isOptionalEncore, setIsOptionalEncore] = useState(!!song.isOptionalEncore);

  // Technical Assistance state
  const currentTech = song.techDetails || {
    instrumentType: 'guitar' as InstrumentCategory,
    musicianId: '',
    musicianName: '',
    primaryInstrument: '',
    instrumentNickname: '',
    colorHex: '#f59e0b',
    colorName: 'Sunburst / Ámbar',
    backupInstrument: '',
    backupColorHex: '#1c1917',
    backupColorName: 'Negro Ébano',
    stringGauge: '10 (.010 - .046) Regular Light - Estándar',
    capoFret: 0,
    tuningOverride: '',
    techNotes: '',
    needsAssistance: false,
    assistanceReason: '',
    secondaryMusicians: [],
  };

  const [hasTechDetails, setHasTechDetails] = useState(
    Boolean(song.techDetails && (song.techDetails.primaryInstrument || song.techDetails.backupInstrument || song.techDetails.techNotes || song.techDetails.musicianName))
  );
  
  const [selectedMusicianId, setSelectedMusicianId] = useState<string>(currentTech.musicianId || '');
  const [instrumentType, setInstrumentType] = useState<InstrumentCategory>(currentTech.instrumentType || 'guitar');
  const [musicianName, setMusicianName] = useState(currentTech.musicianName || '');
  const [primaryInstrument, setPrimaryInstrument] = useState(currentTech.primaryInstrument || '');
  const [instrumentNickname, setInstrumentNickname] = useState(currentTech.instrumentNickname || '');
  const [colorHex, setColorHex] = useState(currentTech.colorHex || '#f59e0b');
  const [colorName, setColorName] = useState(currentTech.colorName || 'Sunburst / Ámbar');
  
  const [backupInstrument, setBackupInstrument] = useState(currentTech.backupInstrument || '');
  const [backupColorHex, setBackupColorHex] = useState(currentTech.backupColorHex || '#1c1917');
  
  const [stringGauge, setStringGauge] = useState(currentTech.stringGauge || '10 (.010 - .046) Regular Light - Estándar');
  const [techNotes, setTechNotes] = useState(currentTech.techNotes || '');
  const [needsAssistance, setNeedsAssistance] = useState(!!currentTech.needsAssistance);
  const [assistanceReason, setAssistanceReason] = useState(currentTech.assistanceReason || '');
  
  // Secondary musicians list
  const [secondaryMusicians, setSecondaryMusicians] = useState<MusicianAssignment[]>(
    currentTech.secondaryMusicians || []
  );

  // Active musician from roster
  const activeRosterMusician = bandMusicians.find((m) => m.id === selectedMusicianId);

  // Check instrument change against previousSong
  const prevAssignments = previousSong ? getNormalizedAssignments(previousSong) : [];
  const prevMatch = prevAssignments.find(
    (p) => (selectedMusicianId && p.musicianId && p.musicianId === selectedMusicianId) ||
           (musicianName && p.musicianName && p.musicianName.trim().toLowerCase() === musicianName.trim().toLowerCase())
  );

  const isInstrumentChange = Boolean(
    prevMatch &&
    primaryInstrument &&
    prevMatch.instrumentName &&
    prevMatch.instrumentName.trim().toLowerCase() !== primaryInstrument.trim().toLowerCase()
  );

  const isTuningChange = Boolean(
    prevMatch &&
    tuning &&
    prevMatch.tuning &&
    tuning.trim().toLowerCase() !== prevMatch.tuning.trim().toLowerCase()
  );

  const isCapoChange = Boolean(
    prevMatch &&
    (capoFret ?? 0) !== (prevMatch.capoFret ?? 0)
  );

  const hasDetectedChange = isInstrumentChange || isTuningChange || isCapoChange;

  const handleSelectRosterMusician = (musician: BandMusician) => {
    setSelectedMusicianId(musician.id);
    setMusicianName(musician.name);
    setHasTechDetails(true);

    // If musician has instruments in his arsenal, load first by default or pick role
    if (musician.instruments && musician.instruments.length > 0) {
      const first = musician.instruments[0];
      handleLoadInstrumentFromArsenal(first, musician);
    }
  };

  const handleLoadInstrumentFromArsenal = (inst: MusicianInstrumentItem, musician?: BandMusician) => {
    setPrimaryInstrument(inst.name);
    setInstrumentNickname(inst.nickname || '');
    if (inst.type) setInstrumentType(inst.type);
    if (inst.colorHex) {
      setColorHex(inst.colorHex);
      setColorName(inst.colorName || 'Color de Arsenal');
    }
    if (inst.stringGauge) setStringGauge(inst.stringGauge);
    if (inst.tuning) setTuning(inst.tuning);
    if (inst.backupInstrument) {
      setBackupInstrument(inst.backupInstrument);
      if (inst.backupColorHex) setBackupColorHex(inst.backupColorHex);
    }
    if (inst.notesOrChannel) {
      setTechNotes(inst.notesOrChannel);
    }
    setHasTechDetails(true);
  };

  // Quick preset options based on instrumentType
  const getStandardModels = () => {
    switch (instrumentType) {
      case 'guitar': return STANDARD_ELECTRIC_GUITARS;
      case 'bass': return STANDARD_BASSES;
      case 'acoustic': return STANDARD_ACOUSTICS;
      case 'ukulele': return ['Ukelele Soprano', 'Ukelele Concierto', 'Ukelele Tenor', 'Ukelele Barítono', 'Ukelele Electroacústico'];
      case 'mandolin': return ['Mandolina Estilo A', 'Mandolina Estilo F (Bluegrass)', 'Mandolina Eléctrica'];
      case 'banjo': return ['Banjo 5 Cuerdas Resonator', 'Banjo Open-Back', 'Banjo 4 Cuerdas (Tenor)'];
      case 'other_strings': return ['Charango Temple Natural', 'Cuatro Venezolano', 'Lap Steel Eléctrico', 'Guitarra Dobro Resonadora', 'Guitarra 12 Cuerdas'];
      case 'keys': return ['Nord Stage 3', 'Yamaha Montage / Motif', 'Roland Fantom', 'Korg Kronos', 'Piano Acústico'];
      case 'drums': return ['Batería Acústica', 'Batería Híbrida / SPD-SX', 'Percusión Latina (Congas/Timbales)'];
      default: return ['Instrumento Personalizado'];
    }
  };

  const getGaugePresets = () => {
    switch (instrumentType) {
      case 'guitar': return GUITAR_ELECTRIC_GAUGES;
      case 'bass': return BASS_GAUGES;
      case 'acoustic': return GUITAR_ACOUSTIC_GAUGES;
      default: return [];
    }
  };

  const getTuningPresets = () => {
    return ALL_INSTRUMENT_TUNINGS[instrumentType] || ALL_INSTRUMENT_TUNINGS.guitar;
  };

  const handleSelectColor = (hex: string, name: string) => {
    setColorHex(hex);
    setColorName(name);
  };

  const handleAddSecondaryMusician = () => {
    const newM: MusicianAssignment = {
      id: `musician-${Date.now()}`,
      musicianName: 'Guitarra 2 / Músico 2',
      role: 'Guitarra Rítmica',
      instrumentName: 'Fender Telecaster',
      instrumentNickname: 'La Rubia',
      colorHex: '#fde047',
      stringGauge: '10',
      tuning: 'Estándar',
      capoFret: 0,
      needsAssistance: false,
    };
    setSecondaryMusicians([...secondaryMusicians, newM]);
  };

  const handleUpdateSecondaryMusician = (index: number, field: keyof MusicianAssignment, val: any) => {
    const updated = [...secondaryMusicians];
    updated[index] = { ...updated[index], [field]: val };
    setSecondaryMusicians(updated);
  };

  const handleRemoveSecondaryMusician = (index: number) => {
    setSecondaryMusicians(secondaryMusicians.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const techDetails: InstrumentAssistance | undefined = hasTechDetails
      ? {
          instrumentType,
          musicianName: musicianName.trim() || undefined,
          primaryInstrument: primaryInstrument.trim(),
          instrumentNickname: instrumentNickname.trim() || undefined,
          colorHex,
          colorName,
          backupInstrument: backupInstrument.trim() || undefined,
          backupColorHex: backupInstrument.trim() ? backupColorHex : undefined,
          stringGauge: stringGauge.trim(),
          capoFret: capoFret > 0 ? capoFret : undefined,
          techNotes: techNotes.trim(),
          needsAssistance,
          assistanceReason: needsAssistance ? (assistanceReason.trim() || 'Asistencia en cambio de tema') : undefined,
          secondaryMusicians: secondaryMusicians.length > 0 ? secondaryMusicians : undefined,
        }
      : undefined;

    const primaryAssignment: MusicianAssignment | undefined = hasTechDetails && (primaryInstrument.trim() || musicianName.trim())
      ? {
          id: `primary-${song.id}`,
          musicianId: selectedMusicianId || undefined,
          musicianName: musicianName.trim() || 'Músico Principal',
          instrumentName: primaryInstrument.trim() || 'Instrumento',
          instrumentNickname: instrumentNickname.trim() || undefined,
          instrumentType,
          colorHex,
          backupInstrument: backupInstrument.trim() || undefined,
          backupColorHex: backupInstrument.trim() ? backupColorHex : undefined,
          stringGauge: stringGauge.trim(),
          tuning: tuning.trim() || undefined,
          capoFret: capoFret > 0 ? capoFret : undefined,
          needsAssistance,
          assistanceNote: needsAssistance ? (assistanceReason.trim() || 'Asistencia en cambio de tema') : undefined,
          notesOrChannel: techNotes.trim() || undefined,
          hasChangeFromPrev: hasDetectedChange,
        }
      : undefined;

    const allAssignments: MusicianAssignment[] = primaryAssignment
      ? [primaryAssignment, ...secondaryMusicians]
      : secondaryMusicians;

    onSave({
      title: title.trim() || song.title,
      artist: artist.trim(),
      keyNote: keyNote.trim() || undefined,
      tuning: tuning.trim() || undefined,
      capoFret: capoFret > 0 ? capoFret : undefined,
      bpm: bpm ? Number(bpm) : undefined,
      notes: notes.trim() || undefined,
      isEncore,
      isOptionalEncore: isEncore ? isOptionalEncore : false,
      techDetails,
      musicianAssignments: allAssignments.length > 0 ? allAssignments : undefined,
    });

    onClose();
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-[#181614] rounded-3xl shadow-2xl border border-stone-200/90 dark:border-[#2e2a25] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/90 dark:border-[#2b2722] flex items-center justify-between bg-stone-50/70 dark:bg-[#1d1a17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Guitar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Ficha Musical & Asistencia Técnica</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Afinaciones, capo, tempo bit/BPM, instrumentos, calibres y asistencia en vivo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200 dark:hover:bg-[#28241f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Main Song Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Título del Tema *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Artista / Compositor
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full text-xs font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Musical Parameters: Tonalidad, Capo, Tempo (BPM / bit), Afinación */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50/70 dark:bg-[#1f1b17] p-3.5 rounded-2xl border border-stone-200/70 dark:border-[#2d2822]">
            {/* Tonalidad */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Tonalidad / Key
              </label>
              <input
                type="text"
                list="modal-keys"
                value={keyNote}
                onChange={(e) => setKeyNote(e.target.value)}
                placeholder="Ej. Am, C#, G"
                className="w-full text-xs font-bold font-mono-stage bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
              />
              <datalist id="modal-keys">
                {COMMON_KEYS.map((k) => (
                  <option key={k} value={k} />
                ))}
              </datalist>
            </div>

            {/* Capo / Cejilla */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 flex items-center justify-between">
                <span>Cejilla / Capo</span>
                {capoFret > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 font-extrabold font-mono-stage text-[9px]">
                    Traste {capoFret}
                  </span>
                )}
              </label>
              <select
                value={capoFret}
                onChange={(e) => setCapoFret(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
              >
                <option value={0}>Sin Capo</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((f) => (
                  <option key={f} value={f}>Capo Traste {f}</option>
                ))}
              </select>
            </div>

            {/* Tempo BPM / bit */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Tempo (bit / BPM)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="40"
                  max="280"
                  value={bpm || ''}
                  onChange={(e) => setBpm(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  placeholder="Ej. 124"
                  className="w-full text-xs font-bold font-mono-stage bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2 pr-10 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                />
                <span className="absolute right-2 top-2 text-[10px] font-bold text-stone-400 pointer-events-none">
                  bit
                </span>
              </div>
            </div>

            {/* Afinación General */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Afinación
              </label>
              <input
                type="text"
                list="modal-tunings"
                value={tuning}
                onChange={(e) => setTuning(e.target.value)}
                placeholder="Estándar (E)"
                className="w-full text-xs font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
              />
              <datalist id="modal-tunings">
                {getTuningPresets().map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Musicians Notes / Stage Cues */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
              Indicaciones Musicales de Escenario (Cues, transiciones, solos)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Entra con solo de bajo, sin corte con el tema siguiente, solo de armónica al medio..."
              className="w-full text-xs bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Section: Encore Switchers */}
          <div className="flex flex-wrap items-center gap-4 p-3 rounded-2xl bg-stone-50 dark:bg-[#1d1a17] border border-stone-200/80 dark:border-[#2a2620]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800 dark:text-stone-200">
              <input
                type="checkbox"
                checked={isEncore}
                onChange={(e) => setIsEncore(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <span>Pertenece a la sección de Bises (Encore)</span>
            </label>

            {isEncore && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-700 dark:text-rose-400">
                <input
                  type="checkbox"
                  checked={isOptionalEncore}
                  onChange={(e) => setIsOptionalEncore(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
                <span>Marcar como Bis Opcional / Reserva</span>
              </label>
            )}
          </div>

          {/* TECHNICAL ASSISTANCE & INSTRUMENTS ACCORDION / BOX */}
          <div className="rounded-2xl border-2 border-amber-400/80 dark:border-amber-600/60 bg-amber-50/40 dark:bg-[#201c18] p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-xs">
                  <Wrench className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>Ficha Técnica para Roadies, Stage & Músicos</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-300 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200">
                      Asistencia en Vivo
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    Asignación de músico, nombre de guitarras/bajos, calibres (09, 10, 11, 12), colores y avisos entre temas
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={hasTechDetails}
                  onChange={(e) => setHasTechDetails(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {hasTechDetails && (
              <div className="space-y-4 pt-3 border-t border-amber-300/70 dark:border-amber-900/50 animate-in fade-in duration-150">
                
                {/* 0. SELECTOR RÁPIDO DE MÚSICOS DE LA BANDA & ARSENAL REGISTRADO */}
                {bandMusicians.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#181512] border border-amber-300/80 dark:border-amber-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-600" />
                        <span>Músicos de la Banda & Arsenal de Instrumentos</span>
                      </span>
                      <span className="text-[10px] text-stone-500 font-semibold">
                        Haz clic en un instrumento para asignarlo automáticamente
                      </span>
                    </div>

                    {/* Musician Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {bandMusicians.map((m) => {
                        const isSelected = selectedMusicianId === m.id || musicianName.toLowerCase() === m.name.toLowerCase();
                        return (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => handleSelectRosterMusician(m)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isSelected
                                ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs font-black'
                                : 'bg-stone-50 dark:bg-[#221e1a] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                            }`}
                          >
                            <User className="w-3 h-3" />
                            <span>{m.name}</span>
                            {m.role && <span className="opacity-75 text-[10px]">({m.role})</span>}
                            {m.instruments && m.instruments.length > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full bg-stone-900/10 dark:bg-white/10 text-[9px] font-mono-stage">
                                {m.instruments.length}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Arsenal Quick Selector for Active Musician */}
                    {activeRosterMusician && activeRosterMusician.instruments && activeRosterMusician.instruments.length > 0 && (
                      <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 space-y-1.5">
                        <div className="text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                          Arsenal de {activeRosterMusician.name}:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {activeRosterMusician.instruments.map((inst) => {
                            const isCurrent = primaryInstrument.trim().toLowerCase() === inst.name.trim().toLowerCase();
                            return (
                              <button
                                key={inst.id}
                                type="button"
                                onClick={() => handleLoadInstrumentFromArsenal(inst, activeRosterMusician)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                  isCurrent
                                    ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 text-amber-950 dark:text-amber-200 ring-2 ring-amber-400'
                                    : 'bg-white dark:bg-[#1f1b17] border-stone-200 dark:border-stone-700 hover:border-amber-400 text-stone-800 dark:text-stone-200'
                                }`}
                              >
                                {inst.colorHex && (
                                  <span
                                    className="w-3 h-3 rounded-full border border-stone-400 shrink-0 shadow-2xs"
                                    style={{ backgroundColor: inst.colorHex }}
                                  />
                                )}
                                <span className="font-extrabold">{inst.name}</span>
                                {inst.nickname && (
                                  <span className="text-[10px] italic text-stone-500 dark:text-stone-400">
                                    "{inst.nickname}"
                                  </span>
                                )}
                                {inst.stringGauge && (
                                  <span className="text-[9px] font-mono-stage px-1 rounded bg-stone-200 dark:bg-stone-800">
                                    {inst.stringGauge.split(' ')[0]}
                                  </span>
                                )}
                                {isCurrent && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 ml-1" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* INSTRUMENT CHANGE ALERT BANNER (REAL-TIME DETECTION FROM PREVIOUS SONG) */}
                {hasDetectedChange && prevMatch && previousSong && (
                  <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500 dark:border-amber-400/80 space-y-2 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Zap className="w-4 h-4 fill-current stroke-[2.5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-black text-xs sm:text-sm text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                            ¡Aviso de Cambio de Instrumento Detectado!
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-stone-950">
                            Roadie & Músico Alert
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-stone-800 dark:text-stone-200 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-600 dark:text-stone-400">Tema anterior ("{previousSong.title}"):</span>
                            <span className="font-extrabold px-2 py-0.5 rounded bg-stone-200/80 dark:bg-stone-800 font-mono-stage text-[11px]">
                              {prevMatch.instrumentName}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-bold text-stone-600 dark:text-stone-400">En este tema:</span>
                            <span className="font-extrabold px-2 py-0.5 rounded bg-amber-400 dark:bg-amber-500 text-stone-950 font-mono-stage text-[11px]">
                              {primaryInstrument || 'Nuevo instrumento'}
                            </span>
                          </div>

                          {isTuningChange && (
                            <div className="text-[11px] text-amber-900 dark:text-amber-300 font-semibold">
                              • Cambio de afinación: pasa de <strong>{prevMatch.tuning || 'Estándar'}</strong> a <strong>{tuning}</strong>
                            </div>
                          )}

                          {isCapoChange && (
                            <div className="text-[11px] text-amber-900 dark:text-amber-300 font-semibold">
                              • Cambio de Cejilla/Capo: {capoFret > 0 ? `Colocar Capo en traste ${capoFret}` : 'Quitar Capo'} (en el tema anterior: {prevMatch.capoFret ? `Traste ${prevMatch.capoFret}` : 'Sin Capo'})
                            </div>
                          )}
                        </div>

                        {/* Quick action to enable Roadie Assistance note */}
                        <div className="pt-2 mt-2 border-t border-amber-300/80 dark:border-amber-800/80 flex items-center justify-between gap-3 flex-wrap">
                          <label className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={needsAssistance}
                              onChange={(e) => {
                                setNeedsAssistance(e.target.checked);
                                if (e.target.checked && !assistanceReason) {
                                  setAssistanceReason(`Alcanzar ${primaryInstrument} [${tuning}]`);
                                }
                              }}
                              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                            />
                            <span>Activar asistencia técnica de roadie en vivo</span>
                          </label>

                          {needsAssistance && (
                            <input
                              type="text"
                              value={assistanceReason}
                              onChange={(e) => setAssistanceReason(e.target.value)}
                              placeholder="Ej. Alcanzar guitarra y recoger anterior..."
                              className="text-xs bg-white dark:bg-[#151412] px-2.5 py-1 rounded-lg border border-amber-400 dark:border-amber-700 flex-1 min-w-[200px]"
                            />
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                )}
                
                {/* 1. MÚSICO ASIGNADO & TIPO DE INSTRUMENTO */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      <span>Músico Asignado</span>
                    </label>
                    <input
                      type="text"
                      value={musicianName}
                      onChange={(e) => setMusicianName(e.target.value)}
                      placeholder="Ej. Juan (Guitarra 1), Pedro (Bajo)..."
                      className="w-full text-xs font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Tipo de Instrumento
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'guitar', label: 'Guitarra Eléctrica' },
                        { id: 'bass', label: 'Bajo Eléctrico' },
                        { id: 'acoustic', label: 'Acústica / Criolla' },
                        { id: 'ukulele', label: 'Ukelele' },
                        { id: 'mandolin', label: 'Mandolina' },
                        { id: 'banjo', label: 'Banjo' },
                        { id: 'other_strings', label: 'Otras Cuerdas' },
                        { id: 'keys', label: 'Teclados' },
                      ].map((inst) => (
                        <button
                          type="button"
                          key={inst.id}
                          onClick={() => {
                            setInstrumentType(inst.id as any);
                            // Set suitable default gauge
                            if (inst.id === 'guitar' && !stringGauge.includes('.0')) setStringGauge('10 (.010 - .046) Regular Light - Estándar');
                            if (inst.id === 'bass') setStringGauge('45 (.045 - .105) Regular / Estándar');
                            if (inst.id === 'acoustic') setStringGauge('12 (.012 - .053) Light - Estándar Acústica');
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            instrumentType === inst.id
                              ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs font-black'
                              : 'bg-white dark:bg-[#171513] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                          }`}
                        >
                          {inst.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. MODELO PRINCIPAL (STANDARES + CUSTOM) Y NOMBRE/APODO */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Selector modelo estándar */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Modelos Estándar Listados
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setPrimaryInstrument(e.target.value);
                        }
                      }}
                      className="w-full text-xs font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">Seleccionar de lista estándar...</option>
                      {getStandardModels().map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Instrumento Principal (Editable o personalizado) */}
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Instrumento en Escenario *
                    </label>
                    <input
                      type="text"
                      value={primaryInstrument}
                      onChange={(e) => setPrimaryInstrument(e.target.value)}
                      placeholder="Ej. Fender Stratocaster Sunburst, Gibson SG..."
                      className="w-full text-xs font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Nombre / Apodo de la guitarra */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Nombre / Apodo
                    </label>
                    <input
                      type="text"
                      value={instrumentNickname}
                      onChange={(e) => setInstrumentNickname(e.target.value)}
                      placeholder="Ej. 'La Roja', 'Blackie'..."
                      className="w-full text-xs font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. COLOR DEL INSTRUMENTO Y COLOR DEL BACKUP (CHIPS + COLOR PICKER LIBRE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-2xl bg-white/80 dark:bg-[#161412] border border-amber-200/80 dark:border-[#2e2a25]">
                  {/* Color Principal */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-amber-600" />
                        <span>Color de la Guitarra / Instrumento</span>
                      </span>
                      <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold">{colorName}</span>
                    </label>
                    
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {INSTRUMENT_COLORS.map((col) => {
                        const isSelected = colorHex.toLowerCase() === col.hex.toLowerCase();
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => handleSelectColor(col.hex, col.name)}
                            title={col.name}
                            className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${col.borderClass} ${
                              isSelected ? 'scale-125 ring-2 ring-amber-500 shadow-sm' : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: col.hex }}
                          />
                        );
                      })}

                      {/* Libre selector de color HTML */}
                      <label 
                        title="Seleccionar cualquier color en la paleta completa" 
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-stone-300 dark:border-stone-700 cursor-pointer hover:border-amber-500"
                      >
                        <input 
                          type="color" 
                          value={colorHex} 
                          onChange={(e) => handleSelectColor(e.target.value, 'Personalizado')}
                          className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent" 
                        />
                        <span>Paleta libre</span>
                      </label>
                    </div>
                  </div>

                  {/* Instrumento de Backup & su Color */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Backup / Repuesto en Atril</span>
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={backupInstrument}
                        onChange={(e) => setBackupInstrument(e.target.value)}
                        placeholder="Ej. Gibson Les Paul, Ibanez RG..."
                        className="flex-1 text-xs font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                      />
                      
                      {/* Color del Backup */}
                      <label 
                        title="Color del instrumento de Backup" 
                        className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 cursor-pointer shrink-0"
                      >
                        <input 
                          type="color" 
                          value={backupColorHex} 
                          onChange={(e) => setBackupColorHex(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" 
                        />
                        <span className="text-[10px] font-bold text-stone-600 dark:text-stone-300">Color Bkp</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 4. CALIBRES DE CUERDAS (09, 10, 11, 12, ETC.) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                    <span>Calibre de Cuerdas</span>
                    <span className="text-[10px] font-mono-stage text-amber-800 dark:text-amber-400 font-bold">{stringGauge}</span>
                  </label>

                  {/* Quick Gauge Buttons: 09, 10, 11, 12 for fast stage selection */}
                  {(instrumentType === 'guitar' || instrumentType === 'acoustic') && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <span className="text-[10px] font-bold text-stone-500">Acceso rápido:</span>
                      {['09 (.009 - .042)', '10 (.010 - .046)', '11 (.011 - .048)', '12 (.012 - .054)'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setStringGauge(g)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono-stage font-bold border transition-all ${
                            stringGauge.startsWith(g.substring(0, 2))
                              ? 'bg-amber-500 text-stone-950 border-amber-600 font-black'
                              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-amber-400'
                          }`}
                        >
                          {g.substring(0, 2)}
                        </button>
                      ))}
                    </div>
                  )}

                  {instrumentType === 'bass' && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <span className="text-[10px] font-bold text-stone-500">Acceso rápido Bajo:</span>
                      {['40 (.040 - .100)', '45 (.045 - .105)', '50 (.050 - .110)', '45 (5 Cuerdas)'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setStringGauge(g)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono-stage font-bold border transition-all ${
                            stringGauge.startsWith(g.substring(0, 2))
                              ? 'bg-amber-500 text-stone-950 border-amber-600 font-black'
                              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-amber-400'
                          }`}
                        >
                          {g.substring(0, 2)}
                        </button>
                      ))}
                    </div>
                  )}

                  <input
                    type="text"
                    list="string-gauges"
                    value={stringGauge}
                    onChange={(e) => setStringGauge(e.target.value)}
                    placeholder="Ej. 10 (.010 - .046)"
                    className="w-full text-xs font-bold font-mono-stage bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:outline-none"
                  />
                  <datalist id="string-gauges">
                    {getGaugePresets().map((g) => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </div>

                {/* 5. INTERACCIÓN / ASISTENCIA DE ESCENARIO ENTRE TEMAS */}
                <div className="p-3 rounded-2xl bg-amber-100/70 dark:bg-[#282119] border-2 border-amber-400 dark:border-amber-600/80 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needsAssistance}
                      onChange={(e) => setNeedsAssistance(e.target.checked)}
                      className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-current" />
                      <span className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                        Requiere Asistencia Técnica / Roadie entre temas
                      </span>
                    </div>
                  </label>

                  {needsAssistance && (
                    <div className="pt-1.5 animate-in fade-in duration-150 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 mb-0.5">
                            Motivo / Tipo de Asistencia
                          </label>
                          <input
                            type="text"
                            value={assistanceReason}
                            onChange={(e) => setAssistanceReason(e.target.value)}
                            placeholder="Ej. Cambio de guitarra, Pasar acústica con capo 3, Afinación Drop D..."
                            className="w-full text-xs font-bold bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2 rounded-xl border border-amber-300 dark:border-amber-700 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 mb-0.5">
                            Instrucciones para Escenario / Sonido
                          </label>
                          <input
                            type="text"
                            value={techNotes}
                            onChange={(e) => setTechNotes(e.target.value)}
                            placeholder="Ej. Canal acústica D.I. 3, pasar púa dura, chequear afinador..."
                            className="w-full text-xs bg-white dark:bg-[#151412] text-stone-900 dark:text-stone-100 p-2 rounded-xl border border-amber-300 dark:border-amber-700 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. MÚSICOS ADICIONALES PARA ESTE TEMA (EJ. GUITARRA 2, BAJO, ETC.) */}
                <div className="pt-2 border-t border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Asignación de Músicos Adicionales en este tema ({secondaryMusicians.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSecondaryMusician}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Músico</span>
                    </button>
                  </div>

                  {secondaryMusicians.map((secM, idx) => (
                    <div key={secM.id} className="p-3 rounded-xl bg-white dark:bg-[#151412] border border-stone-300 dark:border-stone-700 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={secM.musicianName}
                          onChange={(e) => handleUpdateSecondaryMusician(idx, 'musicianName', e.target.value)}
                          placeholder="Nombre del Músico (ej. Pedro - Guitarra 2)"
                          className="font-bold text-xs bg-stone-100 dark:bg-stone-800 p-1.5 rounded-lg flex-1 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSecondaryMusician(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Eliminar músico"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={secM.instrumentName}
                          onChange={(e) => handleUpdateSecondaryMusician(idx, 'instrumentName', e.target.value)}
                          placeholder="Instrumento (ej. Martin Acústica)"
                          className="text-xs bg-stone-50 dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
                        />
                        <input
                          type="text"
                          value={secM.instrumentNickname || ''}
                          onChange={(e) => handleUpdateSecondaryMusician(idx, 'instrumentNickname', e.target.value)}
                          placeholder="Apodo guitarra (ej. La 335)"
                          className="text-xs bg-stone-50 dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
                        />
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={secM.stringGauge || ''}
                            onChange={(e) => handleUpdateSecondaryMusician(idx, 'stringGauge', e.target.value)}
                            placeholder="Calibre (10, 11...)"
                            className="text-xs bg-stone-50 dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 flex-1"
                          />
                          <input
                            type="color"
                            value={secM.colorHex || '#f59e0b'}
                            onChange={(e) => handleUpdateSecondaryMusician(idx, 'colorHex', e.target.value)}
                            className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                            title="Color identificador"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Preview of Technical Badge */}
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#161412] border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-4 h-4 rounded-full shrink-0 border border-stone-400" 
                      style={{ backgroundColor: colorHex }}
                    />
                    <div className="truncate">
                      {musicianName && (
                        <span className="font-extrabold text-amber-800 dark:text-amber-400 mr-1.5">
                          [{musicianName}]
                        </span>
                      )}
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {primaryInstrument || 'Instrumento Principal'}
                      </span>
                      {instrumentNickname && (
                        <span className="italic text-stone-500 ml-1">"{instrumentNickname}"</span>
                      )}
                      {backupInstrument && (
                        <span className="text-stone-500 dark:text-stone-400 ml-1">
                          (Bkp: <strong className="text-amber-700 dark:text-amber-400">{backupInstrument}</strong>)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {capoFret > 0 && (
                      <span className="font-mono-stage text-[10px] font-black px-2 py-0.5 rounded bg-amber-500 text-stone-950">
                        CAPO {capoFret}
                      </span>
                    )}
                    {stringGauge && (
                      <span className="font-mono-stage text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        Cuerdas: {stringGauge.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-sm active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar Ficha Técnica</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
