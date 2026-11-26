import * as Tone from "tone";
import { audioEngine } from "./AudioEngine";
import type { PianoNote } from "../types/pianoRoll";

import { PIANO_ROLL_TICKS_PER_BAR } from "../types/pianoRoll";

class PianoRollEngine {
    private synth: Tone.PolySynth;
    private indexedNotes: PianoNote[] | null = null;
    private notesByTick = new Map<number, PianoNote[]>();

    constructor() {
        this.synth = new Tone.PolySynth(Tone.Synth).connect(
            audioEngine.getMasterOutput()
        );

        this.synth.volume.value = -8;
    }

    private getNotesAtTick(
        notes: PianoNote[],
        tick: number
    ): PianoNote[] {
        // Rebuild the index only when the notes array changes
        if(notes !== this.indexedNotes) {
            this.notesByTick.clear();

            notes.forEach((note) => {
                const existing = this.notesByTick.get(note.startTick);

                if(existing) {
                    existing.push(note);
                } else {
                    this.notesByTick.set(note.startTick, [note]);
                }
            });

            this.indexedNotes = notes;
        }

        return this.notesByTick.get(tick) ?? [];
    }

    playTick(
        notes: PianoNote[],
        tick: number,
        time: number,
        bpm: number
    ): void {
        const notesToPlay = this.getNotesAtTick(notes, tick);
        
        const tickDuration = 
            (60 / bpm * 4) / PIANO_ROLL_TICKS_PER_BAR
        ;

        notesToPlay.forEach((note) => {
            const pitch = Tone.Frequency(
                note.pitch,
                "midi"
            ).toNote();

            const duration = tickDuration * note.durationTicks * 0.95;

            const velocity = Math.max(0, Math.min(127, note.velocity)) / 127;

            this.synth.triggerAttackRelease(
                pitch,
                duration,
                time,
                velocity
            );
        });
    };

    dispose(): void {
        this.synth.dispose();
        this.notesByTick.clear();
        this.indexedNotes = null;
    }
}


export const pianoRollEngine = new PianoRollEngine();