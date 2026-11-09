export type DrumType = "kick" | "snare" | "hat";

export interface DrumTrack {
    id: DrumType;
    name: string;
    steps: boolean[];
    muted: boolean;
}

export interface SequencerPattern {
    id: string;
    name: string;
    length: number;
    tracks: DrumTrack[];
}