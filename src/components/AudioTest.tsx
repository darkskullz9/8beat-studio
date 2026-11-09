import { useState } from "react";
import { audioEngine } from "../audio/AudioEngine";

type SoundType = "kick" | "snare" | "hat";

function AudioTest() {
    const [status, setStatus] = useState("Audio engine is not initialized");
    const [loading, setLoading] = useState(false);

    async function playSound(sound: SoundType) {
        try {
            setLoading(true);

            // Initialize engine on first click
            await audioEngine.initialize();

            // Play asked sound
            switch(sound) {
                case "kick":
                    audioEngine.playKick();
                    break;

                case "snare":
                    audioEngine.playSnare();
                    break;

                case "hat":
                    audioEngine.playHat();
                    break;
            }

            setStatus("Audio engine is ready")
        } catch(error) {
            console.error("Audio initialization error:", error);
            setStatus("Audio initialization failed");
        } finally {
            setLoading(false);
        }
    }

    return(
        <section className="audio-test">
            <h2>Audio Engine Test</h2>
            <p>{status}</p>

            <div className="audio-test-controls">
                <button
                    onClick={() => void playSound("kick")}
                    disabled={loading}
                >
                    Kick
                </button>

                <button
                    onClick={() => void playSound("snare")}
                    disabled={loading}
                >
                    Snare
                </button>

                <button
                    onClick={() => void playSound("hat")}
                    disabled={loading}
                >
                    Hat
                </button>

            </div>
        </section>
    );
}

export default AudioTest;