import { SongItem, MusicianAssignment, BandMusician } from '../types';

export interface MusicianChangeAlert {
  musicianId?: string;
  musicianName: string;
  fromInstrument?: string;
  toInstrument: string;
  fromColorHex?: string;
  toColorHex?: string;
  fromTuning?: string;
  toTuning?: string;
  fromCapo?: number;
  toCapo?: number;
  isInstrumentChange: boolean;
  isTuningChange: boolean;
  isCapoChange: boolean;
  alertText: string;
  needsRoadieAssistance?: boolean;
}

/**
 * Extracts a normalized musician assignment list for a song,
 * looking into song.musicianAssignments and fallback to song.techDetails
 */
export function getNormalizedAssignments(song: SongItem): MusicianAssignment[] {
  if (song.musicianAssignments && song.musicianAssignments.length > 0) {
    return song.musicianAssignments;
  }

  const result: MusicianAssignment[] = [];

  // Fallback to techDetails if available
  if (song.techDetails) {
    if (song.techDetails.primaryInstrument || song.techDetails.musicianName) {
      result.push({
        id: `primary-${song.id}`,
        musicianId: song.techDetails.musicianId,
        musicianName: song.techDetails.musicianName || 'Músico Principal',
        instrumentName: song.techDetails.primaryInstrument || 'Instrumento',
        instrumentNickname: song.techDetails.instrumentNickname,
        instrumentType: song.techDetails.instrumentType,
        colorHex: song.techDetails.colorHex,
        backupInstrument: song.techDetails.backupInstrument,
        backupColorHex: song.techDetails.backupColorHex,
        stringGauge: song.techDetails.stringGauge,
        tuning: song.techDetails.tuningOverride || song.tuning,
        capoFret: song.techDetails.capoFret || song.capoFret,
        needsAssistance: song.techDetails.needsAssistance,
        assistanceNote: song.techDetails.assistanceReason,
        notesOrChannel: song.techDetails.techNotes,
      });
    }

    if (song.techDetails.secondaryMusicians && song.techDetails.secondaryMusicians.length > 0) {
      result.push(...song.techDetails.secondaryMusicians);
    }
  }

  return result;
}

/**
 * Compares two consecutive songs and detects all instrument and tuning changes for every musician
 */
export function detectSongChanges(currentSong: SongItem, previousSong: SongItem | null): MusicianChangeAlert[] {
  if (!previousSong || currentSong.isBreak) return [];

  const currentAssignments = getNormalizedAssignments(currentSong);
  const prevAssignments = getNormalizedAssignments(previousSong);

  const alerts: MusicianChangeAlert[] = [];

  for (const curr of currentAssignments) {
    // Try to match by musicianId, or fallback to musicianName
    const prev = prevAssignments.find(
      (p) => (curr.musicianId && p.musicianId && curr.musicianId === p.musicianId) ||
             (curr.musicianName && p.musicianName && curr.musicianName.trim().toLowerCase() === p.musicianName.trim().toLowerCase())
    );

    if (prev) {
      const isInstrumentChange = Boolean(
        curr.instrumentName &&
        prev.instrumentName &&
        curr.instrumentName.trim().toLowerCase() !== prev.instrumentName.trim().toLowerCase()
      );

      const currTuning = curr.tuning || currentSong.tuning || '';
      const prevTuning = prev.tuning || previousSong.tuning || '';
      const isTuningChange = Boolean(
        currTuning &&
        prevTuning &&
        currTuning.trim().toLowerCase() !== prevTuning.trim().toLowerCase()
      );

      const currCapo = curr.capoFret ?? currentSong.capoFret ?? 0;
      const prevCapo = prev.capoFret ?? previousSong.capoFret ?? 0;
      const isCapoChange = currCapo !== prevCapo;

      if (isInstrumentChange || isTuningChange || isCapoChange) {
        let alertParts: string[] = [];

        if (isInstrumentChange) {
          alertParts.push(`Cambio a ${curr.instrumentName}${curr.instrumentNickname ? ` ("${curr.instrumentNickname}")` : ''} (antes: ${prev.instrumentName})`);
        }
        if (isTuningChange) {
          alertParts.push(`Afinación: ${currTuning} (antes: ${prevTuning})`);
        }
        if (isCapoChange) {
          alertParts.push(currCapo > 0 ? `Poner Capo en traste ${currCapo}` : 'Quitar Capo');
        }

        alerts.push({
          musicianId: curr.musicianId,
          musicianName: curr.musicianName,
          fromInstrument: prev.instrumentName,
          toInstrument: curr.instrumentName,
          fromColorHex: prev.colorHex,
          toColorHex: curr.colorHex,
          fromTuning: prevTuning,
          toTuning: currTuning,
          fromCapo: prevCapo,
          toCapo: currCapo,
          isInstrumentChange,
          isTuningChange,
          isCapoChange,
          alertText: alertParts.join(' • '),
          needsRoadieAssistance: curr.needsAssistance,
        });
      }
    }
  }

  return alerts;
}

/**
 * Returns musician-specific data for a song in the setlist
 */
export interface MusicianSongDetail {
  song: SongItem;
  songIndex: number;
  isPlaying: boolean;
  assignment?: MusicianAssignment;
  hasChangeAlert: boolean;
  changeAlert?: MusicianChangeAlert;
  effectiveTuning: string;
  effectiveCapo: number;
  effectiveBpm?: number;
}

export function getMusicianSetlistView(
  songs: SongItem[],
  musicianIdentifier: { id?: string; name: string }
): MusicianSongDetail[] {
  let prevAssignmentForMusician: MusicianAssignment | null = null;
  let prevSong: SongItem | null = null;

  return songs.map((song, index) => {
    if (song.isBreak) {
      return {
        song,
        songIndex: index,
        isPlaying: false,
        hasChangeAlert: false,
        effectiveTuning: '',
        effectiveCapo: 0,
      };
    }

    const assignments = getNormalizedAssignments(song);
    const assignment = assignments.find(
      (a) => (musicianIdentifier.id && a.musicianId && a.musicianId === musicianIdentifier.id) ||
             (musicianIdentifier.name && a.musicianName && a.musicianName.trim().toLowerCase() === musicianIdentifier.name.trim().toLowerCase())
    );

    const isPlaying = Boolean(assignment);
    let changeAlert: MusicianChangeAlert | undefined = undefined;

    if (assignment && prevAssignmentForMusician && prevSong) {
      const isInstrumentChange = Boolean(
        assignment.instrumentName &&
        prevAssignmentForMusician.instrumentName &&
        assignment.instrumentName.trim().toLowerCase() !== prevAssignmentForMusician.instrumentName.trim().toLowerCase()
      );

      const currTuning = assignment.tuning || song.tuning || '';
      const prevTuning = prevAssignmentForMusician.tuning || prevSong.tuning || '';
      const isTuningChange = Boolean(
        currTuning &&
        prevTuning &&
        currTuning.trim().toLowerCase() !== prevTuning.trim().toLowerCase()
      );

      const currCapo = assignment.capoFret ?? song.capoFret ?? 0;
      const prevCapo = prevAssignmentForMusician.capoFret ?? prevSong.capoFret ?? 0;
      const isCapoChange = currCapo !== prevCapo;

      if (isInstrumentChange || isTuningChange || isCapoChange) {
        let alertParts: string[] = [];
        if (isInstrumentChange) {
          alertParts.push(`Cambio de guitarra/instrumento: ${assignment.instrumentName}`);
        }
        if (isTuningChange) {
          alertParts.push(`Afinar en ${currTuning}`);
        }
        if (isCapoChange) {
          alertParts.push(currCapo > 0 ? `Capo Traste ${currCapo}` : 'Sin Capo');
        }

        changeAlert = {
          musicianId: assignment.musicianId,
          musicianName: assignment.musicianName,
          fromInstrument: prevAssignmentForMusician.instrumentName,
          toInstrument: assignment.instrumentName,
          fromColorHex: prevAssignmentForMusician.colorHex,
          toColorHex: assignment.colorHex,
          fromTuning: prevTuning,
          toTuning: currTuning,
          fromCapo: prevCapo,
          toCapo: currCapo,
          isInstrumentChange,
          isTuningChange,
          isCapoChange,
          alertText: alertParts.join(' • '),
          needsRoadieAssistance: assignment.needsAssistance,
        };
      }
    }

    if (assignment) {
      prevAssignmentForMusician = assignment;
      prevSong = song;
    }

    return {
      song,
      songIndex: index,
      isPlaying,
      assignment,
      hasChangeAlert: Boolean(changeAlert),
      changeAlert,
      effectiveTuning: assignment?.tuning || song.tuning || 'Estándar',
      effectiveCapo: assignment?.capoFret ?? song.capoFret ?? 0,
      effectiveBpm: song.bpm,
    };
  });
}
