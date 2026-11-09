import * as Tone from "tone";

class AudioEngine {
    private initialized = false;

    // Main audio output
    private master = new Tone.Gain(0.8).toDestination();

    // Test synth
    private kick = new Tone.MembraneSynth().connect(this.master);
    private snare = new Tone.NoiseSynth({
        noise: {
            type: "white",
        },

        envelope: {
            attack: 0.001,
            decay: 0.15,
            sustain: 0,
        },
    }).connect(this.master);

    private hat = new Tone.MetalSynth({
        envelope: {
            attack: 0.001,
            decay: 0.08,
            release: 0.01,
        },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
    }).connect(this.master);

    // Audio initialization
    async initialize(): Promise<void> {
        if (this.initialized) return;
        await Tone.start();
        
        this.initialized = true;

        console.log("Audio Engine initialized");
    }

    // Engine state
    get isInitialized(): boolean {
        return this.initialized;
    }

    // BPM Management
    setBpm(bpm: number): void {
        Tone.getTransport().bpm.value = bpm;
    }

    // Transport
    play(): void {
        Tone.getTransport().start();
    }

    stop(): void {
        Tone.getTransport().stop();
        Tone.getTransport().position = 0;
    }

    // Master volume
    setMasterVolume(volume: number): void {
        this.master.gain.rampTo(volume, 0.05);
    }

    // Test sounds
    playKick(time?: number): void {
        this.kick.triggerAttackRelease('C1', '8n', time ?? Tone.now());
    }

    playSnare(time?: number): void {
        this.snare.triggerAttackRelease('16n', time ?? Tone.now());
    }

    playHat(time?: number): void {
        this.hat.triggerAttackRelease('32n', time ?? Tone.now());
    }

    // Clean
    dispose(): void {
        this.kick.dispose();
        this.snare.dispose();
        this.hat.dispose();
        this.master.dispose();

        this.initialized = false;
    }
}

export const audioEngine = new AudioEngine();