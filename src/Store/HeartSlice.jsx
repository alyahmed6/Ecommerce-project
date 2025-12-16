import { createSlice } from "@reduxjs/toolkit";

const savedWishlist = JSON.parse(localStorage.getItem("wishlistItems")) || [];

const initialState = {
  items: savedWishlist,
};

const heartSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const item = action.payload;
      const existing = state.items.find(i => i.id === item.id);
      if (!existing) state.items.push(item);
      localStorage.setItem("wishlistItems", JSON.stringify(state.items));
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
      localStorage.setItem("wishlistItems", JSON.stringify(state.items));
    },
  },
});

export const { addToWishlist, removeFromWishlist } = heartSlice.actions;
export default heartSlice.reducer;
