import AudioTest from "./components/AudioTest";
import TransportTest from "./components/TransportTest";
import StepSequencer from "./components/StepSequencer";

function App() {
  return (
    <main>
      <h1>8Beat Studio</h1>
      <p>Prototype 0.1</p>

      <AudioTest />
      <TransportTest />
      <StepSequencer />
    </main>
  );
}

export default App