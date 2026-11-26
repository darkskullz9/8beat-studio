import { generateId } from "../utils/id";
import { create } from "zustand";
import type {
    PlaylistTrack,
    PlaylistPattern,
    PatternClip,
    PlaylistTrackType,
} from "../types/playlist";

interface PlaylistStore {
    tracks: PlaylistTrack[];
    clips: PatternClip[];
    patterns: PlaylistPattern[];

    addTrack: (type: PlaylistTrackType, name?: string) => string;
    removeTrack: (trackId: string) => void;

    addPattern: (pattern: PlaylistPattern) => void;

    addClip: (
        patternId: string,
        trackId: string,
        startTick?: number,
    ) => string | null;

    removeClip: (clipId: string) => void;
    moveClip: (clipId: string, startTick: number) => void;
    resizeClip: (clipId: string, durationTicks: number) => void;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
    tracks: [],
    clips: [],
    patterns: [],

    addTrack: (type, name) => {
        const trackId = generateId();

        const trackCount = get().tracks.filter(
            (track) => track.type === type,
        ).length;

        const defaultName =
            type === "drums"
                ? `Drums ${trackCount + 1}`
                : `Instrument ${trackCount + 1}`;

        set((state) => ({
            tracks: [
                ...state.tracks,
                {
                    id: trackId,
                    name: name ?? defaultName,
                    type,
                    muted: false,
                },
            ],
        }));

        return trackId;
    },

    removeTrack: (trackId) => {
        set((state) => ({
            tracks: state.tracks.filter((track) => track.id !== trackId),
            clips: state.clips.filter((clip) => clip.trackId !== trackId),
        }));
    },

    addPattern: (pattern) => {
        set((state) => {
            if (state.patterns.some((item) => item.id === pattern.id)) {
                return state;
            }

            return {
                patterns: [...state.patterns, pattern],
            };
        });
    },

    addClip: (patternId, trackId, startTick = 0) => {
        const { tracks, patterns, clips } = get();

        const track = tracks.find((item) => item.id === trackId);
        const pattern = patterns.find((item) => item.id === patternId);

        if (!track || !pattern) {
            return null;
        }

        if (track.type !== pattern.type) {
            return null;
        }

        if (startTick < 0 || pattern.lengthTicks <= 0) {
            return null;
        }

        const clipId = generateId();

        set({
            clips: [
                ...clips,
                {
                    id: clipId,
                    patternId,
                    trackId,
                    startTick,
                    durationTicks: pattern.lengthTicks,
                },
            ],
        });

        return clipId;
    },

    removeClip: (clipId) => {
        set((state) => ({
            clips: state.clips.filter((clip) => clip.id !== clipId),
        }));
    },

    moveClip: (clipId, startTick) => {
        if (startTick < 0) {
            return;
        }

        set((state) => ({
            clips: state.clips.map((clip) =>
                clip.id === clipId
                    ? { ...clip, startTick }
                    : clip,
            ),
        }));
    },

    resizeClip: (clipId, durationTicks) => {
        if (durationTicks <= 0) {
            return;
        }

        set((state) => ({
            clips: state.clips.map((clip) =>
                clip.id === clipId
                    ? { ...clip, durationTicks }
                    : clip,
            ),
        }));
    },
}));