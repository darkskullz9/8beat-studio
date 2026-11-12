import * as Tone from "tone";
import { audioEngine } from "./AudioEngine";
import type { DrumType } from "../types/sequencer";

class SamplerEngine {
    private players = new Map<DrumType, Tone.Player>();
    private sampleNames = new Map<DrumType, string>();

    async loadSample(trackId: DrumType, file: File): Promise<void> {
        const supportedExtension = /\.(wav|mp3|ogg|flac)$/i.test(file.name);

        if (!file.type.startsWith("audio/") && !supportedExtension) {
            throw new Error("Unsupported audio file.");
        }

        const objectUrl = URL.createObjectURL(file);
        const newPlayer = new Tone.Player();

        newPlayer.connect(audioEngine.getMasterOutput());

        try {
            await newPlayer.load(objectUrl);

            // Replace new sample only if loading successed
            const previousPlayer = this.players.get(trackId);

            previousPlayer?.stop();
            previousPlayer?.dispose();

            this.players.set(trackId, newPlayer);
            this.sampleNames.set(trackId, file.name);
        } catch (error) {
            newPlayer.dispose();
            throw error;
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    }

    // Preview a sample from the interface.
    async preview(trackId: DrumType): Promise<void> {
        await audioEngine.initialize();
        this.trigger(trackId);
    }

    // Trigger a sample at a precise audio time.
    trigger(trackId: DrumType, time?: number): void {
        const player = this.players.get(trackId);

        if (!player) return;

        if (player.state === "started") {
            player.stop();
        }

        player.start(time ?? Tone.now());
    }

    stop(trackId: DrumType): void {
        this.players.get(trackId)?.stop();
    }

    hasSample(trackId: DrumType): boolean {
        return this.players.has(trackId);
    }

    getSampleName(trackId: DrumType): string | null {
        return this.players.get(trackId)?.loaded
            ? this.sampleNames.get(trackId) ?? null
            : null;
    }

    disposeTrack(trackId: DrumType): void {
        this.players.get(trackId)?.dispose();
        this.players.delete(trackId);
        this.sampleNames.delete(trackId);
    }

    dispose(): void {
        this.players.forEach((player) => player.dispose());

        this.players.clear();
        this.sampleNames.clear();
    }
}

export const samplerEngine = new SamplerEngine();