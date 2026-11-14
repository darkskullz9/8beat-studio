export interface PianoNote {
    id: string;
    pitch: number;
    startTick: number;
    durationTicks: number;
    velocity: number;
}

export const PIANO_ROLL_TICKS_PER_BAR = 96;

export const PIANO_ROLL_PATTERN_LENGTHS = [1, 2, 4, 8] as const;

export type PianoRollPatternLength = (typeof PIANO_ROLL_PATTERN_LENGTHS)[number];

export const PIANO_ROLL_DEFAULT_LENGTH_BARS: PianoRollPatternLength = 1;

export const PIANO_ROLL_DEFAULT_NOTE_DURATION = 6;

export const PIANO_ROLL_MIN_PITCH = 48;
export const PIANO_ROLL_MAX_PITCH = 71;

export const PIANO_ROLL_DEFAULT_VELOCITY = 100;