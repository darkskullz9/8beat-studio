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

}