import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "./searchSlice";
import cartReducer from "./CardSlice";
import wishlistReducer from "./HeartSlice";
import uiReducer from "./CartUiSlice";
import productReducer from "./ProductSlice";

const store = configureStore({
  reducer: {
    search: searchReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
    products: productReducer,
  },
});

export default store;