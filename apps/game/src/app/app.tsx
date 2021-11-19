import { useLayoutEffect, useRef } from "react";
import { Game } from './game/game';
import Ammo from 'ammo.js'

require('./services/socket.service')

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
