import { useLayoutEffect, useRef } from "react";
import { Game } from './game/game';
import socketService from "./services/socket.service";

export function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  const init = async () => {
    await socketService.init(ref.current!)
  }
  useLayoutEffect(() => {
    init()
  }, [])
  return (
    <canvas ref={ ref }></canvas>
  );
}

export default App;
