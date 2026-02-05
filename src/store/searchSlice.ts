import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
    isSearchOpen: boolean;
}

const initialState: SearchState = {
    isSearchOpen: false,
};

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setSearchOpen: (state, action: PayloadAction<boolean>) => {
            state.isSearchOpen = action.payload;
        },
    },
});

export const searchAction = searchSlice.actions;
export default searchSlice.reducer;
