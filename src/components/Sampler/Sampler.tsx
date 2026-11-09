import { useState } from "react";
import { samplerEngine } from "../../audio/SamplerEngine";

function Sampler() {
    const [sampleName, setSampleName] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.8);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("No sample loaded");

    async function handleFileChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];

        if(!file) return;

        setLoading(true);
        setStatus("Loading sample...");

        try {
            await samplerEngine.loadSample(file);

            setSampleName(file.name);
            setStatus("Sample ready");
        } catch (error) {
            console.error("Sample loading error:", error);
            setStatus("Unable to load sample");
        } finally {
            setLoading(false);

            // Allow to select the same file again
            event.target.value = "";
        }
    }

    async function handlePlay() {
        try {
            await samplerEngine.play();
            setStatus("Playing");
        } catch (error) {
            console.error("Sample playback error:", error);
            setStatus("Playback failed");
        }
    }

    function handleStop() {
        samplerEngine.stop();
        setStatus("Stopped");
    }

    function handleVolumeChange(value: number) {
        setVolume(value);
        samplerEngine.setVolume(value);
    }

    return (
        <section className="sampler">
            <div className="sampler-header">
                <div>
                    <span className="eyebrow">AUDIO MODULE</span>
                    <h2>Sampler</h2>
                </div>

                <span className="sampler-status">{status}</span>
            </div>

            <label className="sample-import">
                <input 
                    type="file" 
                    accept=".wav,.mp3,.ogg,.flac,audio/*" 
                    onChange={handleFileChange}
                    disabled={loading}
                />

                <span>
                    {loading ? "Loading..." : "Import sample"}
                </span>
            </label>

            <div className="sample-info">
                <strong>{sampleName ?? "No sample selected"}</strong>
            </div>

            <div className="sampler-controls">
                <button
                    onClick={() => void handlePlay()}
                    disabled={!samplerEngine.isLoaded || loading}
                >
                    Play
                </button>

                <button
                    onClick={handleStop}
                    disabled={!samplerEngine.isLoaded}
                >
                    Stop
                </button>

                <label className="sampler-volume">
                    Volume
                    <input 
                        type="range" 
                        min="0" 
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(event) => handleVolumeChange(Number(event.target.value))} 
                    />
                    <span>{Math.round(volume * 100)}%</span>
                </label>
            </div>
        </section>
    );
}

export default Sampler;