import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "react-native-vector-icons";
import { useNavigation } from "@react-navigation/native";
import SwiperComponent from "../SwiperComponent";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SearchSwiper from "@/Searchcomponents/SearchSwiper";
import newimage from "../../assets/new.png";
import starIcon from "../../assets/star.png";

const Food = () => {
  const navigation = useNavigation();
  const [categoryData, setCategoryData] = useState([]);
  const [storeData, setStoreData] = useState({});
  const [sectionData, setSectionData] = useState({});

  const sectionNames = [
    "Popular Near You",
    "Discounts",
    "Best Sellers",
    "New Arrivals",
  ];

  useEffect(() => {
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
          setCategoryData(data.products);
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
      } else {
        console.error("Invalid store data format:", data);
      }
    } catch (error) {
      console.error("Error fetching store data for shopId:", shopId, error); // Log any errors
    }
  };

  useEffect(() => {
    if (categoryData.length > 0) {
      categoryData.forEach((product) => {
        if (!storeData[product.shopId]) {
          fetchStoreById(product.shopId);
        }
      });
    }
  }, [categoryData]);

  useEffect(() => {
    if (categoryData && Object.keys(storeData).length > 0) {
      const sections = sectionNames;
      const data = {};
      sections.forEach((section, index) => {
        if (section === "Popular Near You") {
          data[section] = shuffleArray(Object.values(storeData)).slice(0, 5);
        } else if (section === "Discounts") {
          data[section] = shuffleArray(categoryData).slice(0, 6);
        } else if (section === "Best Sellers") {
          data[section] = bestSellers;
        } else if (section === "New Arrivals") {
          data[section] = shuffleArray(categoryData).slice(0, 5);
        } else {
          data[section] = shuffleArray(categoryData).slice(
            index * 5,
            (index + 1) * 5
          );
        }
      });
      setSectionData(data);
    }
  }, [categoryData, storeData]);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const abbreviateName = (name, maxLength = 17) => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + "...";
    }
    return name;
  };

  const bestSellers = [
    { name: "Fast Food", image: require("../../assets/all3.jpg") },
    { name: "Local Dishes", image: require("../../assets/all4.jpg") },
    { name: "Alcohol", image: require("../../assets/all2.jpg") },
    { name: "Healthy", image: require("../../assets/healthy.jpg") },
  ];

  const navigateToBrandScreen = (brand) => {
    const brandItems = categoryData.flatMap((item) =>
      item.menu
        .filter((menuItem) => menuItem.brand === brand)
        .map((menuItem) => ({
          ...menuItem,
          restaurantName: item.name,
          restaurantImageUri: item.image,
          restaurantLocation: item.location,
          openingTime: item["Opening Time"],
          closingTime: item["Closing Time"],
        }))
    );

    if (brand === "Fast Food") {
      navigation.navigate("FastFoodScreen", { items: brandItems });
    } else if (brand === "Local Dishes") {
      navigation.navigate("LocalDishesScreen", { items: brandItems });
    } else if (brand === "Alcohol") {
      navigation.navigate("AlcoholScreen", { items: brandItems });
    } else if (brand === "Healthy") {
      navigation.navigate("HealthyScreen", { items: brandItems });
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

  const sortItems = (items) => {
    if (!items) {
      console.error("Items is undefined or null");
      return [];
    }
    return items.sort((a, b) =>
      a.isOpen === b.isOpen ? 0 : a.isOpen ? -1 : 1
    );
  };

  const handleNavigation = (item, screenName) => {
    if (!item.isOpen) {
      Alert.alert("Restaurant Closed", "This restaurant is currently closed.");
    }
    if (screenName === "MainstoreFood") {
      const store = storeData[item.shopId];
      if (store) {
        navigation.navigate(screenName, {
          restaurant: {
            shop: store,
          },
          products: categoryData.filter(
            (product) => product.shopId === item.shopId
          ),
        });
      } else {
        console.error("Store data not found for shopId:", item.shopId);
      }
    } else {
      navigation.navigate(screenName, {
        item,
        restaurantName: item.restaurantName,
        restaurantImageUri: item.restaurantImageUri,
        restaurantLocation: item.restaurantLocation,
      });
    }
  };

  return (
    <LinearGradient
      colors={["#737373", "rgba(255, 218, 185, .6)", "#d16847"]}
      locations={[1, 0.29, 0.5]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.75 }}
      style={styles.container}
    >
      <ScrollView style={styles.contentContainer}>
        <SwiperComponent />
        {sectionNames.map((section, index) => (
          <View
            key={index}
            style={[
              styles.sectionContainer,
              {
                borderRadius: 10,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionText, { color: "#fff" }]}>
                {section}
              </Text>
              {section !== "Best Sellers" && (
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => {
                    if (section === "Popular Near You") {
                      navigation.navigate("PopularNearYouScreen", {
                        popularItems: Object.values(storeData),
                      });
                    } else if (section === "Discounts") {
                      navigation.navigate("DiscountsScreen", {
                        discountItems: categoryData,
                      });
                    } else if (section === "New Arrivals") {
                      navigation.navigate("NewArrivalsScreen", {
                        newItems: categoryData,
                      });
                    }
                  }}
                >
                  <AntDesign name="right" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            {section === "Discounts" ? (
              <View style={styles.listContainer}>
                {sortItems(sectionData[section]).map((item, idx) => {
                  const store = storeData[item.shopId];
                  console.log("Discounts item:", item, "Store:", store); // Log the item and full store data
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.card}
                      onPress={() => handleNavigation(item, "FoodProducts")}
                    >
                      <View style={styles.cardopa}>
                        <Image
                          source={{ uri: item.images[0] }}
                          style={styles.image}
                        />
                      </View>
                      <View style={styles.cardin}>
                        <Text style={styles.name}>
                          {abbreviateName(item.name)}
                        </Text>

                        <View style={styles.priceContainer}>
                          <Text style={styles.discountPrice}>
                            ₦{item.basePrice}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : section === "Best Sellers" ? (
              <View style={[styles.bestSellersSection]}>
                {bestSellers.map((item, idx) => {
                  console.log("Best Sellers item:", item); // Log the item data
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.bestSellerItem]}
                      onPress={() => navigateToBrandScreen(item.name)}
                    >
                      <View style={styles.imageContainer}>
                        <Image
                          source={item.image}
                          style={styles.bestSellerImage}
                          resizeMode="cover"
                        />
                        <View style={styles.imageOva} />
                      </View>
                      <Text style={[styles.bestSellerText, { color: "#fff" }]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : section === "New Arrivals" ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.sectionScrollView}
              >
                {sortItems(sectionData[section]).map((item, idx) => {
                  const store = storeData[item.shopId];
                  console.log("New Arrivals item:", item, "Store:", store); // Log the item and full store data
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.sectionItem}
                      onPress={() => handleNavigation(item, "FoodProducts")}
                    >
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: item.images[0] }}
                          style={styles.sectionImage}
                        />
                        <View style={styles.newContainer}>
                          <Image source={newimage} style={styles.newIcon} />
                        </View>
                      </View>
                      <Text style={[styles.sectionItemText, { color: "#fff" }]}>
                        {abbreviateName(item.name, 20)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.sectionScrollView}
              >
                {sortItems(sectionData[section]).map((item, idx) => {
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.sectionItem}
                      onPress={() => handleNavigation(item, "MainstoreFood")}
                    >
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: item.avatar }}
                          style={styles.sectionImage}
                        />
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
                            <Text
                              style={[
                                styles.deliveryTimeText,
                                { color: "#fff" },
                              ]}
                            >
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
                        <Text
                          style={[styles.sectionItemText, { color: "#fff" }]}
                        >
                          {abbreviateName(item.name, 20)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        ))}

        <SearchSwiper />
      </ScrollView>
    </LinearGradient>
  );
};

export default MainstoreFood;

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
