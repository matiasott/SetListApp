import { InstrumentCategory, InstrumentTypeBasic, BandMusician } from '../types';

export interface InstrumentOption {
  label: string;
  category: InstrumentCategory;
  defaultGauge?: string;
  defaultTuning?: string;
}

export const STANDARD_ELECTRIC_GUITARS = [
  'Fender Stratocaster',
  'Fender Telecaster',
  'Gibson Les Paul Standard',
  'Gibson SG Standard',
  'Gibson ES-335 (Semi-Hollow)',
  'PRS Custom 24',
  'Ibanez RG Series',
  'Gretsch G6120 Hollowbody',
  'Fender Jazzmaster',
  'Fender Jaguar',
  'Duesenberg Starplayer TV',
  'Epiphone Casino',
  'Jackson Soloist',
  'ESP Eclipse',
];

export const STANDARD_BASSES = [
  'Fender Precision Bass (P-Bass)',
  'Fender Jazz Bass (J-Bass)',
  'Music Man StingRay',
  'Rickenbacker 4003',
  'Warwick Thumb / Streamer',
  'Ibanez SR 4 Cuerdas',
  'Ibanez SR 5 Cuerdas',
  'Yamaha TRBX Series',
  'Hofner 500/1 (Violin Bass)',
  'Sire Marcus Miller V7',
  'Spector Euro 4LX',
  'Bajo Acústico 4C',
];

export const STANDARD_ACOUSTICS = [
  'Martin D-28 Dreadnought',
  'Taylor 814ce Grand Auditorium',
  'Gibson J-45 Standard',
  'Yamaha FG800',
  'Takamine Pro Series (Electroacústica)',
  'Martin 000-15M (Caoba)',
  'Guild D-55',
  'Ovation Custom Legend',
  'Guitarra Clásica Española (Cuerdas Nylon)',
  'Guitarra Electroacústica 12 Cuerdas',
];

export interface OtherStringInstrument {
  id: string;
  name: string;
  category: InstrumentCategory;
  standardTunings: string[];
  recommendedGauges: string[];
}

export const SPECIALIZED_STRING_INSTRUMENTS: OtherStringInstrument[] = [
  {
    id: 'ukulele',
    name: 'Ukelele (Soprano / Concierto / Tenor)',
    category: 'ukulele',
    standardTunings: [
      'Estándar C (G C E A) - High G',
      'Low G (g C E A)',
      'D-Tuning (A D F# B)',
      'Barítono (D G B E)',
    ],
    recommendedGauges: ['Nylon Estándar', 'Fluorocarbono Tenor', 'Titanium High G', 'Aquila Super Nylgut'],
  },
  {
    id: 'mandolin',
    name: 'Mandolina',
    category: 'mandolin',
    standardTunings: [
      'Estándar (G D A E) - Por pares',
      'Cross Tuning (A E A E)',
      'Open G (G D G B)',
      'Sawmill (A E A D)',
    ],
    recommendedGauges: ['.010 - .034 (Light)', '.011 - .040 (Medium)', '.0115 - .041 (Heavy)'],
  },
  {
    id: 'banjo',
    name: 'Banjo (5 Cuerdas)',
    category: 'banjo',
    standardTunings: [
      'Open G (g D G B D) - Estándar',
      'Standard C (g C G B D)',
      'Double C (g C G C D)',
      'Sawmill / Modal (g D G C D)',
      'Drop C (g C G B D)',
    ],
    recommendedGauges: ['.009 - .020 (Light)', '.010 - .023 (Medium)', '.011 - .024 (Heavy)'],
  },
  {
    id: 'ronroco',
    name: 'Ronroco (Grave / Tradicional)',
    category: 'other_strings',
    standardTunings: [
      'Estándar Ronroco (D G B E B)',
      'Afinación Charangón (E A C G E)',
      'Temple Argentino (G C E A E - octava baja)',
    ],
    recommendedGauges: ['Entorchado Ronroco Tensión Media', 'Nylon + Cobre Plateado'],
  },
  {
    id: 'bajo_ronroco',
    name: 'Bajo Ronroco / Barítono',
    category: 'other_strings',
    standardTunings: [
      'Bajo Ronroco (A D F# B F#)',
      'Barítono Grave (B E G# C# G#)',
    ],
    recommendedGauges: ['Entorchado Heavy Barítono'],
  },
  {
    id: 'charango',
    name: 'Charango (10 Cuerdas / 5 Órdenes)',
    category: 'other_strings',
    standardTunings: [
      'Estándar Temple Natural (G C E A E)',
      'Temple Falso (E A E C G)',
      'Temple Diablo (G# C# F A# F)',
    ],
    recommendedGauges: ['Nylon Calibre 028', 'Nylon Calibre 032 Alta Tensión'],
  },
  {
    id: 'cuatro',
    name: 'Cuatro Venezolano',
    category: 'other_strings',
    standardTunings: [
      'Cam-bur-pin-tón (B F# D A)',
      'Tradicional Cumanés (A D F# B)',
    ],
    recommendedGauges: ['Nylon Tradicional', 'Nylon Triple'],
  },
  {
    id: 'cavaquinho',
    name: 'Cavaquinho / Cavaco',
    category: 'other_strings',
    standardTunings: [
      'Estándar Brasilero (D G B D)',
      'Tradicional Portugués (D G B E)',
      'Afinación Guitarra (D G B E)',
    ],
    recommendedGauges: ['Acero .011 - .028', 'Nylon Cavaco'],
  },
  {
    id: 'lapsteel',
    name: 'Lap Steel / Dobro / Resonador',
    category: 'other_strings',
    standardTunings: [
      'Open G (D G D G B D)',
      'Open D (D A D F# A D)',
      'Open E (E B E G# B E)',
      'C6 (C E G A C E) - Hawaiano',
      'Dobro High G (G B D G B D)',
    ],
    recommendedGauges: ['.013 - .056 (Resonator Medium)', '.015 - .058 (Lap Steel Heavy)'],
  },
  {
    id: '12strings',
    name: 'Guitarra 12 Cuerdas',
    category: 'other_strings',
    standardTunings: [
      'Estándar (eE aA dD gG BB EE)',
      '1 Tono Abajo / D (dD gG cC fF AA DD)',
      'Drop D 12C (dD aA dD gG BB EE)',
    ],
    recommendedGauges: ['.010 - .047 (12-String Light)', '.012 - .052 (12-String Medium)'],
  },
];

export const STANDARD_WINDS: { name: string; tuning: string; type: InstrumentTypeBasic }[] = [
  { name: 'Saxo Alto (Eb)', tuning: 'Clave Eb', type: 'winds' },
  { name: 'Saxo Tenor (Bb)', tuning: 'Clave Bb', type: 'winds' },
  { name: 'Saxo Barítono (Eb)', tuning: 'Clave Eb', type: 'winds' },
  { name: 'Saxo Soprano (Bb)', tuning: 'Clave Bb', type: 'winds' },
  { name: 'Trompeta en Si Bemol (Bb)', tuning: 'Clave Bb', type: 'winds' },
  { name: 'Trombón de Varas (C)', tuning: 'Clave C', type: 'winds' },
  { name: 'Armónica Blues / Diatónica', tuning: 'Claves C, A, G, D, E, F', type: 'winds' },
  { name: 'Flauta Traversa (C)', tuning: 'Clave C', type: 'winds' },
  { name: 'Quena / Siku Andino', tuning: 'Sol Mayor (G) / Mi Menor (Em)', type: 'winds' },
];

export const STANDARD_KEYS = [
  { name: 'Nord Stage 3 / 4 (Piano & Sintetizador)', category: 'Teclados', notes: 'Salida Estéreo D.I.' },
  { name: 'Piano Acústico / Cola (Mics Estéreo)', category: 'Piano', notes: '2x AKG 414' },
  { name: 'Fender Rhodes / Wurlitzer Vintage', category: 'Piano Eléctrico', notes: 'Amp Twin Reverb o D.I.' },
  { name: 'Sintetizador Analógico Moog / Lead', category: 'Sintetizador', notes: 'Mono Line Out' },
  { name: 'Secuencias / Ableton Click & Tracks', category: 'Playback', notes: 'Ch 1: Click, Ch 2: Tracks' },
  { name: 'Órgano Hammond B3 + Leslie', category: 'Órgano', notes: 'Mic Rotor Alto y Bajo' },
];

export const STANDARD_DRUMS = [
  { name: 'Batería Acústica 5 Cuerpos (Rock Set)', category: 'Batería', notes: 'Bombo, Tambor, Tom 1, Tom 2, Chancha, Hi-Hat, Crash, Ride' },
  { name: 'Batería Electrónica Roland V-Drums', category: 'Electrónica', notes: 'Salida Stereo directa' },
  { name: 'Roland SPD-SX / Multipad de Muestras', category: 'Percusión Electrónica', notes: 'Ch 7-8' },
  { name: 'Set de Percusión Latina (Congas, Timbales)', category: 'Percusión', notes: 'Mics dinámicos' },
  { name: 'Cajón Peruano / Flamenco', category: 'Percusión Acústica', notes: 'Mic interno Shure Beta 91' },
];

export const STANDARD_VOCALS = [
  { name: 'Voz Principal (Mic Inalámbrico)', category: 'Voz', notes: 'In-Ear Stereo + Shure KSM8 / Sennheiser' },
  { name: 'Segunda Voz / Coros (Mic Soporte)', category: 'Coros', notes: 'Shure SM58 / Beta 58' },
  { name: 'Voz + Armónica en Atril', category: 'Voz / Vientos', notes: 'Soporte de cuello' },
];

// STRING GAUGES PRESETS WITH 09, 10, 11, 12 ACCORDING TO USER'S REQUEST
export const GUITAR_ELECTRIC_GAUGES = [
  '09 (.009 - .042) Super Light',
  '09 (.009 - .046) Hybrid Custom Light',
  '10 (.010 - .046) Regular Light - Estándar',
  '10 (.010 - .052) Light Top / Heavy Bottom',
  '11 (.011 - .048) Power / Medium',
  '11 (.011 - .054) Beefy / Drop Tunings',
  '12 (.012 - .056) Not Even Slinky / Heavy',
  '08 (.008 - .038) Extra Slinky',
];

export const GUITAR_ACOUSTIC_GAUGES = [
  '10 (.010 - .047) Extra Light',
  '11 (.011 - .052) Custom Light',
  '12 (.012 - .053) Light - Estándar Acústica',
  '13 (.013 - .056) Medium',
  'Nylon Tensión Media (Clásica / Criolla)',
  'Nylon Alta Tensión (Concierto)',
];

export const BASS_GAUGES = [
  '40 (.040 - .100) Light',
  '45 (.045 - .105) Regular / Estándar',
  '50 (.050 - .110) Heavy',
  '45 (.045 - .130) Bajo 5 Cuerdas',
  '35 (.035 - .095) Extra Light',
];

export const ALL_INSTRUMENT_TUNINGS: Record<InstrumentCategory, string[]> = {
  guitar: [
    'Estándar (E A D G B E)',
    'Drop D (D A D G B E)',
    'Medio Tono Abajo / Eb (Eb Ab Db Gb Bb Eb)',
    '1 Tono Abajo / D (D G C F A D)',
    'Drop C (C G C F A D)',
    'Open G (D G D G B D)',
    'Open D (D A D F# A D)',
    'Open E (E B E G# B E)',
    'DADGAD',
  ],
  bass: [
    'Bajo Estándar 4C (E A D G)',
    'Bajo Drop D (D A D G)',
    'Bajo Medio Tono Abajo / Eb (Eb Ab Db Gb)',
    'Bajo 1 Tono Abajo / D (D G C F)',
    'Bajo 5 Cuerdas (B E A D G)',
    'Bajo 5C Drop A (A E A D G)',
    'Bajo 6 Cuerdas (B E A D G C)',
  ],
  acoustic: [
    'Estándar (E A D G B E)',
    'DADGAD',
    'Open D (D A D F# A D)',
    'Open G (D G D G B D)',
    'Drop D (D A D G B E)',
    'Medio Tono Abajo / Eb (Eb Ab Db Gb Bb Eb)',
    'Open C (C G C G C E)',
  ],
  ukulele: [
    'Estándar C (G C E A) - High G',
    'Low G (g C E A)',
    'D-Tuning (A D F# B)',
    'Barítono (D G B E)',
  ],
  mandolin: [
    'Estándar (G D A E)',
    'Cross Tuning (A E A E)',
    'Open G (G D G B)',
    'Sawmill (A E A D)',
  ],
  banjo: [
    'Open G (g D G B D)',
    'Standard C (g C G B D)',
    'Double C (g C G C D)',
    'Sawmill / Modal (g D G C D)',
  ],
  other_strings: [
    'Charango Estándar (G C E A E)',
    'Cuatro Cam-bur-pin-tón (B F# D A)',
    'Lap Steel Open G (D G D G B D)',
    'Lap Steel Open D (D A D F# A D)',
    'Lap Steel C6 (C E G A C E)',
    '12 Cuerdas Estándar (eE aA dD gG BB EE)',
  ],
  keys: [
    'Afinación Estándar 440 Hz',
    'Afinación 432 Hz',
    'Transposición +1',
    'Transposición -1',
    'Transposición +2',
    'Transposición -2',
  ],
  drums: [
    'Afinación Estándar Show',
    'Parches Muted / Sordinas',
    'Batería Electrónica Kit 1',
    'Batería Electrónica Kit 2',
  ],
  other: [
    'Estándar 440 Hz',
    'Afinación Específica',
  ],
  winds: [
    'Clave Eb (Saxo Alto / Barítono)',
    'Clave Bb (Saxo Tenor / Trompeta)',
    'Clave C (Flauta / Trombón)',
    'Claves C, A, G, D, E (Armónica)',
  ],
  vocals: [
    'In-Ear Canal 1 (Estéreo)',
    'In-Ear Canal 2',
    'Monitor de Piso Cuña 1',
    'Monitor de Piso Cuña 2',
  ],
};

export const BASIC_INSTRUMENT_TYPES: { id: InstrumentTypeBasic; label: string; description: string }[] = [
  { id: 'guitar_electric', label: 'Guitarra Eléctrica', description: 'Modelos Strat, Les Paul, Tele, RG, afinaciones, calibres y backups' },
  { id: 'bass', label: 'Bajo', description: '4C, 5C, Precision, Jazz Bass, StingRay, afinaciones graves' },
  { id: 'keys', label: 'Teclado', description: 'Pianos, sintetizadores, Nord Stage, Rhodes, samplers y parches' },
  { id: 'drums', label: 'Batería', description: 'Sets acústicos, electrónicos, SPD-SX, percusión menor y click' },
  { id: 'acoustic', label: 'Acústica', description: 'Electroacústicas, cuerdas de nylon, 12 cuerdas y cejillas/capo' },
  { id: 'strings', label: 'Cuerdas', description: 'Ronroco, charango, ukelele, mandolina, banjo, cavaquinho, cuatro, lap steel' },
  { id: 'winds', label: 'Vientos', description: 'Saxos alto/tenor/soprano, trompeta, trombón, armónicas y flautas' },
  { id: 'vocals', label: 'Cantante', description: 'Voz líder, coros, micrófonos inalámbricos y canales in-ear' },
];

export function getDefaultBandMusicians(): BandMusician[] {
  return [
    {
      id: 'mus-1',
      name: 'Guitarra Líder & Voz',
      role: 'Guitarra Principal',
      instruments: [
        {
          id: 'inst-1',
          name: 'Fender Stratocaster Sunburst',
          nickname: 'La Titular',
          type: 'guitar_electric',
          colorHex: '#f59e0b',
          colorName: 'Sunburst / Ámbar',
          tuning: 'Estándar (E A D G B E)',
          stringGauge: '10 (.010 - .046) Regular Light - Estándar',
          backupInstrument: 'Gibson Les Paul Standard',
          backupColorHex: '#1c1917',
          backupColorName: 'Negro Ébano',
          notesOrChannel: 'Canal Amp 1 / Inalámbrico',
        },
        {
          id: 'inst-2',
          name: 'Martin D-28 Dreadnought',
          nickname: 'La Acústica',
          type: 'acoustic',
          colorHex: '#d97706',
          colorName: 'Madera Natural',
          tuning: 'Estándar (E A D G B E)',
          stringGauge: '12 (.012 - .053) Light - Estándar Acústica',
          backupInstrument: 'Taylor 814ce',
          backupColorHex: '#d97706',
          notesOrChannel: 'D.I. Caja Directa Canal 3',
        },
      ],
    },
    {
      id: 'mus-2',
      name: 'Bajo & Coros',
      role: 'Bajo',
      instruments: [
        {
          id: 'inst-3',
          name: 'Fender Jazz Bass (J-Bass)',
          nickname: 'El Jazz Bass',
          type: 'bass',
          colorHex: '#1c1917',
          colorName: 'Negro Ébano',
          tuning: 'Bajo Estándar 4C (E A D G)',
          stringGauge: '45 (.045 - .105) Regular / Estándar',
          backupInstrument: 'Fender Precision Bass (P-Bass)',
          backupColorHex: '#f8fafc',
          backupColorName: 'Blanco Olímpico',
          notesOrChannel: 'Línea directa SansAmp / Cabezal',
        },
      ],
    },
    {
      id: 'mus-3',
      name: 'Guitarra Rítmica & Cuerdas',
      role: 'Segunda Guitarra',
      instruments: [
        {
          id: 'inst-4',
          name: 'Fender Telecaster Butterscotch',
          nickname: 'La Rubia',
          type: 'guitar_electric',
          colorHex: '#fde047',
          colorName: 'Butterscotch Blonde',
          tuning: 'Estándar (E A D G B E)',
          stringGauge: '10 (.010 - .046) Regular Light - Estándar',
          backupInstrument: 'Gibson SG Standard',
          backupColorHex: '#ef4444',
          notesOrChannel: 'Amp Canal 2',
        },
        {
          id: 'inst-5',
          name: 'Ronroco (Grave / Tradicional)',
          nickname: 'Ronroco Andino',
          type: 'strings',
          categoryDetail: 'Ronroco',
          colorHex: '#d97706',
          tuning: 'Estándar Ronroco (D G B E B)',
          stringGauge: 'Entorchado Ronroco Tensión Media',
          notesOrChannel: 'Micrófono condensador o piezzo',
        },
      ],
    },
    {
      id: 'mus-4',
      name: 'Teclados & Sintetizadores',
      role: 'Tecladista',
      instruments: [
        {
          id: 'inst-6',
          name: 'Nord Stage 3 (Piano & Sintetizador)',
          nickname: 'Nord Principal',
          type: 'keys',
          colorHex: '#ef4444',
          tuning: 'Afinación Estándar 440 Hz',
          notesOrChannel: 'Salida Stereo D.I. Canales 5-6',
        },
      ],
    },
    {
      id: 'mus-5',
      name: 'Batería & Secuencias',
      role: 'Baterista',
      instruments: [
        {
          id: 'inst-7',
          name: 'Batería Acústica 5 Cuerpos (Rock Set)',
          nickname: 'Batería',
          type: 'drums',
          colorHex: '#0284c7',
          tuning: 'Afinación Estándar Show',
          notesOrChannel: 'Mics batería + Click in-ear Canal 8',
        },
      ],
    },
  ];
}
