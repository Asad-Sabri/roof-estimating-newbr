import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import authReducer from "./slices/authSlice";
import productListingReducer from "./slices/productListingSlice";
import { combineReducers } from "@reduxjs/toolkit";
import cookieStorage from "@/utils/cookieStorage";

const rootReducer = combineReducers({
  auth: authReducer,
  productListing: productListingReducer,
});

const persistConfig = {
  key: "root",
  storage: cookieStorage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist warnings avoid karne ke liye
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
