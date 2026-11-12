import { useState } from "react";
import { samplerEngine } from "../../audio/SamplerEngine";
import type { DrumType } from "../../types/sequencer";

const sampleSlots: { id: DrumType; label: string }[] = [
    { id: "kick", label: "Kick" },
    { id: "snare", label: "Snare" },
    { id: "hat", label: "Hat" },
];

function Sampler() {
    const [sampleNames, setSampleNames] = useState<
        Partial<Record<DrumType, string>>
    >({});

    const [loading, setLoading] = useState<DrumType | null>(null);
    const [status, setStatus] = useState("Ready");

    async function handleFileChange(
        trackId: DrumType,
        file?: File,
    ) {
        if(!file) return;

        setLoading(trackId);
        setStatus(`Loading ${file.name}...`);

        try {
            await samplerEngine.loadSample(trackId, file);

            setSampleNames((current) => ({
                ...current,
                [trackId]: file.name,
            }));

            setStatus(`${file.name} loaded`);
        } catch (error) {
            console.error("Sample loading error:", error);
            setStatus(`Unable to load ${file.name}`);
        } finally {
            setLoading(null);
        }
    }

    async function handlePreview(trackId: DrumType) {
        try {
            await samplerEngine.play(trackId);
            setStatus(`Previewing ${trackId}`);
        } catch (error) {
            console.error("Preview error:", error);
            setStatus("Preview failed");
        }
    }

    function handleRemove(trackId: DrumType) {
        samplerEngine.disposeTrack(trackId);

        setSampleNames((current) => {
            const updated = { ...current };
            delete updated[trackId];
            return updated;
        })

        setStatus(`${trackId} deleted`);
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

            <div className="sample-slots">
                {sampleSlots.map((slot) => {
                    const loadedName = sampleNames[slot.id];
                    const isLoading = loading === slot.id;

                    return (
                        <div className="sampler-slot" key={slot.id}>
                            <div className="sampler-slot-info">
                                <strong>{slot.label}</strong>
                                <span title={loadedName ?? "No sample loaded"}>
                                    {loadedName ?? "No sample loaded"}
                                </span>
                            </div>

                            <div className="sampler-slot-actions">
                                <label className="sample-import-btn">
                                    {isLoading ? "Loading..." : "Import"}
                                    <input
                                        type="file"
                                        accept=".wav,.mp3,.ogg,.flac,audio/*"
                                        disabled={loading !== null}
                                        onChange={(event) => {
                                            void handleFileChange(
                                                slot.id,
                                                event.target.files![0],
                                            );
                                            event.target.value = "";
                                        }}
                                    />
                                </label>

                                <button
                                    onClick={() => void handlePreview(slot.id)}
                                    disabled={!loadedName || loading !== null}
                                >
                                    Preview
                                </button>

                                <button
                                    onClick={() => handleRemove(slot.id)}
                                    disabled={!loadedName || loading !== null}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default Sampler;