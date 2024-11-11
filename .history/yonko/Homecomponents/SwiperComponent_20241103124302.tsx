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
    if (!store || !store.products) {
      Alert.alert("Error", "Store data not available.");
      return;
    }

    navigation.navigate("MainstoreFood", {
      restaurant: {
        shop: store,
        products: store.products,
      },
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
    marginBottom: 20,
    zIndex: 1,
  },
  mealHeadingContainer: {
    position: "absolute",
    bottom: 130,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  mealHeading: {
    fontSize: 20,
    fontFamily: "Kanitsb",
    color: "#fff",
  },
  swiper: {
    height: height * 0.45,
    borderRadius: 10,
  },
  slide: {
    flex: 1,
    borderRadius: 10,
  },
  restaurantCard: {
    height: height * 0.45,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
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
  closedInfoContainer: {
    backgroundColor: "rgba(255, 0, 0, 1)",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  closedText: {
    fontSize: 15,
    fontFamily: "Kanitb",
    color: "#fff",
    marginTop: 5,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    padding: 10,
  },
  ratingContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, .3)",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rating: {
    fontSize: 16,
    fontFamily: "Kanit",
    color: "#fff",
  },
  starIcon: {
    width: 35,
    height: 35,
  },
  name: {
    fontSize: 25,
    textAlign: "center",
    fontFamily: "Kanitb",
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    color: "#fff",
    padding: 5,
  },
  menuContainer: {
    position: "absolute",
    top: 20,
    right: 0,
    width: "30%",
    height: "100%",
    padding: 10,
  },
  menuItem: {
    borderRadius: 10,
    marginBottom: 10,
  },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: 70,
  },
  menuName: {
    fontSize: 16,
    fontFamily: "Kanit",
  },
  menuPrice: {
    fontSize: 16,
    fontFamily: "Kanitsb",
    textAlign: "center",
    color: "#fff",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  paginationWrapper: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  price: {
    fontSize: 30,
    fontFamily: "Kanitsb",
    textAlign: "right",
    color: "#fff",
  },
});
