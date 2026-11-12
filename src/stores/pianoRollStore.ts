import { create } from "zustand";
import type { PianoNote } from "../types/pianoRoll";

import {
    PIANO_ROLL_STEPS,
    PIANO_ROLL_MIN_PITCH,
    PIANO_ROLL_MAX_PITCH,
    PIANO_ROLL_DEFAULT_VELOCITY,
} from "../types/pianoRoll";

interface PianoRollState {
    notes: PianoNote[];
    currentStep: number;

    addNote: (
        pitch: number,
        startStep: number,
        durationSteps?: number,
        velocity?: number
    ) => void;

    removeNote: (id: string) => void;

    updateNote: (
        id: string,
        updates: Partial<Pick<
            PianoNote,
            "pitch" | "startStep" | "durationSteps" | "velocity"
        >>
    ) => void;

    setCurrentStep: (step: number) => void;
    clearNotes: () => void;
}

let nextNoteId = 1;

export const usePianoRollStore = create<PianoRollState>((set) => ({
    notes: [],
    currentStep: 0,

    addNote: (
        pitch,
        startStep,
        durationSteps = 1,
        velocity = PIANO_ROLL_DEFAULT_VELOCITY
    ) => {
        const safePitch = Math.max(
            PIANO_ROLL_MIN_PITCH,
            Math.min(PIANO_ROLL_MAX_PITCH, Math.round(pitch))
        );

        const safeStart = Math.max(
            0,
            Math.min(PIANO_ROLL_STEPS - 1, Math.floor(startStep))
        );

        const safeDuration = Math.max(
            1,
            Math.min(PIANO_ROLL_STEPS - safeStart, Math.floor(durationSteps))
        );

        const safeVelocity = Math.max(
            0,
            Math.min(127, Math.round(velocity))
        );

        set((state) => {
            const alreadyExists = state.notes.some(
                (note) => 
                    note.pitch === safePitch &&
                    note.startStep === safeStart
            );

            if (alreadyExists) return state;

            const newNote: PianoNote = {
                id: `note-${nextNoteId++}`,
                pitch: safePitch,
                startStep: safeStart,
                durationSteps: safeDuration,
                velocity: safeVelocity
            };

            return {
                notes: [...state.notes, newNote],
            };
        });
    },

    removeNote: (id) => {
        set((state) => ({
            notes: state.notes.filter((note) => note.id !== id),
        }));
    },

    updateNote: (id, updates) => {
        set((state) => ({
            notes: state.notes.map((note) => {
                if (note.id !== id) return note;

                const updated = { ...note, ...updates };

                updated.pitch = Math.max(
                    PIANO_ROLL_MIN_PITCH,
                    Math.min(PIANO_ROLL_MAX_PITCH, Math.round(updated.pitch))
                );

                updated.startStep = Math.max(
                    0,
                    Math.min(PIANO_ROLL_STEPS - 1, Math.floor(updated.startStep))
                );

                updated.durationSteps = Math.max(
                    1,
                    Math.min(
                        PIANO_ROLL_STEPS - updated.startStep,
                        Math.floor(updated.durationSteps)
                    )
                );

                updated.velocity = Math.max(
                    0,
                    Math.min(127, Math.round(updated.velocity))
                );

                return updated;
            }),
        }));
    },

    setCurrentStep: (step) => {
        set({
            currentStep: Math.max(
                0,
                Math.min(PIANO_ROLL_STEPS - 1, step)
            ),
        });
    },

    clearNotes: () => {
        set({ notes: [], currentStep: 0 });
    },
}));