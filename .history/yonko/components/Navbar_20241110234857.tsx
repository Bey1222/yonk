import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Platform,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Text,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const categoryMappings = {
  FOOD: {
    screen: "FoodProducts",
    properties: {
      name: "restaurantName",
      image: "restaurantImageUri",
      location: "restaurantLocation",
      state: "restaurantState",
    },
  },
  drugs: {
    screen: "PharmacyProducts",
    properties: {
      name: "pharmacyName",
      image: "pharmacyImageUri",
      location: "pharmacyLocation",
    },
  },
  groceries: {
    screen: "SupernarketProducts",
    properties: {
      name: "supermarketName",
      image: "supermarketImageUri",
      location: "supermarketLocation",
    },
  },
  techs: {
    screen: "TechProducts",
    properties: {
      name: "techName",
      image: "techImageUri",
      location: "techLocation",
    },
  },
  household: {
    screen: "HouseholdProducts",
    properties: {
      name: "householdName",
      image: "householdImageUri",
      location: "householdLocation",
    },
  },
  wardrobe: {
    screen: "WardrobeProducts",
    properties: {
      name: "wardrobeName",
      image: "wardrobeImageUri",
      location: "wardrobeLocation",
    },
  },
  spas: {
    screen: "SpaBeautyProducts",
    properties: {
      name: "spaName",
      image: "spaImageUri",
      location: "spaLocation",
    },
  },
  pet: {
    screen: "PetSuppliesProducts",
    properties: {
      name: "petSupplyName",
      image: "petSupplyImageUri",
      location: "petSupplyLocation",
    },
  },
  plants: {
    screen: "PlantsProducts",
    properties: {
      name: "plantName",
      image: "plantImageUri",
      location: "plantLocation",
    },
  },
};

const Navbar: React.FC = () => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchWidth] = useState(new Animated.Value(0));
  const [predictionBoxHeight] = useState(new Animated.Value(0));
  const [searchText, setSearchText] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState({});
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const navbarHeight = 60;
  const searchInputRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    Animated.timing(searchWidth, {
      toValue: isSearchExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(predictionBoxHeight, {
      toValue: isSearchExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isSearchExpanded]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const searchWidthInterpolate = searchWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [screenWidth * 0.38, screenWidth - 40],
  });

  const predictionBoxHeightInterpolate = predictionBoxHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenHeight - navbarHeight - keyboardHeight],
  });

  const handleSearch = async (text) => {
    setSearchText(text);
    if (text === "") {
      setPredictions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/products`,
        {
          params: {
            search: text,
          },
        }
      );

      // Log the response data to inspect its structure
      console.log("Response data:", response.data);

      // Check if the response data contains the expected key
      if (response.data.products && Array.isArray(response.data.products)) {
        const results = response.data.products
          .map((item) => ({
            ...item,
            category: item.category.toLowerCase(), // Convert category to lowercase
          }))
          .filter((item) =>
            item.name.toLowerCase().includes(text.toLowerCase())
          );

        setPredictions(results);

        // Fetch store data for each item
        results.forEach((item) => {
          if (!storeData[item.shopId]) {
            fetchStoreById(item.shopId);
          }
        });
      } else {
        console.error(
          "Response data does not contain the expected structure:",
          response.data
        );
        setPredictions([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePredictionClick = async (item) => {
    console.log("Prediction clicked:", item);
    setSearchText(item.name);
    setPredictions([]);

    const { screen, properties } =
      categoryMappings[item.category.toLowerCase()];

    // Fetch store data if not already available
    if (!storeData[item.shopId]) {
      try {
        await fetchStoreById(item.shopId);
      } catch (error) {
        console.error("Error fetching store data:", error);
        return;
      }
    }

    const store = storeData[item.shopId];

    if (!store) {
      console.error("Store not found for shopId:", item.shopId);
      return;
    }

    // Log the data being passed to the respective screen
    console.log("Navigating to", screen, "with:", {
      item,
      [properties.name]: item[properties.name],
      [properties.image]: item[properties.image],
      [properties.location]: item[properties.location],
      store,
    });

    navigation.navigate(screen, {
      item,
      [properties.name]: item[properties.name],
      [properties.image]: item[properties.image],
      [properties.location]: item[properties.location],
      store,
    });
  };

  const fetchStoreById = async (shopId) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/shops/${shopId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN}`,
          },
        }
      );
      if (response.data && response.data.shop) {
        setStoreData((prevStoreData) => ({
          ...prevStoreData,
          [shopId]: response.data.shop,
        }));

        // Fetch products for the store
        const productsResponse = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}/products?shopId=${shopId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN}`,
            },
          }
        );
        if (productsResponse.data && productsResponse.data.products) {
          setStoreData((prevStoreData) => ({
            ...prevStoreData,
            [shopId]: {
              ...response.data.shop,
              products: productsResponse.data.products,
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching store data for shopId:", shopId, error);
      throw error; // Re-throw the error to be handled by the calling function
    }
  };

  const handleSeeMoreClick = () => {
    const filteredPredictions = predictions.map((item) =>
      item.category === "restaurants" || item.category === "groceries"
        ? {
            ...item,
            openingTime: item.openingTime,
            closingTime: item.closingTime,
          }
        : item
    );
    navigation.navigate("SeeMoreScreen", { predictions: filteredPredictions });
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsSearchExpanded(false);
    }, 200); // Adjust the delay as needed
  };

  return (
    <View style={styles.navBar}>
      <Animated.View
        style={[styles.searchContainer, { width: searchWidthInterpolate }]}
      >
        <AntDesign name="search1" size={18} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="What u need..."
          placeholderTextColor="#999"
          onChangeText={handleSearch}
          value={searchText}
          onFocus={() => setIsSearchExpanded(true)}
          onBlur={handleBlur}
          ref={searchInputRef}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.predictionBox,
          { height: predictionBoxHeightInterpolate, zIndex: 1 },
          isSearchExpanded
            ? styles.predictionBoxVisible
            : styles.predictionBoxHidden,
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={predictions.slice(0, 10)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handlePredictionClick(item)}>
                  <View style={styles.predictionContainer}>
                    <Image
                      source={{ uri: item.images[0] }}
                      style={styles.predictionImage}
                    />
                    <View style={styles.predictionInfo}>
                      <Text style={styles.predictionText}>{item.name}</Text>
                      <View style={styles.priceContainer}>
                        {item.discount ? (
                          <>
                            <Text style={styles.discountPrice}>
                              {`₦${item.discountPrice}`}
                            </Text>
                            <Text style={styles.originalPrice}>
                              {`₦${item.basePrice}`}
                            </Text>
                          </>
                        ) : (
                          <Text
                            style={styles.price}
                          >{`₦${item.basePrice}`}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListFooterComponent={
                predictions.length > 10 && (
                  <TouchableOpacity
                    style={styles.seeMoreButton}
                    onPress={handleSeeMoreClick}
                  >
                    <Text style={styles.seeMoreText}>
                      See More ({predictions.length - 10})
                    </Text>
                  </TouchableOpacity>
                )
              }
            />
          )}
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: "rgba(217, 101, 64, .8)",
    height: 68,
    zIndex: 100,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 6,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  predictionBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 500,
  },
  predictionBoxVisible: {
    display: "flex",
  },
  predictionBoxHidden: {
    display: "none",
  },
  predictionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    zIndex: 500,
    width: "100%",
  },
  predictionText: {
    fontSize: 16,
    fontFamily: "Kanitsb",
    color: "#333",
    paddingVertical: 4,
  },
  predictionImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  discountPrice: {
    fontSize: 14,
    color: "black",
    fontFamily: "Kanitsb",
    textAlign: "center",
    marginRight: 5,
  },
  originalPrice: {
    fontSize: 14,
    color: "red",
    textDecorationLine: "line-through",
    fontFamily: "Kanit",
  },
  price: {
    fontSize: 14,
    color: "black",
    fontFamily: "Kanitsb",
    textAlign: "center",
  },
  seeMoreButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  seeMoreText: {
    fontSize: 16,
    color: "#000",
  },
  statusText: {
    fontSize: 14,
    color: "green",
    fontFamily: "Kanitsb",
    textAlign: "center",
  },
});

export default Navbar;
