import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VendorLocation {
  name: string;
  address: string;
}

interface CartState {
  items: { id: string; product: string; quantity: number; price: number }[];
  total_price: number;
  message: string;
}

export interface VendorData {
  date: string;
  status: string | null;
  organizer: string;
  time: string;
  duration: string;
  location: VendorLocation;
  discipline: string;
  gender: string;
}

export interface ProductListingCardProps {
  title: string;
  imageUrl: string;
  description: string;
  price?: number;
  rating?: number;
  category: string;
  subcategory?: string;
  condition?: string;
  itemLocation?: string;
  shipping?: string;
  stockStatus?: string;
  // Add any other fields you're using
}

interface ProductListingSlice {
  isCompared: boolean;
  showHeaderAdModal: boolean;
  savedVendorData: VendorData | null;
  compareList: ProductListingCardProps[];
  redirectProductId: string | null;
  redirectAddToCartData: { productId: string; quantity: number } | null;
  cart: CartState | null;
  selectedCartItems: string[];
}

const initialState: ProductListingSlice = {
  isCompared: false,
  savedVendorData: null,
  compareList: [],
  showHeaderAdModal: false,
  redirectProductId: null,
  redirectAddToCartData: null,
  cart: null,
  selectedCartItems: [],
};

const productListingSlice = createSlice({
  name: "productListing",
  initialState,
  reducers: {
    setIsCompared: (state, action: PayloadAction<boolean>) => {
      state.isCompared = action.payload;
    },
    setShowHeaderAdModal: (state, action: PayloadAction<boolean>) => {
      state.showHeaderAdModal = action.payload;
    },
    setSaveVendorData: (state, action: PayloadAction<VendorData>) => {
      state.savedVendorData = action.payload;
    },
    setRedirectProductId: (state, action: PayloadAction<string | null>) => {
      state.redirectProductId = action.payload; // ✅ new action
    },
    setRedirectAddToCartData: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      state.redirectAddToCartData = action.payload;
    },
    addToCompare: (state, action: PayloadAction<ProductListingCardProps>) => {
      const exists = state.compareList.some(
        (item) => item.title === action.payload.title
      );
      if (!exists) {
        state.compareList.push(action.payload);
      }
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      state.compareList = state.compareList.filter(
        (item) => item.title !== action.payload
      );
    },
    clearCompareList: (state) => {
      state.compareList = [];
    },
    setCart: (state, action: PayloadAction<CartState>) => {
      state.cart = action.payload;
    },
    setSelectedCartItems: (state, action: PayloadAction<string[]>) => {
      state.selectedCartItems = action.payload;
    },
    clearSelectedCartItems: (state) => {
      state.selectedCartItems = [];
    },
  },
});

export const {
  setIsCompared,
  setSaveVendorData,
  addToCompare,
  removeFromCompare,
  clearCompareList,
  setShowHeaderAdModal,
  setRedirectProductId,
  setRedirectAddToCartData,
  setCart,
  setSelectedCartItems,
  clearSelectedCartItems,
} = productListingSlice.actions;

export default productListingSlice.reducer;
