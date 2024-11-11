import React, { createContext, useState, useContext, ReactNode } from "react";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  sizes: { name: string; price: number; quantity: number }[];
  addOns: { [key: string]: { name: string; price: number }[] };
  restaurantName: string;
  restaurantImageUri: string;
}

interface WishlistContextProps {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (index: number) => void;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(
  undefined
);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prevWishlist) => {
      const itemExists = prevWishlist.some(
        (wishlistItem) => wishlistItem.id === item.id
      );
      if (!itemExists) {
        return [...prevWishlist, item];
      }
      return prevWishlist;
    });
  };

  const removeFromWishlist = (index: number) => {
    setWishlist((prevWishlist) => prevWishlist.filter((_, i) => i !== index));
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
