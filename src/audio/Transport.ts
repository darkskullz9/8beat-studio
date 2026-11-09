import * as Tone from "tone";

export type Subdivision = "4n" | "8n" | "16n" | "32n";

class Transport {
    private stepIndex = 0;

    private get transport() {
        return Tone.getTransport();
    }

    // Tempo: 40 to 240 BPM
    setBpm(bpm: number) {
        const safeBpm = Math.max(40, Math.min(240, bpm));
        this.transport.bpm.value = safeBpm;
    }

    getBpm(): number {
        return this.transport.bpm.value;
    }

    // Start
    start(): void {
        this.transport.start();
    }

    // Stop
    stop(): void {
        this.transport.stop();
        this.transport.position = 0;
        this.stepIndex = 0;
    }

    // Repeat
    scheduleRepeat(
        callback: (time: number, step: number) => void,
        subdivision: Subdivision = "16n",
        steps = 16,
    ): void {
        this.clearEvents();
        this.stepIndex = 0;

        this.transport.scheduleRepeat((time) => {
            callback(time, this.stepIndex);
            this.stepIndex = (this.stepIndex + 1) % steps;
        }, subdivision);
    }

    // Delete scheduled events
    clearEvents(): void {
        this.transport.cancel(0);
        this.stepIndex = 0;
    }

    // Track position
    getPosition(): string {
        return this.transport.position.toString();
    }
}

export const transport = new Transport();