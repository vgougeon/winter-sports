import { useLayoutEffect, useRef } from "react";
import socketService from "./services/socket.service";
import store from './store/store'
import { Provider } from 'react-redux'
import Queue from "./interface/absolute/queue";
import Performance from "./interface/absolute/performance";
import Score from "./interface/absolute/score";
import TitleScreen from "./interface/pages/title-screen";

export function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  const init = async () => {
    await socketService.init(ref.current!)
  }
  useLayoutEffect(() => {
    init()
  }, [])
  return (
    <Provider store={store}>
      <TitleScreen />
      <Queue />
      <Performance />
      <Score />
      <canvas ref={ ref }></canvas>
    </Provider>
  );
}

export default App;
