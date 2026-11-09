import { useSequencerStore } from "../stores/sequencerStore";
import { sequencerEngine } from "../audio/SequencerEngine";
import { audioEngine } from "../audio/AudioEngine";
import { transport } from "../audio/Transport";

function StepSequencer() {
    const tracks = useSequencerStore((state) => state.tracks);
    const currentStep = useSequencerStore((state) => state.currentStep);
    const toggleStep = useSequencerStore((state) => state.toggleStep);
    const toggleMute = useSequencerStore((state) => state.toggleMute);
    const setCurrentStep = useSequencerStore((state) => state.setCurrentStep);

    async function handlePlay() {
        await audioEngine.initialize();

        sequencerEngine.start(
            () => useSequencerStore.getState().tracks,
            (step) => setCurrentStep(step),
        );
    }

    function handleStop() {
        sequencerEngine.stop();
        setCurrentStep(-1);
    }

    function handleBpmChange(value: number) {
        transport.setBpm(value);
    }

    return (
        <section className="sequencer">
            <div className="sequencer-header">
                <div>
                    <span className="eyebrow">PATTERN EDITOR</span>
                    <h2>Step Sequencer</h2>
                </div>

                <div className="sequencer-controls">
                    <label>
                        BPM
                        <input 
                            type="number" 
                            min="40"
                            max="240"
                            defaultValue={transport.getBpm()}
                            onChange={(event) => 
                                handleBpmChange(Number(event.target.value))
                            }
                        />
                    </label>

                    <button onClick={() => void handlePlay()}>
                        Play
                    </button>

                    <button onClick={() => void handleStop()}>
                        Stop
                    </button>
                </div>
            </div>

            <div className="step-grid">
                <div className="track-heading">TRACK</div>

                {Array.from({ length: 16 }, (_, index) => (
                    <div className="step-number" key={index}>
                        {index + 1}
                    </div>
                ))}

                {tracks.map((track) => (
                    <div className="track-row" key={track.id}>
                        <div className="track-label">
                            <span>{track.name}</span>

                            <button
                                className={track.muted ? "muted" : ""}
                                onClick={() => toggleMute(track.id)}
                            >
                                M
                            </button>
                        </div>

                        <div className="track-steps">
                            {track.steps.map((active, index) => (
                                <button 
                                    key={index}
                                    className={[
                                        "step",
                                        active ? "active" : "",
                                        currentStep === index ? "playing" : "",
                                        index % 4 === 0 ? "beat-start" : "",
                                    ].join(" ")}
                                    onClick={() => 
                                        toggleStep(track.id, index)
                                    }
                                    aria-label={`${track.name}, step ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default StepSequencer;