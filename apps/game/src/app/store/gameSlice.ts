import { createSlice } from '@reduxjs/toolkit'

export const gameSlice = createSlice({
  name: 'game',
  initialState: {
    mode: 'title-screen',
    state: '',
    timer: null,
    team1: null,
    team2: null,
  },
  reducers: {
    setMode: (state, data) => { state.mode = data.payload },
    setState: (state, data) => { state.state = data.payload },
    setTimer: (state, data) => { state.timer = data.payload },
    setTeam1: (state, data) => { state.team1 = data.payload },
    setTeam2: (state, data) => { state.team2 = data.payload }
  }
})

export const { setTimer, setTeam1, setTeam2, setMode, setState } = gameSlice.actions