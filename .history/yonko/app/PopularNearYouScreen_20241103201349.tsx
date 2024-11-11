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
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import starIcon from "../../assets/star.png";

const PopularNearYouScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [popularItems, setPopularItems] = useState([]);
  const [storeData, setStoreData] = useState({});

  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/products?category=FOOD`,
          {
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN}`,
            },
          }
        );
        if (!response.ok) {
          console.error(
            "Popular items fetch failed with status:",
            response.status
          );
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data && data.products) {
          setPopularItems(data.products);
          data.products.forEach((product) => {
            if (!storeData[product.shopId]) {
              fetchStoreById(product.shopId);
            }
          });
        } else {
          console.error("Invalid popular items data format:", data);
        }
      } catch (error) {
        console.error("Error fetching popular items:", error);
      }
    };

    fetchPopularItems();
  }, []);

  const fetchStoreById = async (shopId) => {
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

  const abbreviateName = (name, maxLength = 17) => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + "...";
    }
    return name;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNavigation = (store, screenName) => {
    if (!store.isOpen) {
      Alert.alert("Restaurant Closed", "This restaurant is currently closed.");
    }

    if (screenName === "MainstoreFood") {
      navigation.navigate(screenName, {
        restaurant: {
          shop: store,
          products: store.products, // Pass the products to MainstoreFood
        },
      });
    } else {
      navigation.navigate(screenName, {
        item: {
          ...store,
          restaurantName: store.name,
          restaurantImageUri: store.avatar,
          restaurantLocation: store.address,
          isOpen: store.isOpen,
          openingTime: store["Opening Time"],
          closingTime: store["Closing Time"],
        },
        store: store, // Pass the store data
      });
    }
  };

  const renderItem = ({ item, index }) => {
    const products = popularItems.filter(
      (product) => product.shopId === item.id
    );
    console.log("Popular Near You item:", item, "Products:", products); // Log the store and products data
    return (
      <TouchableOpacity
        key={index}
        style={styles.sectionItem}
        onPress={() => handleNavigation(item, "MainstoreFood")}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.avatar }} style={styles.sectionImage} />
          <View style={styles.imageOverlay} />
          {index === 0 && (
            <View style={styles.ratingContainer}>
              <Image source={starIcon} style={styles.starIcon} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
        </View>

        <View
          style={{
            position: "absolute",
            top: 5,
            left: 4,
            flexDirection: "row",
          }}
        >
          {index === 0 && (
            <View style={styles.infoContainer}>
              <FontAwesome6 name="clock" size={13} color="#fff" />
              <Text style={[styles.deliveryTimeText, { color: "#fff" }]}>
                {item.deliveryTime}
              </Text>
            </View>
          )}
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 5,
            flexDirection: "row",
          }}
        >
          <Text style={[styles.sectionItemText, { color: "#fff" }]}>
            {abbreviateName(item.name, 20)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={["#737373", "rgba(255, 218, 185, .9)", "#d16847"]}
      locations={[1, 0.29, 0.5]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.75 }}
      style={styles.container}
    >
      <View>
        <View style={[styles.navbar, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={handleBackPress} style={styles.icon}>
            <AntDesign name="left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.navbarTitle, { color: colors.text }]}>
            Popular Near You
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <FlatList
          data={Object.values(storeData)}
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

export default PopularNearYouScreen;

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
  listContainer: {
    paddingHorizontal: 10,
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
  ratingText: {
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
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
});
