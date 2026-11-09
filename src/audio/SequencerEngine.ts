import { audioEngine } from "./AudioEngine";
import { transport } from "./Transport";

import type { DrumTrack } from "../types/sequencer";

class SequencerEngine {
    private playing = false;

    start(
        getTracks: () => DrumTrack[],
        onStepChange: (step: number) => void,
    ): void {
        if(this.playing) return;

        this.playing = true;

        transport.scheduleRepeat(
            (time, step) => {
                const tracks = getTracks();

                // Actualize visual position
                onStepChange(step);

                // Play active instruments
                tracks.forEach((track) => {
                    if(track.muted || !track.steps[step]) {
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
            },
            "16n",
            16,
        );

        transport.start();
    }

    stop(): void {
        if(!this.playing) return;

        transport.stop();
        transport.clearEvents();

        this.playing = false;
    }

    get isPlaying(): boolean {
        return this.playing;
    }
}

export const sequencerEngine = new SequencerEngine();