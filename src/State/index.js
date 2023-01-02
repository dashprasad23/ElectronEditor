import { configureStore } from '@reduxjs/toolkit';

import editorReducer from './Editor';


const store = configureStore({
  reducer: { editor: editorReducer },
});

export default store;