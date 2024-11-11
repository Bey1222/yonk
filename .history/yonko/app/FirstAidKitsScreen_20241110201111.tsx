import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

interface DiscountItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  shopId: string;
}

interface StoreData {
  [key: string]: {
    name: string;
    avatar: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
    };
    products?: DiscountItem[];
  };
}

const FirstAidKitsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [discountItems, setDiscountItems] = useState<DiscountItem[]>([]);
  const [storeData, setStoreData] = useState<StoreData>({});

  useEffect(() => {
    const fetchDiscountItems = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/products?category=MEDICINE`,
          {
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN}`,
            },
          }
        );
        if (!response.ok) {
          console.error(
            "Discount items fetch failed with status:",
            response.status
          );
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data && data.products) {
          setDiscountItems(data.products);
          data.products.forEach((product: DiscountItem) => {
            if (!storeData[product.shopId]) {
              fetchStoreById(product.shopId);
            }
          });
        } else {
          console.error("Invalid discount items data format:", data);
        }
      } catch (error) {
        console.error("Error fetching discount items:", error);
      }
    };

    fetchDiscountItems();
  }, []);

  const fetchStoreById = async (shopId: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/shops/${shopId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN}`,
          },
        }
      );
      if (!response.ok) {
        console.error("Store data fetch failed with status:", response.status);
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data && data.shop) {
        setStoreData((prevStoreData) => ({
          ...prevStoreData,
          [shopId]: data.shop,
        }));

        // Fetch products for the store
        const productsResponse = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/products?shopId=${shopId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN}`,
            },
          }
        );
        if (!productsResponse.ok) {
          console.error(
            "Products data fetch failed with status:",
            productsResponse.status
          );
          throw new Error("Network response was not ok");
        }
        const productsData = await productsResponse.json();
        if (productsData && productsData.products) {
          setStoreData((prevStoreData) => ({
            ...prevStoreData,
            [shopId]: {
              ...data.shop,
              products: productsData.products,
            },
          }));
        } else {
          console.error("Invalid products data format:", productsData);
        }
      } else {
        console.error("Invalid store data format:", data);
      }
    } catch (error) {
      console.error("Error fetching store data for shopId:", shopId, error);
    }
  };

  const abbreviateName = (name: string, maxLength: number = 17): string => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + "...";
    }
    return name;
  };

  const calculateDiscountPercent = (
    originalPrice: number,
    discountPrice: number
  ): string => {
    const discountAmount = originalPrice - discountPrice;
    const discountPercent = (discountAmount / originalPrice) * 100;
    return discountPercent.toFixed(0);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNavigationFirstAidProducts = (
    item: DiscountItem,
    screenName: string
  ) => {
    const store = storeData[item.shopId];

    if (screenName === "FirstAidProducts") {
      navigation.navigate(screenName, {
        item,
        firstAidName: store.name,
        firstAidImageUri: store.avatar,
        firstAidLocation: `${store.address.street}, ${store.address.city}, ${store.address.state}, ${store.address.country}`, // Include the location here
      });
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: DiscountItem;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleNavigationFirstAidProducts(item, "FoodProducts")}
    >
      <View style={styles.cardopa}>
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      </View>
      <View style={styles.cardin}>
        <Text style={styles.name}>{abbreviateName(item.name)}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.discountPrice}>₦{item.basePrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#737373", "rgba(175, 238, 238, .7)", "#737373"]}
      locations={[1, 0.2, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.7 }}
      style={styles.container}
    >
      <View>
        <View style={[styles.navbar, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={handleBackPress} style={styles.icon}>
            <AntDesign name="left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.navbarTitle, { color: colors.text }]}>
            First Aid Kits
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <FlatList
          data={discountItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,

    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  navbarTitle: {
    fontSize: 20,
    fontFamily: "Kanitb",
    textAlign: "center",
    flex: 1,
    marginTop: 30,
  },
  scrollContainer: {
    flex: 1,
    padding: 10,
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
    paddingBottom: 50,
  },
  card: {
    borderRadius: 10,
    margin: 5,
    width: "47%",
    position: "relative",
  },
  cardopa: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  image: {
    width: "100%",
    height: 230,
    objectFit: "cover",
    borderRadius: 10,
  },
  cardin: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    backgroundColor: "rgba(217, 101, 64, .55)",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 5,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  name: {
    fontSize: 16,
    fontFamily: "Kanitsb",
    color: "#fff",
    textAlign: "center",
  },
  priceContainer: {
    marginTop: 3,
    backgroundColor: "rgba(217, 101, 64, .7)",
    borderRadius: 10,
  },
  discountPrice: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Kanitsb",
    textAlign: "center",
  },
  iconContainer: {
    position: "absolute",
    top: 10,
    left: 4,
    backgroundColor: "rgba(255, 255, 255, .8)",
    padding: 5,
    borderRadius: 1000,
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  discountPercentText: {
    fontSize: 14,
    color: "#d96540",
    fontFamily: "Kanit",
    textAlign: "center",
  },
  icon: {
    backgroundColor: "#d96540",
    position: "absolute",
    top: 40,
    left: 10,
    padding: 5,
    borderRadius: 100,
    zIndex: 5,
  },
});

export default FirstAidKitsScreen;
