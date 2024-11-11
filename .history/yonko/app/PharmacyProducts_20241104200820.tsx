import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Swiper from "react-native-swiper";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useBasket } from "../context/BasketContext"; // Import the BasketContext
import { useWishlist } from "../context/WishlishContext"; // Import the WishlistContext
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient
import logo from "../assets/logo.png"; // Import the logo image
import RBSheet from "react-native-raw-bottom-sheet"; // Import the bottom sheet library

const { width, height } = Dimensions.get("window");

const PharmacyProducts = ({ route }) => {
  const {
    item = {},
    pharmacyName = "",
    pharmacyImageUri = "",
    pharmacyLocation = "",
  } = route.params || {};

  console.log("Received item:", item);
  console.log("Received pharmacyName:", pharmacyName);
  console.log("Received pharmacyImageUri:", pharmacyImageUri);
  console.log("Received pharmacyLocation:", pharmacyLocation);

  if (!item || !pharmacyName || !pharmacyImageUri || !pharmacyLocation) {
    console.error("Missing required parameters in PharmacyProducts component");
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { addToBasket } = useBasket(); // Use the BasketContext
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist(); // Use the WishlistContext
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [note, setNote] = useState("");
  const animation = useRef(new Animated.Value(-50)).current; // Initial position off-screen
  const [showAddedToBasketMessage, setShowAddedToBasketMessage] =
    useState(false);
  const [showAddedToWishlistMessage, setShowAddedToWishlistMessage] =
    useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddOnMessage, setShowAddOnMessage] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;
  const refRBSheet = useRef(); // Ref for the bottom sheet

  const sizes = [
    { name: "Small", price: 10.0 },
    { name: "Medium", price: 15.0 },
    { name: "Large", price: 20.0 },
  ];

  useEffect(() => {
    const isItemInWishlist = wishlist.some(
      (wishlistItem) => wishlistItem.id === item.id
    );
    setIsFavorite(isItemInWishlist);
  }, [wishlist, item.id]);

  const handleSizePress = (size) => {
    setSelectedSizes((prevSelected) => {
      const newSelectedSizes = [...prevSelected];
      const index = newSelectedSizes.findIndex((s) => s.name === size.name);
      if (index === -1) {
        newSelectedSizes.push({ ...size, quantity: 1 });
      } else {
        newSelectedSizes.splice(index, 1);
      }
      return newSelectedSizes;
    });
  };

  const handleQuantityChange = (type, size) => {
    setSelectedSizes((prevSelected) =>
      prevSelected.map((s) =>
        s.name === size.name
          ? {
              ...s,
              quantity:
                type === "increase"
                  ? s.quantity + 1
                  : Math.max(s.quantity - 1, 1),
            }
          : s
      )
    );
  };

  const handleDeleteSize = (size) => {
    setSelectedSizes((prevSelected) =>
      prevSelected.filter((s) => s.name !== size.name)
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {item.images.map((_, i) => {
          const isActive = i === activeIndex;
          const dotColor = isActive ? "#d96540" : "#fff";
          const dotSize = isActive ? 28 : 8; // Adjust the size for active and inactive dots
          const dotSizeHeight = isActive ? 10 : 8; // Adjust the size for active and inactive dots
          const dotBorderRadius = isActive ? 5 : 4; // Adjust the border radius for active and inactive dots

          return (
            <View
              key={i}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: dotColor,
                  width: dotSize,
                  height: dotSizeHeight,
                  borderRadius: dotBorderRadius, // Ensure rectangular shape with border radius
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const shortDescription = item.fullDescription
    ? item.fullDescription.split(" ").slice(0, 30).join(" ") + "..."
    : "No description available.";

  const basketPrice = selectedSizes.reduce(
    (acc, size) => acc + size.price * size.quantity,
    0
  );

  const displayAddedToBasketMessage = () => {
    setShowAddedToBasketMessage(true);
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: -50,
        duration: 500,
        useNativeDriver: true,
        delay: 2000,
      }),
    ]).start(() => {
      setShowAddedToBasketMessage(false);
    });
  };

  const displayAddedToWishlistMessage = () => {
    setShowAddedToWishlistMessage(true);
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: -50,
        duration: 500,
        useNativeDriver: true,
        delay: 2000,
      }),
    ]).start(() => {
      setShowAddedToWishlistMessage(false);
    });
  };

  const displaySizeMessage = () => {
    setShowAddOnMessage(true);
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: -50,
        duration: 500,
        useNativeDriver: true,
        delay: 2000,
      }),
    ]).start(() => {
      setShowAddOnMessage(false);
    });
  };

  const handleAddToBasket = () => {
    if (selectedSizes.length === 0) {
      displaySizeMessage();
    } else {
      const basketItem = {
        id: item.id, // Ensure the item has a valid id
        name: item.name,
        price: basketPrice,
        sizes: selectedSizes,
        note,
        restaurant: pharmacyName, // Add the pharmacy name
        restaurantImageUri: pharmacyImageUri, // Use the passed pharmacyImageUri
        restaurantLocation: pharmacyLocation, // Add the pharmacy location
      };
      addToBasket(basketItem);
      displayAddedToBasketMessage();
      refRBSheet.current.open(); // Open the bottom sheet
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleFavoritePress = () => {
    if (selectedSizes.length === 0) {
      displaySizeMessage();
      return;
    }

    setIsFavorite(!isFavorite);
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Calculate the total price based on selected sizes
    const totalPrice = selectedSizes.reduce(
      (sum, size) => sum + size.price * size.quantity,
      0
    );

    // Add the item to the wishlist
    addToWishlist({
      id: item.id,
      name: item.name,
      price: totalPrice, // Use the calculated total price
      image: item.images[0],
      sizes: selectedSizes,
      restaurantName: pharmacyName, // Add the pharmacy name
      restaurantImageUri: pharmacyImageUri, // Add the pharmacy image URI
      restaurantLocation: pharmacyLocation, // Add the pharmacy location
    });

    displayAddedToWishlistMessage();
  };

  const calculateDiscountPercentage = () => {
    if (item.discountPrice && item.price) {
      const discount = item.price - item.discountPrice;
      const percentage = (discount / item.price) * 100;
      return percentage.toFixed(0);
    }
    return 0;
  };

  return (
    <LinearGradient
      colors={["#737373", "rgba(255,46,65,.9)", "#737373"]}
      locations={[1, 0.2, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.7 }}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.swiperContainer}>
          <Swiper
            style={styles.swiper}
            showsButtons={false}
            showsPagination={false} // Disable the built-in pagination
            autoplayTimeout={5}
            loop={false} // Disable loop
            onIndexChanged={(index) => setActiveIndex(index)} // Update the active index
          >
            {item.images.map((image, index) => (
              <View key={index} style={styles.slide}>
                <Image source={{ uri: image }} style={styles.image} />
                <View style={styles.iconContainer}>
                  <TouchableOpacity
                    style={styles.icon}
                    onPress={handleBackPress}
                  >
                    <Ionicons name="close-sharp" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.icon}
                    onPress={handleFavoritePress}
                  >
                    <Animated.View
                      style={{ transform: [{ scale: heartScale }] }}
                    >
                      <MaterialIcons
                        name="favorite"
                        size={27}
                        color={isFavorite ? "red" : "white"}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Swiper>
          <View style={styles.paginationWrapper}>{renderPagination()}</View>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={[styles.name, { color: "#fff" }]}>{item.name}</Text>
          <View style={styles.priceContainer}>
            {item.discountPrice && item.price ? (
              <>
                <Text style={[styles.discountPrice, { color: "#fff" }]}>
                  ₦{item.discountPrice.toFixed(2)}
                </Text>
                <Text style={[styles.originalPrice, { color: "#fff" }]}>
                  ₦{item.basePrice.toFixed(2)}
                </Text>
                <View style={styles.discountPercentageContainer}>
                  <Text style={[styles.discountPercentage, { color: "#fff" }]}>
                    {calculateDiscountPercentage()}% off
                  </Text>
                </View>
              </>
            ) : (
              <Text style={[styles.price, { color: "#fff" }]}>
                ₦{item.basePrice.toFixed(2)}
              </Text>
            )}
          </View>
          <Text style={[styles.description, { color: "#fff" }]}>
            {showFullDescription
              ? item.fullDescription || "No description available."
              : shortDescription}
          </Text>
          <TouchableOpacity
            onPress={() => setShowFullDescription(!showFullDescription)}
          >
            <Text style={[styles.moreText, { color: "#fff" }]}>
              {showFullDescription ? "less..." : "more..."}
            </Text>
          </TouchableOpacity>
          <View style={styles.borderDemarcation} />
          <Text style={[styles.addOnsHeader, { color: "#fff" }]}>
            Sizes (select multiple)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sizesContainer}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size.name}
                  style={[
                    styles.sizeButton,
                    {
                      backgroundColor: selectedSizes.some(
                        (s) => s.name === size.name
                      )
                        ? "#d96540"
                        : "#ccc",
                    },
                  ]}
                  onPress={() => handleSizePress(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      {
                        color: selectedSizes.some((s) => s.name === size.name)
                          ? "#fff"
                          : "#000",
                      },
                    ]}
                  >
                    {size.name} (₦{size.price.toFixed(2)})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.borderDemarcation} />
          <Text style={[styles.addOnsHeader, { color: "#fff" }]}>
            Add a note (optional)
          </Text>
          <View style={styles.noteContainer}>
            <TextInput
              style={[styles.noteInput, { color: "#fff" }]}
              placeholder="Any specific requests?"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
          <Text style={[styles.summaryHeader, { color: "#fff" }]}>Summary</Text>
          <View style={styles.summaryContainer}>
            {selectedSizes.length === 0 ? (
              <View style={styles.emptySummaryContainer}>
                <Image source={logo} style={styles.emptySummaryImage} />
                <Text style={styles.emptySummaryText}>No items selected</Text>
              </View>
            ) : (
              selectedSizes.map((size) => (
                <View key={size.name} style={styles.summaryRow}>
                  <TouchableOpacity
                    onPress={() => handleDeleteSize(size)}
                    style={styles.deleteIcon}
                  >
                    <Ionicons
                      name="close-sharp"
                      size={20}
                      color="#fff"
                      style={styles.icon2}
                    />
                  </TouchableOpacity>
                  <View style={styles.summaryHeaderContainer}>
                    <Text style={[styles.summaryHeader, { color: "#fff" }]}>
                      {size.name}
                    </Text>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange("decrease", size)}
                      >
                        <FontAwesome name="minus" size={15} color="#000" />
                      </TouchableOpacity>
                      <Text style={[styles.quantityText, { color: "#fff" }]}>
                        {size.quantity}
                      </Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange("increase", size)}
                      >
                        <FontAwesome name="plus" size={15} color="#000" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
          <TouchableOpacity
            style={styles.addToBasketButton}
            onPress={handleAddToBasket}
          >
            <Text style={styles.addToBasketText}>Add to Basket</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}
      >
        <View style={styles.bottomSheetContainer}>
          <Text style={styles.bottomSheetText}>Item added to basket!</Text>
        </View>
      </RBSheet>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swiperContainer: {
    height: height * 0.4, // Set the height of the Swiper container
  },
  swiper: {
    height: height * 0.4, // Set the height of the Swiper component
  },
  slide: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%", // Ensure the image takes the full height of the slide
  },
  iconContainer: {
    position: "absolute",
    top: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  icon: {
    backgroundColor: "#d96540",
    borderRadius: 100,
    padding: 10,
    zIndex: 1,
  },
  detailsContainer: {
    padding: 10,
    marginBottom: 80,
  },
  name: {
    fontSize: 24,
    fontFamily: "Kanitb",
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  price: {
    fontFamily: "Kanitsb",
    fontSize: 20,
    marginBottom: 10,
  },
  discountPrice: {
    fontFamily: "Kanitsb",
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 10,
  },
  originalPrice: {
    fontFamily: "Kanitsb",
    fontSize: 20,
    textDecorationLine: "line-through",
    color: "#ccc",
    marginRight: 10,
  },
  discountPercentageContainer: {
    backgroundColor: "green",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  discountPercentage: {
    fontFamily: "Kanitsb",
    fontSize: 16,
    color: "#fff",
  },
  description: {
    fontSize: 16,
    fontFamily: "Kanit",
    marginTop: 10,
  },
  moreText: {
    fontSize: 16,
    fontFamily: "Kanit",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  borderDemarcation: {
    marginVertical: 20,
  },
  addOnsHeader: {
    fontSize: 18,
    fontFamily: "Kanitb",
    marginBottom: 10,
  },
  sizesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  sizeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  sizeText: {
    fontSize: 16,
    fontFamily: "Kanit",
  },
  addOnsContainer: {
    overflow: "hidden",
  },
  addOnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,

    marginTop: 10,
  },
  addOnText: {
    fontSize: 16,
    fontFamily: "Kanit",
  },
  addOnBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    marginHorizontal: 5,
    transition: "all 0s ease-in-out", // Add smooth transition effect
  },
  paginationWrapper: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomNavbar: {
    position: "absolute",
    bottom: 2,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  addToBasketButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "green",
  },
  addToBasketText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Kanitb",
    marginRight: 10,
  },
  middleDot: {
    width: 5,
    height: 5,
    backgroundColor: "#d96540",
    borderRadius: 2.5,
    marginRight: 10,
  },
  priceText: {
    color: "#fff",
    fontFamily: "Kanitsb",
    fontSize: 20,
  },
  noteContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  noteInput: {
    fontSize: 16,
    fontFamily: "Kanit",
  },
  summaryContainer: {
    marginTop: 0,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  summaryRow: {
    marginBottom: 0,
    position: "relative", // Add this line
  },
  summaryHeaderContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryHeader: {
    paddingVertical: 10,
    fontSize: 20,
    fontFamily: "Kanitb",
  },
  summaryText: {
    fontSize: 16,
    fontFamily: "Kanit",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 20,
    marginTop: 30,
  },
  quantityButton: {
    padding: 6,
    borderRadius: 100,
    backgroundColor: "#ccc",
  },
  quantityText: {
    fontSize: 18,
    fontFamily: "Kanitb",
    marginHorizontal: 10,
  },
  addOnMessage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    alignItems: "center",
  },
  addOnMessageText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Kanitb",
  },
  addedToBasketMessage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    padding: 10,
    alignItems: "center",
  },
  addedToBasketMessageText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Kanitb",
  },
  deleteIcon: {
    position: "absolute",
    top: 0,
    left: -10,
    padding: 5,
    backgroundColor: "#d96540",
    borderRadius: 100,
  },
  emptySummaryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptySummaryImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  emptySummaryText: {
    fontSize: 18,
    fontFamily: "Kanitb",
    color: "#ccc",
  },
  bottomSheetContainer: {
    padding: 20,
  },
  bottomSheetButton: {
    backgroundColor: "rgba(217, 101, 64, .9)",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  bottomSheetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Kanitb",
    textAlign: "center",
  },
});

export default PharmacyProducts;
