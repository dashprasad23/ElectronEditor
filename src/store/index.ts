import { configureStore } from '@reduxjs/toolkit';

import editorReducer from './editorSlice';
import settingsReducer from './settingsSlice';


const store = configureStore({
  reducer: {
    editor: editorReducer,
    settings: settingsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;