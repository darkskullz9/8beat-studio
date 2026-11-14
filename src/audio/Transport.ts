import * as Tone from "tone";

type TickCallback = (time: number, tick: number) => void;
class Transport {
    private bpm = 120;
    private tickIndex = 0;
    private readonly ticksPerBar = 96;
    private isScheduled = false;

    private callbacks = new Map<string, TickCallback>();

    // Tempo: 40 to 240 BPM
    setBpm(bpm: number): void {
        this.bpm = Math.max(40, Math.min(240, bpm));
        Tone.getTransport().bpm.value = this.bpm;
    }

    getBpm(): number {
        return this.bpm;
    }

    // Register a callback executed on every tick
    scheduleRepeat(callback: TickCallback, key = "default"): void {
        this.callbacks.set(key, callback);

        const toneTransport = Tone.getTransport();
        toneTransport.bpm.value = this.bpm;

        // Keep only one shared clock
        if (this.isScheduled) return;

        toneTransport.scheduleRepeat((time) => {
            const currentTick = this.tickIndex;

            this.callbacks.forEach((listener) => {
                listener(time, currentTick);
            });

            this.tickIndex = (this.tickIndex + 1) % this.ticksPerBar;
        }, "64t");

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
        this.tickIndex = 0;
    }

    clearEvents(): void {
        Tone.getTransport().cancel(0);
        this.isScheduled = false;
    }

    getPosition(): string {
        return Tone.getTransport().position.toString();
    }
}

export const transport = new Transport();