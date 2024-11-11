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
import restaurantsData from "../assets/data/restaurantsdata.json";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import starIcon from "../assets/star.png"; // Import the star icon
import { FontAwesome } from "@expo/vector-icons"; // Import FontAwesome for the "i" icon

const { width, height } = Dimensions.get("window");

const SwiperComponent = () => {
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [mealHeading, setMealHeading] = useState("");
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

    const filteredData = restaurantsData.restaurants
      .filter((restaurant) => {
        const breakfast = restaurant.menu.some((item) => item.breakfast);
        const lunch = restaurant.menu.some((item) => item.lunch);
        const dinner = restaurant.menu.some((item) => item.dinner);

        return (
          ((isBreakfastTime && breakfast) ||
            (isLunchTime && lunch) ||
            (isDinnerTime && dinner)) &&
          restaurant.package === "Elite"
        );
      })
      .slice(0, 5);

    setFilteredRestaurants(filteredData);
  }, []);

  const abbreviateText = (text) => {
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
        {filteredRestaurants.map((_, i) => {
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

  const handleRestaurantPress = (restaurant) => {
    if (!isRestaurantOpen(restaurant)) {
      Alert.alert(
        "Store Closed",
        `This store is currently closed. It opens at ${restaurant["Opening Time"]} and closes at ${restaurant["Closing Time"]}.`,
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("StoreFront", { restaurant, mealHeading }),
          },
        ]
      );
    } else {
      navigation.navigate("StoreFront", { restaurant, mealHeading });
    }
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
            {filteredRestaurants.map((restaurant, index) => (
              <TouchableOpacity
                key={index}
                style={styles.slide}
                onPress={() => handleRestaurantPress(restaurant)}
              >
                <View style={styles.restaurantCard}>
                  <Image
                    source={{ uri: restaurant.image }}
                    style={styles.image}
                  />
                  {!isRestaurantOpen(restaurant) && (
                    <View style={styles.closedOverlay}>
                      <View style={styles.closedInfoContainer}>
                        <FontAwesome
                          name="info-circle"
                          size={24}
                          color="white"
                        />
                        <Text style={styles.closedText}>Store Closed</Text>
                        <Text style={styles.closedText}>
                          Opening Time: {restaurant["Opening Time"]}
                        </Text>
                        <Text style={styles.closedText}>
                          Closing Time: {restaurant["Closing Time"]}
                        </Text>
                      </View>
                    </View>
                  )}
                  <View style={styles.overlay}>
                    <View style={styles.ratingContainer}>
                      <Image source={starIcon} style={styles.starIcon} />
                      <Text style={styles.rating}>{restaurant.rating}</Text>
                    </View>
                    <Text style={styles.name}>{restaurant.name}</Text>
                    <View style={styles.menuContainer}>
                      {restaurant.menu.slice(0, 2).map((item, idx) => (
                        <View key={idx} style={styles.menuItem}>
                          <Image
                            source={{ uri: item.image }}
                            style={styles.menuImage}
                          />
                          <Text style={styles.menuPrice}>${item.price}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.paginationWrapper}>
                    {renderPagination(index, filteredRestaurants.length, null)}
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
    width: 15,
    height: 15,
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
});
