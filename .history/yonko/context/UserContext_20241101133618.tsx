import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  name: string;
  phone: string;
  birthDate: string;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  token: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const userData = await AsyncStorage.getItem("userData");
          if (userData) {
            const parsedUserData = JSON.parse(userData);
            setUser({
              ...parsedUserData,
              token,
            });
            console.log("User data loaded from AsyncStorage:", parsedUserData);
          }
        }
      } catch (error) {
        console.error("Error retrieving user information:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
