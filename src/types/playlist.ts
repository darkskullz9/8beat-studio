import type { DrumTrack } from "./sequencer";
import type { PianoNote } from "./pianoRoll";

export type PlaylistTrackType = "drums" | "melodic";

export interface PlaylistTrack {
    id: string;
    name: string;
    type: PlaylistTrackType;
    muted: boolean;
}

export interface PatternClip {
    id: string;
    patternId: string;
    trackId: string;
    startTick: number;
    durationTicks: number;
}

export interface DrumPattern {
    id: string;
    name: string;
    type: "drums";
    lengthTicks: number;
    tracks: DrumTrack[]; 
}

export interface MelodicPattern {
    id: string;
    name: string;
    type: "melody";
    lengthTicks: number;
    tracks: PianoNote[];
}

export type PlaylistPattern = DrumPattern | MelodicPattern;

export interface PlaylistState {
    tracks: PlaylistTrack[];
    clips: PatternClip[];
    patterns: PlaylistPattern[];
}