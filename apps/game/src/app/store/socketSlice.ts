import { createSlice } from '@reduxjs/toolkit'
const init = {
  pseudo: '',
  online: false,
  error: false,
  averageDelta: 0,
  user: null,
  ping: null,
  fps: 0,
}
export const socketSlice = createSlice({
  name: 'socket',
  initialState: init,
  reducers: {
    setOnline: state => { state.online = true, state.error = false },
    setError: state => { state.error = true, state.online = false },
    setOffline: state => { state.online = false },
    setPing: (state, data) => { state.ping = data.payload },
    setPseudo: (state, data) => { state.pseudo = data.payload },
    setAverageDelta: (state, data) => { state.averageDelta = data.payload },
    setFPS: (state, data) => { state.fps = data.payload },
    resetSocket: (state) => { state.error = false; state.online = false; state.user = null; state.ping = null; }
  }
})

export const { setOnline, setOffline, setPing, setAverageDelta, setFPS, setError, setPseudo, resetSocket } = socketSlice.actions