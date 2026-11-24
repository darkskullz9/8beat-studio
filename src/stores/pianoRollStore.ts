import { create } from "zustand";
import type { PianoNote, PianoRollPatternLength } from "../types/pianoRoll";

import {
    PIANO_ROLL_TICKS_PER_BAR,
    PIANO_ROLL_DEFAULT_LENGTH_BARS,
    PIANO_ROLL_DEFAULT_NOTE_DURATION,
    PIANO_ROLL_MIN_PITCH,
    PIANO_ROLL_MAX_PITCH,
    PIANO_ROLL_DEFAULT_VELOCITY,
} from "../types/pianoRoll";

interface PianoRollState {
    notes: PianoNote[];
    currentTick: number;
    patternLengthBars: PianoRollPatternLength;

    addNote: (
        pitch: number,
        startTick: number,
        durationTicks?: number,
        velocity?: number
    ) => void;

    removeNote: (id: string) => void;

    updateNote: (
        id: string,
        updates: Partial<Pick<
            PianoNote,
            "pitch" | "startTick" | "durationTicks" | "velocity"
        >>
    ) => void;

    setCurrentTick: (tick: number) => void;
    setPatternLengthBars: (bars: PianoRollPatternLength) => void;
    clearNotes: () => void;
}

let nextNoteId = 1;

export const usePianoRollStore = create<PianoRollState>((set) => ({
    notes: [],
    currentTick: 0,
    patternLengthBars: PIANO_ROLL_DEFAULT_LENGTH_BARS,

    addNote: (
        pitch,
        startTick,
        durationTicks = PIANO_ROLL_DEFAULT_NOTE_DURATION,
        velocity = PIANO_ROLL_DEFAULT_VELOCITY
    ) => {
        set((state) => {
            const totalTicks = state.patternLengthBars * PIANO_ROLL_TICKS_PER_BAR;

            const safePitch = Math.max(
                PIANO_ROLL_MIN_PITCH,
                Math.min(PIANO_ROLL_MAX_PITCH, Math.round(pitch))
            );
    
            const safeStart = Math.max(
                0,
                Math.min(totalTicks - 1, Math.floor(startTick))
            );
    
            const safeDuration = Math.max(
                1,
                Math.min(totalTicks - safeStart, Math.floor(durationTicks))
            );
    
            const safeVelocity = Math.max(
                0,
                Math.min(127, Math.round(velocity))
            );
    
            const alreadyExists = state.notes.some(
                (note) => 
                    note.pitch === safePitch &&
                    note.startTick === safeStart
            );
    
            if (alreadyExists) return state;
    
            const newNote: PianoNote = {
                id: `note-${nextNoteId++}`,
                pitch: safePitch,
                startTick: safeStart,
                durationTicks: safeDuration,
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
        set((state) => {
            const totalTicks = 
                state.patternLengthBars * PIANO_ROLL_TICKS_PER_BAR;

            return {
                notes: state.notes.map((note) => {
                    if (note.id !== id) return note;
    
                    const updated = { ...note, ...updates };
    
                    updated.pitch = Math.max(
                        PIANO_ROLL_MIN_PITCH,
                        Math.min(
                            PIANO_ROLL_MAX_PITCH, 
                            Math.round(updated.pitch)
                        )
                    );
    
                    updated.startTick = Math.max(
                        0,
                        Math.min(
                            totalTicks - 1, 
                            Math.floor(updated.startTick)
                        )
                    );
    
                    updated.durationTicks = Math.max(
                        1,
                        Math.min(
                            totalTicks - updated.startTick,
                            Math.floor(updated.durationTicks)
                        )
                    );
    
                    updated.velocity = Math.max(
                        0,
                        Math.min(127, Math.round(updated.velocity))
                    );
    
                    return updated;
                })
            };
        });
    },

    setCurrentTick: (tick) => {
        set((state) =>{
            const totalTicks =
                state.patternLengthBars * PIANO_ROLL_TICKS_PER_BAR;

            return {
                currentTick: Math.max(
                    0,
                    Math.min(totalTicks - 1, Math.floor(tick))
                )
            };
        });
    },

    setPatternLengthBars: (bars) => {
        set((state) => {
            const totalTicks = bars * PIANO_ROLL_TICKS_PER_BAR;

            const updateNotes = state.notes
                .filter((note) => note.startTick < totalTicks)
                .map((note) => ({
                    ...note,
                    durationTicks: Math.min(
                        note.durationTicks,
                        totalTicks - note.startTick
                    )
                }));

            return {
                patternLengthBars: bars,
                notes: updateNotes,
                currentTick: Math.min(
                    state.currentTick,
                    totalTicks - 1
                )
            };
        });
    },

    clearNotes: () => {
        set({ notes: [], currentTick: 0 });
    }
}));