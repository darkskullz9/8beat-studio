import AudioTest from "./components/AudioTest";
import TransportTest from "./components/TransportTest";
import StepSequencer from "./components/StepSequencer";
import Sampler from "./components/Sampler/Sampler";

function App() {
  return (
    <main>
      <h1>8Beat Studio</h1>
      <p>Prototype 0.1</p>

      <AudioTest />
      <TransportTest />
      <Sampler />
      <StepSequencer />
    </main>
  );
}

export default App