import { useLayoutEffect, useRef } from "react";
import { Game } from './game/game';

export function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  useLayoutEffect(() => {
    new Game(ref.current!)
  }, [])
  return (
    <canvas ref={ ref }></canvas>
  );
}

export default App;
