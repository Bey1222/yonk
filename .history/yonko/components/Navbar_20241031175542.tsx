import React, { useState, useEffect, useRef } from "react";
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

// Import the data
import restaurants from "../assets/data/restaurantsdata.json";
import drugs from "../assets/data/drugsdata.json";
import groceries from "../assets/data/grocerydata.json";
import techs from "../assets/data/techdata.json";
import household from "../assets/data/householddata.json";
import wardrobe from "../assets/data/clothingdata.json";
import spas from "../assets/data/beautydata.json";
import pet from "../assets/data/petdata.json";
import plants from "../assets/data/plantdata.json";

const dataArrays = [
  { category: "restaurants", data: restaurants },
  { category: "drugs", data: drugs },
  { category: "groceries", data: groceries },
  { category: "techs", data: techs },
  { category: "household", data: household },
  { category: "wardrobe", data: wardrobe },
  { category: "spas", data: spas },
  { category: "pet", data: pet },
  { category: "plants", data: plants },
];

const categoryMappings = {
  restaurants: {
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

const isStoreOpen = (openingTime, closingTime) => {
  if (!openingTime || !closingTime) {
    return false; // or handle it in a way that makes sense for your app
  }

  const currentHour = new Date().getHours();
  const openingHour = parseInt(openingTime.split(" ")[0]);
  const closingHour = parseInt(closingTime.split(" ")[0]);

  if (closingHour < openingHour) {
    // Store is open past midnight
    return currentHour >= openingHour || currentHour < closingHour;
  } else {
    return currentHour >= openingHour && currentHour < closingHour;
  }
};

const Navbar: React.FC = () => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchWidth] = useState(new Animated.Value(0));
  const [predictionBoxHeight] = useState(new Animated.Value(0));
  const [searchText, setSearchText] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [loading, setLoading] = useState(false);
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

  const handleSearch = (text) => {
    setSearchText(text);
    if (text === "") {
      setPredictions([]);
      return;
    }

    setLoading(true);
    const results = [];
    dataArrays.forEach(({ category, data }) => {
      const { properties } = categoryMappings[category];
      Object.values(data).forEach((array) => {
        array.forEach((item) => {
          if (item.menu) {
            item.menu.forEach((menuItem) => {
              if (menuItem.name.toLowerCase().includes(text.toLowerCase())) {
                results.push({
                  ...menuItem,
                  [properties.name]: item.name,
                  [properties.image]: item.image,
                  [properties.location]: item.location,
                  category,
                  ...(category === "restaurants" || category === "groceries"
                    ? {
                        openingTime: item.openingTime,
                        closingTime: item.closingTime,
                      }
                    : {}),
                });
              }
            });
          }
        });
      });
    });
    setPredictions(results);
    setLoading(false);
  };

  const handlePredictionClick = (item) => {
    console.log("Prediction clicked:", item);
    setSearchText(item.name);
    setPredictions([]);

    const { screen, properties } = categoryMappings[item.category];

    // Log the data being passed to the respective screen
    console.log("Navigating to", screen, "with:", {
      item,
      [properties.name]: item[properties.name],
      [properties.image]: item[properties.image],
      [properties.location]: item[properties.location],
    });

    navigation.navigate(screen, {
      item,
      [properties.name]: item[properties.name],
      [properties.image]: item[properties.image],
      [properties.location]: item[properties.location],
    });
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
                      source={{ uri: item.image }}
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
                              {`₦${item.price}`}
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.price}>{`₦${item.price}`}</Text>
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

export default Navbar;

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