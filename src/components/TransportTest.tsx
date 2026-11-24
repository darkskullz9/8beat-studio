import { useState } from "react";
import { audioEngine } from "../audio/AudioEngine";
import { transport } from "../audio/Transport";

function TransportTest() {
    const [bpm, setBpm] = useState(120);
    const [playing, setPlaying] = useState(false);
    const [status, setStatus] = useState("Stopped");

    async function handlePlay() {
        try {
            await audioEngine.initialize();

            transport.setBpm(bpm);

            // Test: Hat on each beat
            transport.scheduleRepeat(
                (time) => audioEngine.playHat(time),
                "transport-test"
            );

            transport.start();

            setPlaying(true);
            setStatus("Playing");
        } catch(error) {
            console.error("Transport error", error);
            setStatus("Playback error");
        }
    }

    function handleStop() {
        transport.stop();
        transport.clearEvents();

        setPlaying(false);
        setStatus("Stopped");
    }

    function handleBpmChange(value: number) {
        const safeValue = Math.max(40, Math.min(240, value));

        setBpm(safeValue);
        transport.setBpm(safeValue);
    }

    return(
        <section className="transport-test">
            <h2>Transport Test</h2>
            <p>Status: {status}</p>

            <div className="transport-test-controls">
                <label>
                    BPM
                    <input 
                        type="number"
                        min="40"
                        max="240"
                        value={bpm}
                        onChange={(event) =>
                            handleBpmChange(Number(event.target.value))
                        } 
                    />
                </label>

                <button onClick={() => void handlePlay()} disabled={playing}>
                    Play
                </button>

                <button onClick={handleStop} disabled={!playing}>
                    Stop
                </button>
            </div>
        </section>
    );
}

export default TransportTest;