import { useLayoutEffect, useRef } from "react";
import socketService from "./services/socket.service";
import store from './store/store'
import { Provider } from 'react-redux'
import UI from "./ui";

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
      <UI />
      <canvas ref={ ref }></canvas>
    </Provider>
  );
}

export default App;
