import * as Tone from "tone";
import { audioEngine } from "./AudioEngine";
import type { PianoNote } from "../types/pianoRoll";

class PianoRollEngine {
    private synth: Tone.PolySynth;

    constructor() {
        this.synth = new Tone.PolySynth(Tone.Synth).connect(
            audioEngine.getMasterOutput()
        );

        this.synth.volume.value = -8;
    }

    playStop(
        notes: PianoNote[],
        step: number,
        time: number,
        bpm: number
    ): void {
        const notesToPlay = notes.filter(
            (note) => note.startStep === step
        );

        notesToPlay.forEach((note) => {
            // MIDI to music notes
            const pitch = Tone.Frequency(
                note.pitch,
                "midi"
            ).toNote();

            const stepDuration = 60 / bpm / 4;

            const duration = stepDuration * note.durationSteps * 0.95;

            // Convert velocity to MIDI value
            const velocity = Math.max(0, Math.min(127, note.velocity)) / 127;

            this.synth.triggerAttackRelease(
                pitch,
                duration,
                time,
                velocity
            );
        });
    }

    dispose(): void {
        this.synth.dispose();
    }
}

export const pianoRollEngine = new PianoRollEngine();