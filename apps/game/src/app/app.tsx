import { useLayoutEffect, useRef } from "react";
import gameService from "./services/game.service";
import store from './store/store'
import { Provider } from 'react-redux'
import UI from "./ui";

export function App() {
  const ref = useRef<HTMLCanvasElement>(null)
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
      <UI />
      <canvas ref={ ref } width={ window.innerWidth } height={ window.innerHeight }></canvas>
    </Provider>
  );
}

export default App;
