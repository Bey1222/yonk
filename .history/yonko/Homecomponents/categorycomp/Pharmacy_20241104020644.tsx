import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

interface DiscountItem {
  image: string;
  name: string;
  discountPrice: number;
  price: number;
  pharmacyName: string;
  pharmacyImageUri: string;
  pharmacyLocation: string;
  isOpen: boolean;
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

const DiscountsPharmacy: React.FC = () => {
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

  const handleNavigationPharmacyProducts = (
    item: DiscountItem,
    screenName: string
  ) => {
    if (!item.isOpen) {
      Alert.alert("Pharmacy Closed", "This pharmacy is currently closed.");
    }

    const store = storeData[item.shopId];

    if (screenName === "PharmacyProducts") {
      navigation.navigate(screenName, {
        item,
        pharmacyName: store.name,
        pharmacyImageUri: store.avatar,
        pharmacyLocation: `${store.address.street}, ${store.address.city}, ${store.address.state}, ${store.address.country}`, // Include the location here
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
      onPress={() => handleNavigationPharmacyProducts(item, "PharmacyProducts")}
    >
      <View style={styles.cardopa}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>
      {item.discount && (
        <View style={styles.iconContainer}>
          <Text style={styles.discountPercentText}>
            -{calculateDiscountPercent(item.price, item.discountPrice)}%
          </Text>
        </View>
      )}
      <View style={styles.cardin}>
        <Text style={styles.name}>{abbreviateName(item.name)}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.discountPrice}>₦{item.discountPrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#737373", "rgba(255,46,65,.7)", "#737373"]}
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
            Discounts
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

export default DiscountsPharmacy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 10,
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  navbar: {
    paddingVertical: 0,
  },
  curve: {
    flexDirection: "row",
    padding: 5,
  },
  categoryContainer: {
    marginHorizontal: 10,
    alignItems: "center",
  },
  activeCategoryContainer: {
    borderColor: "#000",
    borderRadius: 10,
    padding: 10,
  },
  categoryImage: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  categoryLabel: {
    marginTop: 5,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Kanit",
  },
  activeCategoryLabel: {},
  contentContainer: {
    flex: 1,
    marginBottom: 30,
  },
  sectionContainer: {
    marginVertical: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  sectionText: {
    fontSize: 20,
    fontFamily: "Kanitb",
  },
  arrowContainer: {
    padding: 5,
  },
  arrowText: {
    fontSize: 20,
  },
  sectionScrollView: {
    marginVertical: 10,
  },
  sectionItem: {
    marginHorizontal: 10,
    alignItems: "center",
    paddingVertical: 5,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  sectionImage: {
    width: 220,
    height: 180,
    borderRadius: 10,
  },

  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 10,
  },

  sectionItemText: {
    marginTop: 5,
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Kanitb",
  },
  infoContainer: {
    flexDirection: "row",
    columnGap: 5,
    alignItems: "center",
    marginTop: 5,
  },
  deliveryTimeText: {
    fontSize: 14,
    textAlign: "right",
    fontFamily: "Kanit",
  },
  ratingContainer: {
    position: "absolute",
    top: 5,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, .3)",

    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Kanit",
    color: "#fff",
  },
  starIcon: {
    width: 15,
    height: 15,
    marginRight: 0,
  },
  bicycleIcon: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
  },
  discountContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "red",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  discountIcon: {
    width: 15,
    height: 15,
    marginRight: 5,
    objectFit: "cover",
  },

  discountSection: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 10,
  },
  discountItem: {
    width: "100%",
    marginVertical: 10,
    alignItems: "center",
  },
  discountImage: {
    width: "100%",
    height: 170,
  },
  discountInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 5,
  },
  priceTextContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  discountPriceText: {
    fontSize: 25,
    textAlign: "center",
    fontFamily: "Kanitb",
    color: "green",
  },
  originalPriceText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Kanit",
    color: "red",
    textDecorationLine: "line-through",
  },
  heartIconContainer: {
    padding: 5,
  },
  heartIcon: {
    width: 25,
    height: 25,
  },
  bestSellersSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,

    paddingHorizontal: 10,
  },
  bestSellerItem: {
    width: "48%",
    borderRadius: 5,
    marginVertical: 5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  bestSellerImage: {
    width: 170,
    height: 190,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageOva: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 170,
    height: 190,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 10,
  },
  bestSellerText: {
    fontSize: 20,
    textAlign: "center",
    fontFamily: "Kanitb",
    position: "absolute",
    bottom: 10,
  },
  newContainer: {
    position: "absolute",
    top: -12,
    left: -17,
    backgroundColor: "transparent",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newIcon: {
    width: 60,
    height: 60,
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
  originalPrice: {
    fontSize: 13,
    color: "rgba(255, 255, 255, .6)",
    textDecorationLine: "line-through",
    fontFamily: "Kanit",
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
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    padding: 5,
    borderRadius: 100,
    zIndex: 5,
  },
  closedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  closedText: {
    fontSize: 24,
    fontFamily: "Kanitb",
    color: "#fff",
  },
});
