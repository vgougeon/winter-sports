import { useLayoutEffect, useRef } from "react";
import gameService from "./services/game.service";
import store from './store/store'
import { Provider } from 'react-redux'
import UI from "./ui";
import { useObservable } from "react-use";

export function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  const state = useObservable(gameService.currentState)
  const init = async () => {
    await gameService.init(ref.current!)
  }
  useLayoutEffect(() => {
    init()
    window.addEventListener('resize', () => {
      gameService.game?.engine.resize()
    })
  }, [])
  return (
    <Provider store={store}>
      <span className="absolute font-medium top-1.5 right-9">{state}</span>
      <button className="absolute top-5 left-5" onClick={() => gameService.joinQueue(['Soccer'])}>Join queue</button>
      <UI />
      <canvas ref={ref} width={window.innerWidth} height={window.innerHeight}></canvas>
    </Provider>
  );
}

export default App;
