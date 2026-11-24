import * as Tone from "tone";
import { audioEngine } from "./AudioEngine";
import type { PianoNote } from "../types/pianoRoll";

import { PIANO_ROLL_TICKS_PER_BAR } from "../types/pianoRoll";

class PianoRollEngine {
    private synth: Tone.PolySynth;

    constructor() {
        this.synth = new Tone.PolySynth(Tone.Synth).connect(
            audioEngine.getMasterOutput()
        );

        this.synth.volume.value = -8;
    }

    playTick(
        notes: PianoNote[],
        tick: number,
        time: number,
        bpm: number
    ): void {
        const notesToPlay = notes.filter(
            (note) => note.startTick === tick
        );
        
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
    }
}


export const pianoRollEngine = new PianoRollEngine();