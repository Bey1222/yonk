import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
  Alert,
} from "react-native";
import Swiper from "react-native-swiper";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import starIcon from "../assets/star.png"; // Import the star icon
import { FontAwesome } from "@expo/vector-icons"; // Import FontAwesome for the "i" icon

const { width, height } = Dimensions.get("window");

const SwiperComponent = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [mealHeading, setMealHeading] = useState("");
  const [storeData, setStoreData] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const currentHour = new Date().getHours();
    const isBreakfastTime = currentHour >= 6 && currentHour < 12;
    const isLunchTime = currentHour >= 12 && currentHour < 18;
    const isDinnerTime = currentHour >= 18 || currentHour < 6;

    if (isBreakfastTime) {
      setMealHeading("Breakfast");
    } else if (isLunchTime) {
      setMealHeading("Lunch");
    } else if (isDinnerTime) {
      setMealHeading("Dinner");
    }

    const fetchData = async () => {
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
            "Category data fetch failed with status:",
            response.status
          );
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Fetched category data:", data); // Log the fetched data
        if (data && data.products) {
          setFilteredProducts(data.products);
        } else {
          console.error("Invalid category data format:", data);
        }
      } catch (error) {
        console.error("Error fetching category data:", error); // Log any errors
      }
    };

    fetchData();
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
      console.log("Fetched store data for shopId:", shopId, data); // Log the fetched data
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
        console.log("Fetched products data for shopId:", shopId, productsData); // Log the fetched products data
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
      console.error("Error fetching store data for shopId:", shopId, error); // Log any errors
    }
  };

  useEffect(() => {
    if (filteredProducts.length > 0) {
      filteredProducts.forEach((product) => {
        if (!storeData[product.shopId]) {
          fetchStoreById(product.shopId);
        }
      });
    }
  }, [filteredProducts]);

  const abbreviateText = (text) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > 1) {
      const firstWord = words[0];
      const secondWord = words[1].slice(0, 3);
      return `${firstWord} ${secondWord}.....`;
    }
    return text;
  };

  const renderPagination = (index, total, context) => {
    return (
      <View style={styles.paginationContainer}>
        {filteredProducts.map((_, i) => {
          const isActive = i === index;
          const dotWidth = isActive ? 20 : 10;
          const dotColor = isActive ? "#fff" : "#000";

          return (
            <Animated.View
              key={i}
              style={[
                styles.paginationDot,
                {
                  width: dotWidth,
                  backgroundColor: dotColor,
                  transform: [{ scale: isActive ? 1.2 : 1 }],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const handleProductPress = (product) => {
    const store = storeData[product.shopId];
    if (!store) {
      Alert.alert("Error", "Store data not available.");
      return;
    }

    navigation.navigate("FoodProducts", {
      item: product,
      restaurantName: store.name,
      restaurantImageUri: store.avatar,
      restaurantLocation: `${store.address.street}, ${store.address.city}, ${store.address.state}, ${store.address.country}`,
    });
  };

  const isRestaurantOpen = (restaurant) => {
    const currentHour = new Date().getHours();
    const openingTime = parseTime(restaurant["Opening Time"]);
    const closingTime = parseTime(restaurant["Closing Time"]);

    if (closingTime < openingTime) {
      // Restaurant is open past midnight
      return currentHour >= openingTime || currentHour < closingTime;
    } else {
      return currentHour >= openingTime && currentHour < closingTime;
    }
  };

  const parseTime = (timeString) => {
    if (!timeString) return 0;
    const [time, period] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours;
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: "#ccc",
          paddingHorizontal: 2,
          paddingVertical: 5,
        }}
      >
        <LinearGradient
          colors={["#737373", "rgba(255, 218, 185, .6)", "#d16847"]}
          locations={[1, 0.2, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0, y: 0.7 }}
          style={{
            padding: 10,
            borderRadius: 10,
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.8,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 2,
          }}
        >
          <Swiper
            style={styles.swiper}
            showsButtons={false}
            showsPagination={false}
            autoplay={true}
            autoplayTimeout={5}
            loop={true}
          >
            {filteredProducts.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={styles.slide}
                onPress={() => handleProductPress(product)}
              >
                <View style={styles.productCard}>
                  <Image
                    source={{ uri: product.images[0] }}
                    style={styles.image}
                  />
                  <View style={styles.overlay}>
                    <View style={styles.ratingContainer}>
                      <Image source={starIcon} style={styles.starIcon} />
                      <Text style={styles.rating}>{product.rating}</Text>
                    </View>
                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.price}>₦{product.basePrice}</Text>
                  </View>
                  <View style={styles.paginationWrapper}>
                    {renderPagination(index, filteredProducts.length, null)}
                  </View>
                  <View style={styles.mealHeadingContainer}>
                    <Text style={styles.mealHeading}>{mealHeading}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Swiper>
        </LinearGradient>
      </View>
    </View>
  );
};

export default SwiperComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 0,
  },

  cont: {
    flex: 1,
    alignItems: "center",
    padding: 0,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  image: {
    width: width * 1,
    height: height * 0.4,
    borderRadius: 0,
    marginBottom: 0,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  header: {
    position: "absolute",
    top: 30,
    left: 5,
    zIndex: 5,
    backgroundColor: "#d96540",
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backIcon: {
    padding: 5,
    marginRight: 2,
  },
  deliveryTimeContainer: {
    position: "absolute",
    top: 30,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryTime: {
    fontSize: 16,
    fontFamily: "Kanit",
    color: "black",
  },
  ratingContainer: {
    position: "absolute",
    top: 220,
    left: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 5,
    borderRadius: 5,
  },
  starIcon: {
    width: 20,
    height: 20,
    marginRight: 1,
  },
  ratingText: {
    fontSize: 16,
    color: "white",
  },
  locationContainer: {
    position: "absolute",
    top: 220,
    right: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 5,
    borderRadius: 5,
  },
  locationIcon: {
    width: 20,
    height: 20,
  },
  location: {
    fontSize: 16,
    fontFamily: "Kanit",
    color: "white",
  },
  scrollContentContainer: {
    paddingTop: 0, // Remove the padding top
    paddingHorizontal: 0,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backgroundContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  speechBubble: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 100,
  },
  name: {
    fontSize: 24,
    textAlign: "center",
    fontFamily: "Kanitb",
    color: "black",
  },
  mealHeading: {
    fontSize: 18,
    fontFamily: "Kanitb",
    textAlign: "left",
    color: "black",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#A4A4A4",
  },
  aboutCard: {
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: "rgba(255, 255, 255, .5)",
  },
  aboutCardContent: {
    borderRadius: 10,
    padding: 10,
  },
  about: {
    marginTop: 2,
    fontSize: 14,
    fontFamily: "Kanit",
    textAlign: "center",
    color: "black",
  },
  moreText: {
    fontSize: 14,
    fontFamily: "Kanit",
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 5,
    color: "black",
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
    paddingBottom: 50,
  },
  menuItem: {
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
  menuImage: {
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
  menuName: {
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
  menuHeadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    width: "100%",
  },
  searchInput: {
    height: 35,
    borderColor: "rgba(255, 255, 255, .8)",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    flex: 1, // Make the input take up the available space
    color: "white",
  },
});
