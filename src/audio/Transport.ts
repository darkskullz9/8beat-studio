import * as Tone from "tone";

type StepCallback = (time: number, step: number) => void;
class Transport {
    private bpm = 120;
    private stepIndex = 0;
    private loopSteps = 16;
    private isScheduled = false;

    private callbacks = new Map<string, StepCallback>();

    // Tempo: 40 to 240 BPM
    setBpm(bpm: number): void {
        this.bpm = Math.max(40, Math.min(240, bpm));
        Tone.getTransport().bpm.value = this.bpm;
    }

    getBpm(): number {
        return this.bpm;
    }

    // Repeat
    scheduleRepeat(
        callback: StepCallback,
        subdivision = "16n",
        steps = 16,
        key = "default",
    ): void {
        this.callbacks.set(key, callback);

        this.loopSteps = steps;

        const toneTransport = Tone.getTransport();
        toneTransport.bpm.value = this.bpm;

        // One clock for all engines
        if (this.isScheduled) return;

        toneTransport.scheduleRepeat((time) => {
            const currentStep = this.stepIndex;

            this.callbacks.forEach((listener) => {
                listener(time, currentStep);
            });

            this.stepIndex = (this.stepIndex + 1) % this.loopSteps;
        }, subdivision);

        this.isScheduled = true;
    }

    start(): void {
        const toneTransport = Tone.getTransport();

        if (toneTransport.state !== "started") {
            toneTransport.start();
        }
    }

    stop(): void {
        Tone.getTransport().stop();
        this.stepIndex = 0;
    }

    // Delete scheduled events
    clearEvents(): void {
        Tone.getTransport().cancel(0);
        this.isScheduled = false;
    }

    // Track position
    getPosition(): string {
        return Tone.getTransport().position.toString();
    }
}

export const transport = new Transport();