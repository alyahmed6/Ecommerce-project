import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../supabaseClient/supabaseClient";

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (payload, {rejectWithValue}) => {
    const {error} = await supabase.from("products").insert([payload]);
    if (error) 
      return rejectWithValue(error.message);
    return true;    
    }
);
export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const res = await supabase.auth.getUser?.();
      const user = res?.data?.user ?? res?.user ?? (supabase.auth.user ? supabase.auth.user() : null);
      if (!user) throw new Error("User not logged in");

      const payload = { ...productData, user_id: user.id };
      const { error } = await supabase.from("products").insert([payload]);
      if (error) throw error;
      return payload;
    } catch (err) {
      return rejectWithValue(err.message || err);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({id, payload}, {rejectWithValue}) => {
    const {error} = await supabase.from("products").update(payload).eq("id", id);
    if (error)
      return rejectWithValue(error.message);    
    return true;
    }
);

const ProductSlice = createSlice({
  name: "products",
  initialState: {
    loading :false,
    error: null,
  },
  reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add product";
      })
      
        .addCase(createProduct.pending, (state) => {
            state.loading = true;
        })
        .addCase(createProduct.fulfilled, (state) => {
            state.loading = false;
            
        })
        .addCase(createProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(updateProduct.pending, (state) => {
            state.loading = true;
        })
        .addCase(updateProduct.fulfilled, (state) => {
            state.loading = false;
            
        })
        .addCase(updateProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
           });
  },
});

export default ProductSlice.reducer;