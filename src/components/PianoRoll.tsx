import { usePianoRollStore } from "../stores/pianoRollStore";

import {
    PIANO_ROLL_MIN_PITCH,
    PIANO_ROLL_MAX_PITCH,
    PIANO_ROLL_STEPS,
} from "../types/pianoRoll";
import type { PianoNote } from "../types/pianoRoll";

import React, { useState } from "react";

const NOTE_NAMES = [
    "C", "C#", "D", "D#", "E", "F", 
    "F#", "G", "G#", "A", "A#", "B",
];

const pitches = Array.from(
    { length: PIANO_ROLL_MAX_PITCH - PIANO_ROLL_MIN_PITCH + 1 },
    (_, index) => PIANO_ROLL_MAX_PITCH - index
);

type DragMode = "move" | "resize";

interface DragState {
    noteId: string;
    mode: DragMode;
    initialX: number;
    initialY: number;
    initialStartStep: number;
    initialPitch: number;
    initialDuration: number;
}

const clamp = (
    value: number, 
    min: number, 
    max: number
) => Math.max(min, Math.min(max, value));


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
    const updateNote = usePianoRollStore((state) => state.updateNote);
    const currentStep = usePianoRollStore((state) => state.currentStep);
    const removeNote = usePianoRollStore((state) => state.removeNote);
    const clearNotes = usePianoRollStore((state) => state.clearNotes);

    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [dragState, setDragState] = useState<DragState | null>(null);

    const selectedNote = notes.find(
        (note) => note.id === selectedNoteId
    );

    const handleNotePointerDown = (
        event: React.PointerEvent<HTMLElement>,
        note: PianoNote,
        mode: DragMode
    ) => {
        event.preventDefault();
        event.stopPropagation();

        setSelectedNoteId(note.id);

        setDragState({
            noteId: note.id,
            mode,
            initialX:event.clientX,
            initialY:event.clientY,
            initialStartStep: note.startStep,
            initialPitch: note.pitch,
            initialDuration: note.durationSteps,
        });
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
        if (!dragState) return;

        const grid = event.currentTarget.getBoundingClientRect();

        const stepWidth = grid.width / PIANO_ROLL_STEPS;
        const rowHeight = 28;

        const deltaSteps = Math.round((event.clientX - dragState.initialX) / stepWidth);

        if (dragState.mode === "resize") {
            const maxDuration = PIANO_ROLL_STEPS - dragState.initialStartStep;

            const duration = clamp(
                dragState.initialDuration + deltaSteps,
                1,
                maxDuration
            );

            updateNote(dragState.noteId, {durationSteps: duration,});

            return;
        }

        const deltaPitch = -Math.round((event.clientY - dragState.initialY) / rowHeight);

        updateNote(dragState.noteId, {
            startStep: clamp(
                dragState.initialStartStep + deltaSteps,
                0,
                PIANO_ROLL_STEPS - dragState.initialDuration
            ),
            pitch: clamp(
                dragState.initialPitch + deltaPitch,
                PIANO_ROLL_MIN_PITCH,
                PIANO_ROLL_MAX_PITCH
            ),
        });
    };

    const handlePointerUp = () => {
        setDragState(null);
    };
    
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
                    <div 
                        className="piano-roll-grid"
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        onLostPointerCapture={handlePointerUp}
                    >
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
                                                className={`piano-roll-cell ${
                                                    currentStep === step ? "active-step" : ""
                                                }`}
                                                aria-label={`Add ${getNoteName(pitch)} at step ${step + 1}`}
                                                onClick={() => addNote(pitch, step)}
                                            />
                                        )
                                    )}

                                    {/* Existing notes */}
                                    {rowNotes.map((note) => (
                                        <button
                                            key={note.id}
                                            className={`piano-roll-note ${
                                                selectedNoteId === note.id ? "selected" : ""
                                            }`}
                                            style={{
                                                left: `${(note.startStep / PIANO_ROLL_STEPS) * 100}%`,
                                                width: `${(note.durationSteps / PIANO_ROLL_STEPS) * 100}%`,
                                            }}
                                            title={`${getNoteName(note.pitch)} - Velocity: ${note.velocity}`}
                                            onPointerDown={(event) => handleNotePointerDown(
                                                event, 
                                                note,
                                                "move"
                                            )}

                                        >
                                            {getNoteName(note.pitch)}

                                            <span 
                                                className="piano-roll-resize-handle"
                                                onPointerDown={(event) => {
                                                    event.stopPropagation();
                                                    handleNotePointerDown(event, note, "resize");
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {selectedNote && (
                <div className="piano-roll-properties">
                    <div className="piano-roll-properties-header">
                        <strong>Note Properties</strong>
                        <span>
                            {getNoteName(selectedNote.pitch)}
                            {" , "}
                            Step {selectedNote.startStep + 1}
                        </span>
                    </div>

                    <div className="piano-roll-property">
                        <label htmlFor="note-duration">
                            Duration: {selectedNote.durationSteps} step(s)
                        </label>

                        <input 
                            id="note-duration"
                            type="range"
                            min={1}
                            max={PIANO_ROLL_STEPS - selectedNote.startStep}
                            value={selectedNote.durationSteps}
                            onChange={(event) => updateNote(selectedNote.id, {
                                durationSteps: Number(event.target.value),
                            })} 
                        />
                    </div>

                    <div className="piano-roll-property">
                        <label htmlFor="note-velocity">
                            Velocity: {selectedNote.velocity} / 127
                        </label>

                        <input 
                            id="note-velocity"
                            type="range"
                            min={0}
                            max={127}
                            value={selectedNote.velocity}
                            onChange={(event) => updateNote(selectedNote.id, {
                                velocity: Number(event.target.value),
                            })}
                        />
                    </div>

                    <button 
                        className="piano-roll-delete"
                        onClick={() => {
                            removeNote(selectedNote.id);
                            setSelectedNoteId(null);
                        }}
                    >
                        Delete Note
                    </button>
                </div>
            )}

            <div className="piano-roll-footer">
                <span>{notes.length} notes</span>
                <span>Click a cell to add a note. Click a note to select it</span>
            </div>
        </section>
    );
}

export default PianoRoll;