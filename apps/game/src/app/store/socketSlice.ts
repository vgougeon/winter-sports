import { createSlice } from '@reduxjs/toolkit'

export const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    online: false,
    user: null,
    ping: 0,
    fps: 0,
  },
  reducers: {
    setOnline: state => { state.online = true },
    setOffline: state => { state.online = false },
    setPing: (state, data) => { state.ping = data.payload },
    setFPS: (state, data) => { state.fps = data.payload }
  }
})

export const { setOnline, setOffline, setPing, setFPS } = socketSlice.actions