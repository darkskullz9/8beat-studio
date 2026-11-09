import { create } from "zustand";
import type { DrumTrack, DrumType } from "../types/sequencer";

const initialTracks: DrumTrack[] = [
    {
        id: "kick",
        name: "Kick",
        muted: false,
        steps: [
            true, false, false, false, 
            true, false, false, false, 
            true, false, false, false, 
            true, false, false, false
        ],
    },

    {
        id: "snare",
        name: "Snare",
        muted: false,
        steps: [
            false, false, false, false, 
            true, false, false, false, 
            false, false, false, false, 
            true, false, false, false
        ],
    },

    {
        id: "hat",
        name: "Hi-Hat",
        muted: false,
        steps: Array.from(
            { length: 16 },
            (_, index) => index % 2 === 0,
        ),
    },
];

interface SequencerStore {
    tracks: DrumTrack[];
    currentStep: number;

    toggleStep: (trackId: DrumType, step: number) => void;
    toggleMute: (trackId: DrumType) => void;
    setCurrentStep: (step: number) => void;
}

export const useSequencerStore = 
create<SequencerStore>((set) => ({
    tracks: initialTracks,
    currentStep: -1,

    toggleStep: (trackId, step) => set((state) => ({
        tracks: state.tracks.map((track) => {
            if(track.id !== trackId) return track;

            return {
                ...track,
                steps: track.steps.map((active, index) => 
                    index === step ? !active : active,
                ),
            };
        }),
    })),

    toggleMute: (trackId) => set((state) => ({
        tracks: state.tracks.map((track) => 
            track.id === trackId
                ? { ...track, muted: !track.muted }
                : track,
        ),
    })),

    setCurrentStep: (step) => set({ currentStep: step }),
}));