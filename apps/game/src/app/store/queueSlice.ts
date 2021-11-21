import { createSlice } from '@reduxjs/toolkit'

export const queueSlice = createSlice({
  name: 'queue',
  initialState: {
    queueState: false
  },
  reducers: {
    setQueue: (state, data) => { state.queueState = data.payload }
  }
})

export const { setQueue } = queueSlice.actions