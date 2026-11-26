//import AudioTest from "./components/AudioTest";
//import TransportTest from "./components/TransportTest";
import StepSequencer from "./components/StepSequencer";
import Sampler from "./components/Sampler/Sampler";
import PianoRoll from "./components/PianoRoll";
import Playlist from "./components/Playlist/Playlist";

function App() {
  return (
    <main>
      <h1>8Beat Studio</h1>
      <p>Prototype 0.1</p>

      {/* <AudioTest /> */}
      {/*<TransportTest />*/}
      <Sampler />
      <StepSequencer />
      <PianoRoll />
      <Playlist />
    </main>
  );
}

export default App