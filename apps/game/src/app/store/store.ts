import { configureStore } from '@reduxjs/toolkit'
import { socketSlice } from './socketSlice';
import { queueSlice } from './queueSlice';
import { gameSlice } from './gameSlice';

export default configureStore({
  reducer: {
      socket: socketSlice.reducer,
      queue: queueSlice.reducer,
      game: gameSlice.reducer,
  }
})