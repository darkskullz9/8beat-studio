import { useEffect, useRef, useState } from "react";
import { transport } from "../../audio/Transport";
import { generateId } from "../../utils/id";
import { usePlaylistStore } from "../../stores/playlistStore";

const TICKS_PER_BAR = 96;
const VISIBLE_BARS = 8;
const BAR_WIDTH = 100;

function Playlist() {
    const tracks = usePlaylistStore((state) => state.tracks);
    const clips = usePlaylistStore((state) => state.clips);
    const patterns = usePlaylistStore((state) => state.patterns);

    const addTrack = usePlaylistStore((state) => state.addTrack);
    const addPattern = usePlaylistStore((state) => state.addPattern);
    const addClip = usePlaylistStore((state) => state.addClip);
    const removeTrack = usePlaylistStore((state) => state.removeTrack);
    const removeClip = usePlaylistStore((state) => state.removeClip);

    const moveClip = usePlaylistStore((state) => state.moveClip);
    const resizeClip = usePlaylistStore((state) => state.resizeClip);

    const dragRef = useRef<{
        clipId: string;
        pointerId: number;
        startX: number;
        startTick: number;
    } | null>(null);

    const resizeRef = useRef<{
        clipId: string;
        pointerId: number;
        startX: number;
        startDuration: number;
    } | null>(null);

    const [currentTick, setCurrentTick] = useState(0);

    useEffect(() => {
        return transport.subscribeToTicks(setCurrentTick);
    }, []);

    const handleClipPointerDown = (
        event: React.PointerEvent<HTMLDivElement>,
        clipId: string,
        startTick: number,
    ) => {
        if(event.button !== 0) return;

        event.preventDefault();

        dragRef.current = {
            clipId,
            pointerId: event.pointerId,
            startX: event.clientX,
            startTick,
        };

        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleClipPointerMove = (
        event: React.PointerEvent<HTMLDivElement>,
    ) => {
        const drag = dragRef.current;

        if(!drag || drag.pointerId !== event.pointerId) return;

        const deltaX = event.clientX - drag.startX;
        const deltaTicks = (deltaX / BAR_WIDTH) * TICKS_PER_BAR;
        const rawTick = drag.startTick + deltaTicks;
        const snapTick = 6;
        const snappedTick = Math.max(
            0,
            Math.round(rawTick / snapTick) * snapTick,
        );

        moveClip(drag.clipId, snappedTick);
    };

    const handleClipPointerUp = (
        event: React.PointerEvent<HTMLDivElement>,
    ) => {
        if(dragRef.current?.pointerId !== event.pointerId) return;

        dragRef.current = null;

        if(event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const handleResizePointerDown = (
        event: React.PointerEvent<HTMLDivElement>,
        clipId: string,
        durationTicks: number,
    ) => {
        if (event.button !== 0) return;

        event.preventDefault();
        event.stopPropagation();

        resizeRef.current = {
            clipId,
            pointerId: event.pointerId,
            startX: event.clientX,
            startDuration: durationTicks,
        };

        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleResizePointerMove = (
        event: React.PointerEvent<HTMLDivElement>,
    ) => {
        const resize = resizeRef.current;

        if (!resize || resize.pointerId !== event.pointerId) return;

        const deltaX = event.clientX - resize.startX;
        const deltaTicks = (deltaX / BAR_WIDTH) * TICKS_PER_BAR;

        const rawDuration = resize.startDuration + deltaTicks;
        const snapTicks = 6;

        const snappedDuration = Math.max(
            snapTicks,
            Math.round(rawDuration / snapTicks) * snapTicks,
        );

        resizeClip(resize.clipId, snappedDuration);
    };

    const handleResizePointerUp = (
        event: React.PointerEvent<HTMLDivElement>,
    ) => {
        if (resizeRef.current?.pointerId !== event.pointerId) return;

        resizeRef.current = null;

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const createPattern = (trackId: string) => {
        const track = tracks.find((item) => item.id === trackId);

        if (!track) return;

        const patternId = generateId();

        const pattern =
            track.type === "drums"
                ? {
                    id: patternId,
                    name: `Pattern ${patterns.length + 1}`,
                    type: "drums" as const,
                    lengthTicks: TICKS_PER_BAR,
                    tracks: [],
                }
                : {
                    id: patternId,
                    name: `Pattern ${patterns.length + 1}`,
                    type: "melodic" as const,
                    lengthTicks: TICKS_PER_BAR,
                    tracks: [],
                };

        addPattern(pattern);

        const existingClips = clips.filter(
            (clip) => clip.trackId === trackId,
        );

        const nextPosition = existingClips.reduce(
            (max, clip) => Math.max(
                max,
                clip.startTick + clip.durationTicks,
            ),
            0,
        );

        addClip(patternId, trackId, nextPosition);
    };

    return (
        <section className="playlist">
            <header className="playlist-header">
                <div>
                    <span className="eyebrow">ARRANGEMENT</span>
                    <h2>Playlist</h2>
                </div>

                <div className="playlist-actions">
                    <button onClick={() => addTrack("drums")}>
                        + Drums
                    </button>

                    <button onClick={() => addTrack("melodic")}>
                        + Instrument
                    </button>
                </div>
            </header>

            <div className="playlist-scroll">
                <div
                    className="playlist-editor"
                    style={{
                        width: 180 + VISIBLE_BARS * BAR_WIDTH,
                    }}
                >
                    <div className="playlist-ruler">
                        <div className="playlist-track-header">
                            Tracks
                        </div>

                        <div
                            className="playlist-ruler-grid"
                            style={{
                                width: VISIBLE_BARS * BAR_WIDTH,
                            }}
                        >
                            {Array.from(
                                { length: VISIBLE_BARS },
                                (_, index) => (
                                    <div
                                        className="playlist-bar"
                                        key={index}
                                        style={{
                                            width: BAR_WIDTH,
                                        }}
                                    >
                                        {index + 1}
                                    </div>
                                ),
                            )}
                        </div>
                    </div>

                    {tracks.map((track) => (
                        <div className="playlist-track" key={track.id}>
                            <div className="playlist-track-controls">
                                <div className="playlist-track-info">
                                    <strong>{track.name}</strong>

                                    <span>
                                        {track.type === "drums"
                                            ? "Drums"
                                            : "Instrument"}
                                    </span>
                                </div>

                                <div className="playlist-track-actions">
                                    <button
                                        onClick={() =>
                                            createPattern(track.id)
                                        }
                                        title="Create pattern"
                                    >
                                        +
                                    </button>

                                    <button
                                        onClick={() =>
                                            removeTrack(track.id)
                                        }
                                        title="Remove track"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div
                                className="playlist-lane"
                                style={{
                                    width: VISIBLE_BARS * BAR_WIDTH,
                                }}
                            >
                                <div
                                    className="playlist-playhead"
                                    style={{
                                        left: (currentTick / TICKS_PER_BAR) * BAR_WIDTH,
                                    }}
                                />

                                <div
                                    className="playlist-grid"
                                    style={{
                                        backgroundSize: `${BAR_WIDTH}px 100%`,
                                    }}
                                />

                                {clips
                                    .filter(
                                        (clip) =>
                                            clip.trackId === track.id,
                                    )
                                    .map((clip) => {
                                        const pattern = patterns.find(
                                            (item) =>
                                                item.id === clip.patternId,
                                        );

                                        if (!pattern) return null;

                                        return (
                                            <div
                                                className={`playlist-clip ${
                                                    track.type === "drums"
                                                        ? "playlist-clip-drums"
                                                        : "playlist-clip-melodic"
                                                }`} 
                                                key={clip.id} 
                                                style={{
                                                    left: (clip.startTick / TICKS_PER_BAR) * BAR_WIDTH, 
                                                    width: (clip.durationTicks / TICKS_PER_BAR) * BAR_WIDTH,
                                                }} 
                                                title={pattern.name} 
                                                onPointerDown={
                                                    (event) => handleClipPointerDown(event, clip.id, clip.startTick)
                                                } 
                                                onPointerMove={handleClipPointerMove} 
                                                onPointerUp={handleClipPointerUp}
                                                onPointerCancel={handleClipPointerUp}
                                            >
                                                <span>
                                                    {pattern.name}
                                                </span>

                                                <div
                                                    className="playlist-clip-resize"
                                                    onPointerDown={(event) =>
                                                        handleResizePointerDown(
                                                            event,
                                                            clip.id,
                                                            clip.durationTicks,
                                                        )
                                                    }
                                                    onPointerMove={handleResizePointerMove}
                                                    onPointerUp={handleResizePointerUp}
                                                    onPointerCancel={handleResizePointerUp}
                                                    title="Resize clip"
                                                />

                                                <button
                                                    onPointerDown={(event) => event.stopPropagation()} 
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        removeClip(clip.id);
                                                    }} 
                                                    title="Remove clip"
                                                >
                                                    x
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}

                    {tracks.length === 0 && (
                        <div className="playlist-empty">
                            Create a track to get started.
                        </div>
                    )}
                </div>
            </div>

            <footer className="playlist-footer">
                <span>{tracks.length} track(s)</span>
                <span>{clips.length} clip(s)</span>
                <span>{patterns.length} pattern(s)</span>
            </footer>
        </section>
    );
}

export default Playlist;