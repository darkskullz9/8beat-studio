import { usePianoRollStore } from "../stores/pianoRollStore";

import {
    PIANO_ROLL_TICKS_PER_BAR,
    PIANO_ROLL_MIN_PITCH,
    PIANO_ROLL_MAX_PITCH,
    PIANO_ROLL_DEFAULT_NOTE_DURATION,
} from "../types/pianoRoll";
import type { PianoNote } from "../types/pianoRoll";

import React, { useRef, useState } from "react";

const NOTE_NAMES = [
    "C", "C#", "D", "D#", "E", "F", 
    "F#", "G", "G#", "A", "A#", "B",
];

const pitches = Array.from(
    { length: PIANO_ROLL_MAX_PITCH - PIANO_ROLL_MIN_PITCH + 1 },
    (_, index) => PIANO_ROLL_MAX_PITCH - index
);

type DragMode = "move" | "resize";

interface DragNoteSnapshot {
    id: string;
    pitch: number;
    startTick: number;
    durationTicks: number;
}

interface DragState {
    noteId: string;
    mode: DragMode;
    initialX: number;
    initialY: number;
    initialNotes: DragNoteSnapshot[];
}

type SnapDivision = 24 | 16 | 12 | 8 | 6 | 4 | 3;

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
    const currentTick = usePianoRollStore((state) => state.currentTick);
    const removeNote = usePianoRollStore((state) => state.removeNote);
    const clearNotes = usePianoRollStore((state) => state.clearNotes);

    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [zoom, setZoom] = useState(1);
    const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
    const [snapDivision, setSnapDivision] = useState<SnapDivision>(6);

    const selectedNote = notes.find(
        (note) => note.id === selectedNoteId
    );

    const pianoRollGridRef = useRef<HTMLDivElement>(null);

    const handleNotePointerDown = (
        event: React.PointerEvent<HTMLElement>,
        note: PianoNote,
        mode: DragMode
    ) => {
        event.preventDefault();
        event.stopPropagation();

        pianoRollGridRef.current?.setPointerCapture(event.pointerId);

        if (event.shiftKey) {
            const alreadySelected = selectedNoteIds.includes(note.id);

            const nextSelection = alreadySelected
                ? selectedNoteIds.filter((id) => id !== note.id)
                : [...selectedNoteIds, note.id];

            setSelectedNoteIds(nextSelection);
            setSelectedNoteId(alreadySelected
                ? nextSelection[nextSelection.length - 1] ?? null
                : note.id
            );

            setDragState(null);
            return;
        }

        const nextSelection = selectedNoteIds.includes(note.id)
            ? selectedNoteIds
            : [note.id]

        setSelectedNoteIds(nextSelection);
        setSelectedNoteId(note.id);

        const notesToDrag = mode === "resize"
            ? [note]
            : notes.filter((item) => nextSelection.includes(item.id));

        setDragState({
            noteId: note.id,
            mode,
            initialX: event.clientX,
            initialY: event.clientY,
            initialNotes: notesToDrag.map((item) => ({
                id: item.id,
                pitch: item.pitch,
                startTick: item.startTick,
                durationTicks: item.durationTicks,
            })),
        });
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
        if (!dragState) return;

        const grid = pianoRollGridRef.current;
        if (!grid) return;

        const tickWidth = grid.clientWidth / PIANO_ROLL_TICKS_PER_BAR;
        const rowHeight = 28;

        const rawDeltaTicks = Math.round(
            (event.clientX - dragState.initialX) / tickWidth
        );
        
        const deltaTicks = snapTick(rawDeltaTicks);

        // Resize note duration
        if (dragState.mode === "resize") {
            const target = dragState.initialNotes[0];
            if (!target) return;

            const maxDuration = PIANO_ROLL_TICKS_PER_BAR - target.startTick;

            const duration = clamp(
                target.durationTicks + deltaTicks,
                snapDivision,
                maxDuration
            );

            updateNote(target.id, {durationTicks: duration});
            return;
        }

        // Move notes group
        const initialNotes = dragState.initialNotes;
        if (initialNotes.length === 0) return;

        const deltaPitch = -Math.round(
            (event.clientY - dragState.initialY) / rowHeight
        );

        const minStart = Math.min(
            ...initialNotes.map((item) => item.startTick)
        );

        const maxEnd = Math.max(
            ...initialNotes.map((item) => item.startTick + item.durationTicks)
        );

        const minPitch = Math.min(
            ...initialNotes.map((item) => item.pitch)
        );

        const maxPitch = Math.max(
            ...initialNotes.map((item) => item.pitch)
        );

        const minAllowedDelta = Math.ceil(-minStart / snapDivision) * snapDivision;

        const maxAllowedDelta = Math.floor(
            (PIANO_ROLL_TICKS_PER_BAR - maxEnd) / snapDivision
        ) * snapDivision;

        const boundedTicks = clamp(
            deltaTicks, 
            minAllowedDelta,
            maxAllowedDelta
        );

        const boundedPitch = clamp(
            deltaPitch, 
            PIANO_ROLL_MIN_PITCH - minPitch, 
            PIANO_ROLL_MAX_PITCH - maxPitch
        );

        initialNotes.forEach((item) => {
            updateNote(item.id, {
                startTick: item.startTick + boundedTicks,
                pitch: item.pitch + boundedPitch,
            });
        });
    };

    const handlePointerUp = () => {
        setDragState(null);
    };

    const snapTick = (tick: number): number => {
        return Math.round(tick / snapDivision) * snapDivision;
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
                    <span>1 Bar · 96 Ticks</span>

                    <div className="piano-roll-zoom">
                        <span>Zoom</span>

                        {[1, 2, 4].map((level) => (
                            <button
                                key={level}
                                className={zoom === level ? "zoom-active" : ""}
                                onClick={() => setZoom(level)}
                                aria-label={`Zoom ${level}x`}
                            >
                                {level}x
                            </button>
                        ))}
                    </div>

                    <button 
                        className="piano-roll-clear"
                        onClick={() => {
                            clearNotes();
                            setSelectedNoteId(null);
                            setSelectedNoteIds([]);
                        }}
                        disabled={notes.length === 0}
                    >
                        Clear
                    </button>
                </div>

                <div className="piano-roll-snap">
                    <label htmlFor="snap-division">Snap</label>
                    <select
                        id="snap-division"
                        value={snapDivision}
                        onChange={(event) => setSnapDivision(
                            Number(event.target.value) as SnapDivision
                        )}
                    >
                        <option value={24}>1/4</option>
                        <option value={16}>1/4T</option>
                        <option value={12}>1/8</option>
                        <option value={8}>1/8T</option>
                        <option value={6}>1/16</option>
                        <option value={4}>1/16T</option>
                        <option value={3}>1/32</option>
                    </select>
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
                        ref={pianoRollGridRef}
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
                                        { length: PIANO_ROLL_TICKS_PER_BAR },
                                        (_, tick) => (
                                            <button
                                                key={tick}
                                                className={`piano-roll-cell ${
                                                    currentTick === tick ? "active-step" : ""
                                                }`}
                                                aria-label={`Add ${getNoteName(pitch)} at tick ${tick + 1}`}
                                                onClick={() => 
                                                    addNote(
                                                        pitch, 
                                                        snapTick(tick), 
                                                        PIANO_ROLL_DEFAULT_NOTE_DURATION
                                                    )
                                                }
                                            />
                                        )
                                    )}

                                    {/* Existing notes */}
                                    {rowNotes.map((note) => (
                                        <button
                                            key={note.id}
                                            className={`piano-roll-note ${
                                                selectedNoteIds.includes(note.id) ? "selected" : ""
                                            }`}
                                            style={{
                                                left: `${(
                                                    note.startTick / PIANO_ROLL_TICKS_PER_BAR
                                                ) * 100}%`,

                                                width: `${(
                                                    note.durationTicks / PIANO_ROLL_TICKS_PER_BAR
                                                ) * 100}%`,
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
                            Tick {selectedNote.startTick + 1}
                        </span>
                    </div>

                    <div className="piano-roll-property">
                        <label htmlFor="note-duration">
                            Duration: {selectedNote.durationTicks} ticks
                        </label>

                        <input 
                            id="note-duration"
                            type="range"
                            min={snapDivision}
                            max={PIANO_ROLL_TICKS_PER_BAR - selectedNote.startTick}
                            value={selectedNote.durationTicks}
                            onChange={(event) => updateNote(selectedNote.id, {
                                durationTicks: Number(event.target.value),
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
                            selectedNoteIds.forEach((id) => removeNote(id));

                            setSelectedNoteIds([]);
                            setSelectedNoteId(null);
                        }}
                    >
                        Delete Selection
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