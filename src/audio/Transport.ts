import * as Tone from "tone";

type TickCallback = (time: number, tick: number) => void;

class Transport {
    private bpm = 120;
    private tickIndex = 0;

    private readonly ticksPerBar = 96;
    private readonly ticksPerCallback = 3;

    private loopLengthBars = 1;
    private isScheduled = false;

    private callbacks = new Map<string, TickCallback>();
    private tickListeners = new Set<(tick: number) => void>();

    subscribeToTicks(listener: (tick: number) => void): () => void {
        this.tickListeners.add(listener);

        return () => {
            this.tickListeners.delete(listener);
        };
    }

    private notifyTickListeners(tick: number): void {
        this.tickListeners.forEach((listener) => listener(tick));
    }

    // Tempo: 40 to 240 BPM
    setBpm(bpm: number): void {
        this.bpm = Math.max(40, Math.min(240, bpm));
        Tone.getTransport().bpm.value = this.bpm;
    }

    getBpm(): number {
        return this.bpm;
    }

    // Manage loop length
    setLoopLengthBars(bars: number): void {
        this.loopLengthBars = Math.max(1, Math.floor(bars));

        const totalTicks = this.ticksPerBar * this.loopLengthBars;

        this.tickIndex %= totalTicks;
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

            this.notifyTickListeners(currentTick);

            const totalTicks = this.ticksPerBar * this.loopLengthBars;

            this.tickIndex = (this.tickIndex + this.ticksPerCallback) % totalTicks;
        }, "32n");

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
        this.notifyTickListeners(0);
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