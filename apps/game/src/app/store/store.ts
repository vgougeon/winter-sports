import { configureStore } from '@reduxjs/toolkit'
import { socketSlice } from './socketSlice';
import { queueSlice } from './queueSlice';

export default configureStore({
  reducer: {
      socket: socketSlice.reducer,
      queue: queueSlice.reducer
  }
})