import * as Tone from "tone";
import { audioEngine } from "./AudioEngine";

class SamplerEngine {
    private player: Tone.Player | null = null;
    private sampleName: string | null = null;
    private loading = false;

    async loadSample(file: File): Promise<void> {
        if (this.loading) {
            throw new Error("A sample is already loading.");
        }

        if (!file.type.startsWith("audio")) {
            throw new Error("Unsupported audio file.");
        }

        this.loading = true;

        const objectUrl = URL.createObjectURL(file);
        const newPlayer = new Tone.Player();

        newPlayer.connect(audioEngine.getMasterOutput());

        try {
            await newPlayer.load(objectUrl);

            // Replace new sample only if loading successed
            this.player?.dispose();

            this.player = newPlayer;
            this.sampleName = file.name;

            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            newPlayer.dispose();
            URL.revokeObjectURL(objectUrl);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    async play(): Promise<void> {
        if (!this.player) {
            throw new Error("No sample loaded.");
        }

        await audioEngine.initialize();

        this.player.stop();
        this.player.start();
    }

    stop(): void {
        this.player?.stop();
    }

    setVolume(volume: number): void {
        if (!this.player) return;

        const safeVolume = Math.max(0, Math.min(1, volume));
        const decibels = safeVolume === 0
            ? -Infinity
            : 20 * Math.log10(safeVolume);

        this.player.volume.rampTo(decibels, 0.05);
    }

    getSampleName(): string | null {
        return this.sampleName;
    }

    get isLoaded(): boolean {
        return this.player !== null;
    }

    dispose(): void {
        this.player?.dispose();
        this.player = null;
        this.sampleName =null;
    }
}

export const samplerEngine = new SamplerEngine();