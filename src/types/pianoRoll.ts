export interface PianoNote {
    id: string;
    pitch: number;
    startStep: number;
    durationSteps: number;
    velocity: number;
}

export const PIANO_ROLL_STEPS = 16;

export const PIANO_ROLL_MIN_PITCH = 48;
export const PIANO_ROLL_MAX_PITCH = 71;

export const PIANO_ROLL_DEFAULT_VELOCITY = 100;