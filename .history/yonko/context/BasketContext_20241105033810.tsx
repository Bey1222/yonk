import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Item {
  id: string;
  name: string;
  price: number;
  sizes: { name: string; price: number; quantity: number }[];
  addOns: { [key: string]: { name: string; price: number }[] };
  note: string;
  restaurant: string;
  restaurantImageUri: string;
  restaurantLocation: string;
}

interface BasketItem extends Item {
  image: string;
}

interface BasketContextType {
  basket: BasketItem[];
  addToBasket: (item: BasketItem) => void;
  removeFromBasket: (id: string) => void;
  clearBasket: () => void;
  token: string | null;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const BasketProvider = ({ children }: { children: ReactNode }) => {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading token:", error);
      }
    };

    loadToken();
  }, []);

  const addToBasket = (item: BasketItem) => {
    if (item.id !== undefined) {
      setBasket((prevBasket) => [...prevBasket, item]);
    } else {
      console.error("Item does not have a valid id:", item);
    }
  };

  const removeFromBasket = (itemId: string) => {
    setBasket((prevBasket) => prevBasket.filter((item) => item.id !== itemId));
  };

  const clearBasket = () => {
    setBasket([]);
  };

  return (
    <BasketContext.Provider
      value={{ basket, addToBasket, removeFromBasket, clearBasket, token }}
    >
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (context === undefined) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
};
