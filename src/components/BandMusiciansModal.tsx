import React, { useState } from 'react';
import { 
  X, Plus, Trash2, Edit3, Check, Users, Guitar, 
  Sparkles, Palette, AlertCircle, Music, Settings2,
  ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import { BandMusician, MusicianInstrumentItem, InstrumentTypeBasic } from '../types';
import { 
  BASIC_INSTRUMENT_TYPES, ALL_INSTRUMENT_TUNINGS, 
  GUITAR_ELECTRIC_GAUGES, GUITAR_ACOUSTIC_GAUGES, BASS_GAUGES,
  STANDARD_WINDS, STANDARD_KEYS, STANDARD_DRUMS, STANDARD_VOCALS
} from '../data/instrumentPresets';

interface BandMusiciansModalProps {
  isOpen: boolean;
  onClose: () => void;
  bandName: string;
  musicians: BandMusician[];
  onSaveMusicians: (musicians: BandMusician[]) => void;
}

const PRESET_COLORS = [
  { name: 'Sunburst / Ámbar', hex: '#f59e0b' },
  { name: 'Negro Ébano', hex: '#1c1917' },
  { name: 'Blanco Olímpico', hex: '#f8fafc' },
  { name: 'Rojo Carmesí', hex: '#ef4444' },
  { name: 'Butterscotch Blonde', hex: '#fde047' },
  { name: 'Madera Natural', hex: '#d97706' },
  { name: 'Azul Eléctrico / Pelham', hex: '#0284c7' },
  { name: 'Verde Surf Green', hex: '#10b981' },
  { name: 'Plata / Metálico', hex: '#94a3b8' },
];

export const BandMusiciansModal: React.FC<BandMusiciansModalProps> = ({
  isOpen,
  onClose,
  bandName,
  musicians,
  onSaveMusicians,
}) => {
  const [musicianList, setMusicianList] = useState<BandMusician[]>(musicians);
  const [selectedMusicianId, setSelectedMusicianId] = useState<string>(musicians[0]?.id || '');
  const [showAddMusician, setShowAddMusician] = useState(false);
  const [newMusicianName, setNewMusicianName] = useState('');
  const [newMusicianRole, setNewMusicianRole] = useState('');

  // Editing instrument state
  const [editingInstrument, setEditingInstrument] = useState<{
    musicianId: string;
    instrument: Partial<MusicianInstrumentItem>;
    isNew: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const currentMusician = musicianList.find((m) => m.id === selectedMusicianId) || musicianList[0];

  const handleAddMusician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMusicianName.trim()) return;

    const newM: BandMusician = {
      id: `mus-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newMusicianName.trim(),
      role: newMusicianRole.trim() || 'Músico',
      instruments: [],
    };

    const updated = [...musicianList, newM];
    setMusicianList(updated);
    onSaveMusicians(updated);
    setSelectedMusicianId(newM.id);
    setNewMusicianName('');
    setNewMusicianRole('');
    setShowAddMusician(false);
  };

  const handleDeleteMusician = (id: string) => {
    const updated = musicianList.filter((m) => m.id !== id);
    setMusicianList(updated);
    onSaveMusicians(updated);
    if (selectedMusicianId === id) {
      setSelectedMusicianId(updated[0]?.id || '');
    }
  };

  const handleStartAddInstrument = (musicianId: string) => {
    setEditingInstrument({
      musicianId,
      isNew: true,
      instrument: {
        id: `inst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        nickname: '',
        type: 'guitar_electric',
        colorHex: '#f59e0b',
        colorName: 'Sunburst / Ámbar',
        tuning: 'Estándar (E A D G B E)',
        stringGauge: '10 (.010 - .046) Regular Light - Estándar',
      },
    });
  };

  const handleSaveInstrument = () => {
    if (!editingInstrument || !editingInstrument.instrument.name?.trim()) return;

    const completeInst: MusicianInstrumentItem = {
      id: editingInstrument.instrument.id || `inst-${Date.now()}`,
      name: editingInstrument.instrument.name.trim(),
      nickname: editingInstrument.instrument.nickname?.trim(),
      type: editingInstrument.instrument.type || 'guitar_electric',
      categoryDetail: editingInstrument.instrument.categoryDetail,
      colorHex: editingInstrument.instrument.colorHex || '#f59e0b',
      colorName: editingInstrument.instrument.colorName,
      tuning: editingInstrument.instrument.tuning || 'Estándar (E A D G B E)',
      stringGauge: editingInstrument.instrument.stringGauge,
      capoFret: editingInstrument.instrument.capoFret,
      backupInstrument: editingInstrument.instrument.backupInstrument?.trim(),
      backupColorHex: editingInstrument.instrument.backupColorHex,
      backupColorName: editingInstrument.instrument.backupColorName,
      notesOrChannel: editingInstrument.instrument.notesOrChannel?.trim(),
    };

    const updated = musicianList.map((m) => {
      if (m.id !== editingInstrument.musicianId) return m;
      const exists = m.instruments.some((i) => i.id === completeInst.id);
      const newInstruments = exists
        ? m.instruments.map((i) => (i.id === completeInst.id ? completeInst : i))
        : [...m.instruments, completeInst];
      return { ...m, instruments: newInstruments };
    });

    setMusicianList(updated);
    onSaveMusicians(updated);
    setEditingInstrument(null);
  };

  const handleDeleteInstrument = (musicianId: string, instId: string) => {
    const updated = musicianList.map((m) => {
      if (m.id !== musicianId) return m;
      return { ...m, instruments: m.instruments.filter((i) => i.id !== instId) };
    });
    setMusicianList(updated);
    onSaveMusicians(updated);
  };

  // Quick preset helper
  const handleApplyInstrumentSuggestion = (preset: { name: string; tuning?: string; type?: InstrumentTypeBasic; notes?: string }) => {
    if (!editingInstrument) return;
    setEditingInstrument({
      ...editingInstrument,
      instrument: {
        ...editingInstrument.instrument,
        name: preset.name,
        tuning: preset.tuning || editingInstrument.instrument.tuning,
        notesOrChannel: preset.notes || editingInstrument.instrument.notesOrChannel,
      },
    });
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-[#fcfbf9] dark:bg-[#181614] rounded-3xl shadow-2xl border border-stone-200/90 dark:border-[#2e2a25] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/90 dark:border-[#2b2722] flex items-center justify-between bg-white dark:bg-[#1d1a17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                  Músicos e Instrumentos del Set Técnico
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/80">
                  {bandName}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Configura cada integrante y su arsenal de instrumentos para asignar cambios de guitarra/bajo/teclados en vivo
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

        {/* Body Layout: Left Sidebar (Musicians list) & Right Content (Musician's Instruments) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left: Musicians Column */}
          <div className="w-full md:w-72 border-r border-stone-200/80 dark:border-[#27231e] bg-stone-50/70 dark:bg-[#141210] flex flex-col shrink-0">
            <div className="p-3 border-b border-stone-200/60 dark:border-[#27231e] flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                Músicos ({musicianList.length})
              </span>
              <button
                onClick={() => setShowAddMusician(!showAddMusician)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Agregar</span>
              </button>
            </div>

            {/* Add musician form */}
            {showAddMusician && (
              <form onSubmit={handleAddMusician} className="p-3 bg-white dark:bg-[#1b1916] border-b border-amber-300 dark:border-amber-600/40 space-y-2">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Nombre (ej. Charly, Martín)..."
                  value={newMusicianName}
                  onChange={(e) => setNewMusicianName(e.target.value)}
                  className="w-full text-xs font-bold p-2 bg-stone-50 dark:bg-[#201c18] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Rol (ej. Guitarra Líder, Bajo)..."
                  value={newMusicianRole}
                  onChange={(e) => setNewMusicianRole(e.target.value)}
                  className="w-full text-xs p-2 bg-stone-50 dark:bg-[#201c18] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddMusician(false)}
                    className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-black bg-amber-500 text-stone-950 rounded-lg"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {musicianList.map((m) => {
                const isSelected = m.id === currentMusician?.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMusicianId(m.id);
                      setEditingInstrument(null);
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/70 text-stone-950 dark:text-stone-100 font-bold'
                        : 'bg-white dark:bg-[#1a1714] border-stone-200/70 dark:border-[#27231e] hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{m.name}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{m.role}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                        <Guitar className="w-3 h-3" />
                        <span>{m.instruments.length} {m.instruments.length === 1 ? 'instrumento' : 'instrumentos'}</span>
                      </div>
                    </div>

                    {musicianList.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿Eliminar al músico ${m.name}?`)) {
                            handleDeleteMusician(m.id);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded-lg transition-colors ml-1"
                        title="Eliminar músico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Arsenal & Instruments for Selected Musician */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-white dark:bg-[#181614] flex flex-col">
            {currentMusician ? (
              <div className="space-y-4">
                
                {/* Musician title bar */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-[#27231e]">
                  <div>
                    <h3 className="font-display font-extrabold text-base text-stone-900 dark:text-stone-100">
                      Arsenal de {currentMusician.name}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Rol: <strong className="text-stone-700 dark:text-stone-300">{currentMusician.role}</strong> • {currentMusician.instruments.length} instrumentos registrados
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartAddInstrument(currentMusician.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Añadir Instrumento al Set</span>
                  </button>
                </div>

                {/* Inline Instrument Editor Form */}
                {editingInstrument && editingInstrument.musicianId === currentMusician.id && (
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#201c18] border border-amber-400/80 dark:border-amber-500/60 shadow-md space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-700">
                      <h4 className="text-xs font-black uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        {editingInstrument.isNew ? 'Nuevo Instrumento para ' + currentMusician.name : 'Editar Instrumento'}
                      </h4>
                      <button
                        onClick={() => setEditingInstrument(null)}
                        className="text-stone-400 hover:text-stone-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Step 1: Category / Type */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                        1. Tipo Básico de Instrumento:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {BASIC_INSTRUMENT_TYPES.map((typeObj) => {
                          const isSel = editingInstrument.instrument.type === typeObj.id;
                          return (
                            <button
                              key={typeObj.id}
                              type="button"
                              onClick={() => {
                                let defaultTuning = editingInstrument.instrument.tuning;
                                if (typeObj.id === 'bass') defaultTuning = 'Bajo Estándar 4C (E A D G)';
                                else if (typeObj.id === 'strings') defaultTuning = 'Estándar Ronroco (D G B E B)';
                                else if (typeObj.id === 'keys') defaultTuning = 'Afinación Estándar 440 Hz';
                                else if (typeObj.id === 'drums') defaultTuning = 'Afinación Estándar Show';
                                
                                setEditingInstrument({
                                  ...editingInstrument,
                                  instrument: {
                                    ...editingInstrument.instrument,
                                    type: typeObj.id,
                                    tuning: defaultTuning,
                                  },
                                });
                              }}
                              className={`p-2 rounded-xl text-left border text-xs transition-all ${
                                isSel
                                  ? 'bg-amber-500 text-stone-950 font-black border-amber-600 shadow-xs'
                                  : 'bg-white dark:bg-[#161412] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                              }`}
                            >
                              <div className="font-bold text-[11px] truncate">{typeObj.label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Presets for Selected Type */}
                    {editingInstrument.instrument.type === 'strings' && (
                      <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-300 dark:border-amber-600/40">
                        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block mb-1">
                          Cuerdas típicas disponibles (clic para autocompletar):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { name: 'Ronroco (Grave / Tradicional)', tuning: 'Estándar Ronroco (D G B E B)' },
                            { name: 'Bajo Ronroco / Barítono', tuning: 'Bajo Ronroco (A D F# B F#)' },
                            { name: 'Charango (10 Cuerdas / 5 Órdenes)', tuning: 'Estándar Temple Natural (G C E A E)' },
                            { name: 'Ukelele Tenor / Concierto', tuning: 'Estándar C (G C E A)' },
                            { name: 'Mandolina', tuning: 'Estándar (G D A E)' },
                            { name: 'Cuatro Venezolano', tuning: 'Cam-bur-pin-tón (B F# D A)' },
                            { name: 'Cavaquinho Brasilero', tuning: 'Estándar Brasilero (D G B D)' },
                            { name: 'Guitarra 12 Cuerdas', tuning: 'Estándar (eE aA dD gG BB EE)' },
                          ].map((sug) => (
                            <button
                              key={sug.name}
                              type="button"
                              onClick={() => handleApplyInstrumentSuggestion(sug)}
                              className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-white dark:bg-[#2a241e] border border-amber-300 dark:border-amber-700 text-stone-800 dark:text-stone-200 hover:bg-amber-100"
                            >
                              {sug.name.split('(')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {editingInstrument.instrument.type === 'winds' && (
                      <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-300 dark:border-sky-600/40">
                        <span className="text-[11px] font-bold text-sky-900 dark:text-sky-300 block mb-1">
                          Vientos sugeridos:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {STANDARD_WINDS.map((w) => (
                            <button
                              key={w.name}
                              type="button"
                              onClick={() => handleApplyInstrumentSuggestion(w)}
                              className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-white dark:bg-[#1a2530] border border-sky-300 dark:border-sky-700 text-stone-800 dark:text-stone-200 hover:bg-sky-100"
                            >
                              {w.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Name & Nickname */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Modelo / Nombre Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingInstrument.instrument.name || ''}
                          onChange={(e) =>
                            setEditingInstrument({
                              ...editingInstrument,
                              instrument: { ...editingInstrument.instrument, name: e.target.value },
                            })
                          }
                          placeholder="ej. Fender Stratocaster Sunburst, Martin D-28, Jazz Bass..."
                          className="w-full text-xs font-bold p-2.5 bg-white dark:bg-[#141210] border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Apodo / Identificador de Escenario (opcional)
                        </label>
                        <input
                          type="text"
                          value={editingInstrument.instrument.nickname || ''}
                          onChange={(e) =>
                            setEditingInstrument({
                              ...editingInstrument,
                              instrument: { ...editingInstrument.instrument, nickname: e.target.value },
                            })
                          }
                          placeholder="ej. 'La Roja', 'La Rubia', 'Blackie'..."
                          className="w-full text-xs p-2.5 bg-white dark:bg-[#141210] border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Step 3: Color & Visual Badge */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                        Color Visual del Instrumento (para el rack y el atril):
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {PRESET_COLORS.map((col) => {
                          const isSel = editingInstrument.instrument.colorHex === col.hex;
                          return (
                            <button
                              key={col.hex}
                              type="button"
                              onClick={() =>
                                setEditingInstrument({
                                  ...editingInstrument,
                                  instrument: {
                                    ...editingInstrument.instrument,
                                    colorHex: col.hex,
                                    colorName: col.name,
                                  },
                                })
                              }
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all ${
                                isSel
                                  ? 'ring-2 ring-amber-500 font-bold shadow-xs bg-white dark:bg-[#201c18]'
                                  : 'bg-stone-50 dark:bg-[#141210] border-stone-200 dark:border-stone-800'
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span className="text-[11px] text-stone-800 dark:text-stone-200">{col.name}</span>
                            </button>
                          );
                        })}

                        {/* Custom color input */}
                        <div className="flex items-center gap-1 ml-auto">
                          <input
                            type="color"
                            value={editingInstrument.instrument.colorHex || '#f59e0b'}
                            onChange={(e) =>
                              setEditingInstrument({
                                ...editingInstrument,
                                instrument: { ...editingInstrument.instrument, colorHex: e.target.value },
                              })
                            }
                            className="w-7 h-7 rounded-lg border border-stone-300 cursor-pointer p-0.5"
                          />
                          <span className="text-[11px] font-mono font-bold text-stone-500">
                            {editingInstrument.instrument.colorHex}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Tuning & String Gauge */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Afinación Predeterminada
                        </label>
                        <input
                          type="text"
                          value={editingInstrument.instrument.tuning || ''}
                          onChange={(e) =>
                            setEditingInstrument({
                              ...editingInstrument,
                              instrument: { ...editingInstrument.instrument, tuning: e.target.value },
                            })
                          }
                          placeholder="ej. Estándar (E A D G B E), Drop D, etc."
                          className="w-full text-xs font-mono p-2 bg-white dark:bg-[#141210] border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Calibre de Cuerdas (Guitarras / Bajos / Cuerdas)
                        </label>
                        <select
                          value={editingInstrument.instrument.stringGauge || ''}
                          onChange={(e) =>
                            setEditingInstrument({
                              ...editingInstrument,
                              instrument: { ...editingInstrument.instrument, stringGauge: e.target.value },
                            })
                          }
                          className="w-full text-xs p-2 bg-white dark:bg-[#141210] border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                        >
                          <option value="">Seleccionar o sin cuerdas...</option>
                          <optgroup label="Guitarras Eléctricas (09, 10, 11, 12)">
                            {GUITAR_ELECTRIC_GAUGES.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Guitarras Acústicas">
                            {GUITAR_ACOUSTIC_GAUGES.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Bajos (40, 45, 50)">
                            {BASS_GAUGES.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {/* Step 5: Backup & Audio Channel */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-amber-600" />
                          <span>Instrumento de Backup / Reserva (opcional)</span>
                        </label>
                        <input
                          type="text"
                          value={editingInstrument.instrument.backupInstrument || ''}
                          onChange={(e) =>
                            setEditingInstrument({
                              ...editingInstrument,
                              instrument: { ...editingInstrument.instrument, backupInstrument: e.target.value },
                            })
                          }
                          placeholder="ej. Gibson Les Paul de respaldo..."
                          className="w-full text-xs p-2 bg-white dark:bg-[#141210] border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Canal de Escenario / In-Ear / D.I.
                        </label>
                        <input
                          type="text"
                          value={editingInstrument.instrument.notesOrChannel || ''}
                          onChange={(e) =>
                            setEditingInstrument({
                              ...editingInstrument,
                              instrument: { ...editingInstrument.instrument, notesOrChannel: e.target.value },
                            })
                          }
                          placeholder="ej. Inalámbrico Ch 3, D.I. Estéreo, Amp 1..."
                          className="w-full text-xs p-2 bg-white dark:bg-[#141210] border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    {/* Form actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                      <button
                        type="button"
                        onClick={() => setEditingInstrument(null)}
                        className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveInstrument}
                        disabled={!editingInstrument.instrument.name?.trim()}
                        className="px-4 py-2 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:opacity-50"
                      >
                        Guardar Instrumento
                      </button>
                    </div>
                  </div>
                )}

                {/* Instruments List for this Musician */}
                {currentMusician.instruments.length === 0 && !editingInstrument && (
                  <div className="py-12 text-center rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800">
                    <Guitar className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                    <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      Este músico no tiene instrumentos registrados
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Haz clic en "Añadir Instrumento al Set" para cargar sus guitarras, bajos o sintetizadores
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentMusician.instruments.map((inst) => {
                    return (
                      <div
                        key={inst.id}
                        className="p-3.5 rounded-2xl border border-stone-200/90 dark:border-[#27231e] bg-stone-50/50 dark:bg-[#1a1714] flex flex-col justify-between gap-2.5 hover:border-amber-400/60 transition-all shadow-2xs"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                style={{ backgroundColor: inst.colorHex || '#f59e0b' }}
                                title={inst.colorName || 'Color'}
                              />
                              <h4 className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                                {inst.name}
                              </h4>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  setEditingInstrument({
                                    musicianId: currentMusician.id,
                                    instrument: inst,
                                    isNew: false,
                                  })
                                }
                                className="p-1 text-stone-400 hover:text-amber-600 rounded-lg"
                                title="Editar"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteInstrument(currentMusician.id, inst.id)}
                                className="p-1 text-stone-400 hover:text-rose-600 rounded-lg"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {inst.nickname && (
                            <span className="text-[10px] font-mono-stage px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold mt-1 inline-block">
                              "{inst.nickname}"
                            </span>
                          )}

                          <div className="mt-2 space-y-1 text-[11px] text-stone-500 dark:text-stone-400">
                            {inst.tuning && (
                              <p className="font-mono text-[10px]">
                                🎯 Afinación: <strong className="text-stone-700 dark:text-stone-300">{inst.tuning}</strong>
                              </p>
                            )}
                            {inst.stringGauge && (
                              <p className="text-[10px]">
                                🎸 Cuerdas: <span className="font-bold text-stone-700 dark:text-stone-300">{inst.stringGauge}</span>
                              </p>
                            )}
                            {inst.backupInstrument && (
                              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                                🛡️ Backup: {inst.backupInstrument}
                              </p>
                            )}
                            {inst.notesOrChannel && (
                              <p className="text-[10px] text-stone-600 dark:text-stone-400">
                                🔊 Canal: {inst.notesOrChannel}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ) : null}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/90 dark:border-[#2b2722] bg-white dark:bg-[#1d1a17] flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Los cambios se guardan automáticamente para la banda "{bandName}".
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 text-xs font-bold hover:bg-stone-800 dark:hover:bg-amber-400"
          >
            Aceptar y Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
