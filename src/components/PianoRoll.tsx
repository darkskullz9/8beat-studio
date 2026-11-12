import { usePianoRollStore } from "../stores/pianoRollStore";

import {
    PIANO_ROLL_MIN_PITCH,
    PIANO_ROLL_MAX_PITCH,
    PIANO_ROLL_STEPS,
} from "../types/pianoRoll";

const NOTE_NAMES = [
    "C", "C#", "D", "D#", "E", "F", 
    "F#", "G", "G#", "A", "A#", "B",
];

const pitches = Array.from(
    { length: PIANO_ROLL_MAX_PITCH - PIANO_ROLL_MIN_PITCH + 1 },
    (_, index) => PIANO_ROLL_MAX_PITCH - index
);

function getNoteName(pitch: number): string {
    const noteName = NOTE_NAMES[pitch % 12];
    const octave = Math.floor(pitch / 12) - 1;

    return `${noteName}${octave}`;
}

function isBlackKey(pitch: number): boolean {
    return [1, 3, 6, 8, 10].includes(pitch % 12);
}

function PianoRoll() {
    const notes = usePianoRollStore((state) => state.notes);
    const addNote = usePianoRollStore((state) => state.addNote);
    const removeNote = usePianoRollStore((state) => state.removeNote);
    const clearNotes = usePianoRollStore((state) => state.clearNotes);

    return (
        <section className="piano-roll">
            <div className="piano-roll-header">
                <div>
                    <span className="eyebrow">MELODIC MODULE</span>
                    <h2>Piano Roll</h2>
                </div>

                <div className="piano-roll-info">
                    <span>2 Octaves</span>
                    <span>16 Steps</span>

                    <button 
                        className="piano-roll-clear"
                        onClick={clearNotes}
                        disabled={notes.length === 0}
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="piano-roll-scroll">
                <div className="piano-roll-editor">

                    {/* Virtual keyboard labels */}
                    <div className="piano-roll-keyboard">
                        {pitches.map((pitch) => (
                            <div
                                key={pitch}
                                className={`piano-roll-key ${
                                    isBlackKey(pitch) ? "black-key" : "white-key"
                                }`}
                            >
                                {getNoteName(pitch)}
                            </div>
                        ))}
                    </div>

                    {/* Note grid */}
                    <div className="piano-roll-grid">
                        {pitches.map((pitch) => {
                            const rowNotes = notes.filter(
                                (note) => note.pitch === pitch
                            );

                            return (
                                <div
                                    key={pitch}
                                    className="piano-roll-row"
                                >
                                    {/* Empty grid cells */}
                                    {Array.from(
                                        { length: PIANO_ROLL_STEPS },
                                        (_, step) => (
                                            <button
                                                key={step}
                                                className="piano-roll-cell"
                                                aria-label={`Add ${getNoteName(pitch)} at step ${step + 1}`}
                                                onClick={() => 
                                                    addNote(pitch, step)
                                                }
                                            />
                                        )
                                    )}

                                    {/* Existing notes */}
                                    {rowNotes.map((note) => (
                                        <button
                                            key={note.id}
                                            className="piano-roll-note"
                                            style={{
                                                left: `${(note.startStep / PIANO_ROLL_STEPS) * 100}%`,
                                                width: `${(note.durationSteps / PIANO_ROLL_STEPS) * 100}%`,
                                            }}
                                            title={`${getNoteName(note.pitch)} - Velocity: ${note.velocity}`}
                                            onClick={() => 
                                                removeNote(note.id)
                                            }
                                        >
                                            {getNoteName(note.pitch)}
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="piano-roll-footer">
                <span>{notes.length} notes</span>
                <span>Click a cell to add a note . Click a note toremove it</span>
            </div>
        </section>
    );
}

export default PianoRoll;