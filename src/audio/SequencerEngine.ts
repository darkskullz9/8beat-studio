import { audioEngine } from "./AudioEngine";
import { transport } from "./Transport";
import { samplerEngine } from "./SamplerEngine";
import { pianoRollEngine } from "./PianoRollEngine";
import { usePianoRollStore } from "../stores/pianoRollStore";

import type { DrumTrack } from "../types/sequencer";

const TICKS_PER_DRUM_STEP = 6;

class SequencerEngine {
    private playing = false;

    start(
        getTracks: () => DrumTrack[],
        onStepChange: (step: number) => void,
    ): void {
        if(this.playing) return;

        this.playing = true;

        // Drum sequencer: 16 steps per bar
        transport.scheduleRepeat((time, tick) => {
            if (tick % TICKS_PER_DRUM_STEP !== 0) return;

            const step = tick / TICKS_PER_DRUM_STEP;
            const tracks = getTracks();

            onStepChange(step);

            tracks.forEach((track) => {
                if(track.muted) return;
                if(!track.steps[step]) return;

                if(samplerEngine.hasSample(track.id)) {
                    samplerEngine.trigger(track.id, time);
                    return;
                }

                switch(track.id) {
                    case "kick":
                        audioEngine.playKick(time);
                        break;

                    case "snare":
                        audioEngine.playSnare(time);
                        break;

                    case "hat":
                        audioEngine.playHat(time);
                        break;
                }
            });
        }, "drums"
    );

    // Piano Roll: 96 ticks per bar
    transport.scheduleRepeat((time, tick) => {
            const pianoRollState = usePianoRollStore.getState();

            pianoRollState.setCurrentTick(tick);

            pianoRollEngine.playTick(
                pianoRollState.notes,
                tick, 
                time,
                transport.getBpm()
            );
        }, "piano-roll");

        transport.start();
    }

    stop(): void {
        if(!this.playing) return;

        transport.stop();
        transport.clearEvents();

        usePianoRollStore.getState().setCurrentTick(0);

        this.playing = false;
    }

    get isPlaying(): boolean {
        return this.playing;
    }
}

export const sequencerEngine = new SequencerEngine();