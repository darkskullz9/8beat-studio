import { audioEngine } from "./AudioEngine";
import { transport } from "./Transport";
import { samplerEngine } from "./SamplerEngine";

import type { DrumTrack } from "../types/sequencer";

class SequencerEngine {
    private playing = false;

    start(
        getTracks: () => DrumTrack[],
        onStepChange: (step: number) => void,
    ): void {
        if(this.playing) return;

        this.playing = true;

        transport.scheduleRepeat((time, step) => {
                const tracks = getTracks();

                // Update visual position
                onStepChange(step);

                // Process each track
                tracks.forEach((track) => {

                    // Ignore muted tracks
                    if(track.muted) return;

                    // Ignore inactive steps.
                    if(!track.steps[step]) return;

                    // Use loaded sample if available.
                    if(samplerEngine.hasSample(track.id)) {
                        samplerEngine.trigger(track.id, time);
                        return;
                    }

                    // Otherwise use built-in synthesizers
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
            }, "16n", 16, "drums"
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