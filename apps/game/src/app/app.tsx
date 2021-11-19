import { useLayoutEffect, useRef } from "react";
import { Game } from './game/game';
import Ammo from 'ammo.js'

export function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  const init = async () => {
    new Game(ref.current!)
  }
  useLayoutEffect(() => {
    init()
  }, [])
  return (
    <canvas ref={ ref }></canvas>
  );
}

export default App;
