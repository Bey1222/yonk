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
import axios from "axios"; // Import Axios for making HTTP requests

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

  console.log("Variants:", JSON.stringify(item.variants, null, 2));

  if (!item || !pharmacyName || !pharmacyImageUri || !pharmacyLocation) {
    console.error("Missing required parameters in PharmacyProducts component");
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { addToBasket, token } = useBasket(); // Use the BasketContext
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist(); // Use the WishlistContext
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [note, setNote] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const animation = useRef(new Animated.Value(-50)).current; // Initial position off-screen
  const [showAddedToBasketMessage, setShowAddedToBasketMessage] =
    useState(false);
  const [showAddedToWishlistMessage, setShowAddedToWishlistMessage] =
    useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddOnMessage, setShowAddOnMessage] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;
  const refRBSheet = useRef(); // Ref for the bottom sheet

  useEffect(() => {
    const isItemInWishlist = wishlist.some(
      (wishlistItem) => wishlistItem.id === item._id
    );
    setIsFavorite(isItemInWishlist);
  }, [wishlist, item._id]);

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

  const handleQuantityChange = async (type, size) => {
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

    if (type === "decrease") {
      try {
        await reduceQuantity(size);
      } catch (error) {
        console.error("Error reducing quantity:", error);
      }
    }
  };

  const reduceQuantity = async (size) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/cart/reduceQuantity`,
        {
          productId: item._id,
          quantity: size.quantity - 1,
          selectedVariant: size.name,
          selectedOption: size.name,
          selectedAddOns: [],
          price: size.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Backend response:", response.data); // Log the backend response
    } catch (error) {
      console.error("Error reducing quantity:", error);
    }
  };

  const handleDeleteSize = (size) => {
    setSelectedSizes((prevSelected) =>
      prevSelected.filter((s) => s.name !== size.name)
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {[item.images[0], ...item.images.slice(1)].map((_, i) => {
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

  const shortDescription = item.description
    ? item.description.split(" ").slice(0, 30).join(" ") + "..."
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

  const handleAddToBasket = async () => {
    if (selectedSizes.length === 0) {
      displaySizeMessage();
    } else {
      const basketItem = {
        id: item._id, // Ensure the item has a valid id
        name: item.name,
        price: basketPrice,
        sizes: selectedSizes,
        note,
        restaurant: pharmacyName, // Add the pharmacy name
        restaurantImageUri: pharmacyImageUri, // Use the passed pharmacyImageUri
        restaurantLocation: pharmacyLocation, // Add the pharmacy location
        image: item.images[0], // Add the image property
      };

      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_BASE_URL}/cart/addToCart`,
          {
            productId: item._id,
            quantity: selectedSizes.reduce(
              (acc, size) => acc + size.quantity,
              0
            ),
            selectedVariant: selectedSizes.map((size) => size.name).join(", "),
            selectedOption: selectedSizes.map((size) => size.name).join(", "),
            selectedAddOns: [],
            price: basketPrice,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Backend response:", response.data); // Log the backend response

        addToBasket(basketItem);
        displayAddedToBasketMessage();
        refRBSheet.current.open(); // Open the bottom sheet
      } catch (error) {
        console.error("Error adding to cart:", error); // Log any errors
      }
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
      id: item._id,
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
    if (item.discountPrice && item.basePrice) {
      const discount = item.basePrice - item.discountPrice;
      const percentage = (discount / item.basePrice) * 100;
      return percentage.toFixed(0);
    }
    return 0;
  };

  const renderVariants = () => {
    if (!item.variants || !Array.isArray(item.variants.variantValues)) {
      console.error("Variants are not defined or not an array");
      return null;
    }

    if (item.variants.variantValues.length === 0) {
      return (
        <Text style={[styles.variantHeader, { color: "#fff" }]}>
          No variants available
        </Text>
      );
    }

    return item.variants.variantValues.map((variantValue, vIndex) => (
      <View key={vIndex} style={styles.variantValueContainer}>
        <Text style={[styles.variantValue, { color: "#fff" }]}>
          {variantValue.value}
        </Text>
        {variantValue.options && variantValue.options.length > 0 ? (
          variantValue.options.map((option, oIndex) => (
            <View key={oIndex} style={styles.optionContainer}>
              <Text style={[styles.optionName, { color: "#fff" }]}>
                {option.optionName}
              </Text>
              {option.optionValues.map((optionValue, ovIndex) => (
                <View key={ovIndex} style={styles.optionValueContainer}>
                  <Text style={[styles.optionValue, { color: "#fff" }]}>
                    {optionValue.value} - ₦
                    {optionValue.price ? optionValue.price.toFixed(2) : "0.00"}
                  </Text>
                </View>
              ))}
            </View>
          ))
        ) : (
          <Text style={[styles.variantPrice, { color: "#fff" }]}>
            ₦{variantValue.price ? variantValue.price.toFixed(2) : "0.00"}
          </Text>
        )}
      </View>
    ));
  };

  const renderSelectedVariants = () => {
    return selectedSizes.map((size) => (
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
        <Text style={[styles.summaryText, { color: "#fff" }]}>
          Add-ons:{" "}
          {selectedAddOns[size.name]?.map((addOn) => addOn.name).join(", ") ||
            "None"}
        </Text>
        <View style={styles.borderDemarcation} />
      </View>
    ));
  };

  return (
    <LinearGradient
      colors={["#737373", "rgba(255,218,185, .9)", "#d16847"]}
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
            onIndexChanged={(index) => setActiveIndex(index)} // Update the active index
          >
            {[item.images[0], ...item.images.slice(1)].map((image, index) => (
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
            {item.discountPrice && item.basePrice ? (
              <>
                <Text style={[styles.discountPrice, { color: "#fff" }]}>
                  ₦{item.discountPrice ? item.discountPrice.toFixed(2) : "0.00"}
                </Text>
                <Text style={[styles.originalPrice, { color: "#fff" }]}>
                  ₦{item.basePrice ? item.basePrice.toFixed(2) : "0.00"}
                </Text>
                <View style={styles.discountPercentageContainer}>
                  <Text style={[styles.discountPercentage, { color: "#fff" }]}>
                    {calculateDiscountPercentage()}% off
                  </Text>
                </View>
              </>
            ) : (
              <Text style={[styles.price, { color: "#fff" }]}>
                ₦{item.basePrice ? item.basePrice.toFixed(2) : "0.00"}
              </Text>
            )}
          </View>
          <Text style={[styles.description, { color: "#fff" }]}>
            {showFullDescription ? item.description : shortDescription}
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
          <View style={styles.sizesContainer}>
            {item.variants && item.variants.variantValues.length > 0 ? (
              item.variants.variantValues.map((variantValue, vIndex) => (
                <TouchableOpacity
                  key={vIndex}
                  style={[
                    styles.sizeButton,
                    {
                      backgroundColor: selectedSizes.some(
                        (s) => s.name === variantValue.value
                      )
                        ? "#d96540"
                        : "#ccc",
                    },
                  ]}
                  onPress={() =>
                    handleSizePress({
                      name: variantValue.value,
                      price:
                        variantValue.options?.[0]?.optionValues?.[0]?.price ||
                        0, // Access the nested price
                    })
                  }
                >
                  <Text
                    style={[
                      styles.sizeText,
                      {
                        color: selectedSizes.some(
                          (s) => s.name === variantValue.value
                        )
                          ? "#fff"
                          : "#000",
                      },
                    ]}
                  >
                    {variantValue.value} (₦
                    {variantValue.options?.[0]?.optionValues?.[0]?.price
                      ? variantValue.options?.[0]?.optionValues?.[0]?.price.toFixed(
                          2
                        )
                      : "0.00"}
                    )
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.variantHeader, { color: "#fff" }]}>
                No variants available
              </Text>
            )}
          </View>
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
          <View style={styles.borderDemarcation} />
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
        </View>
      </ScrollView>
      <View style={styles.bottomNavbar}>
        <TouchableOpacity
          style={styles.addToBasketButton}
          onPress={handleAddToBasket}
        >
          <Text style={styles.addToBasketText}>Add to Basket</Text>
          <View style={styles.middleDot} />
          <Text style={styles.priceText}>₦{basketPrice.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
      {showAddOnMessage && (
        <Animated.View
          style={[
            styles.addOnMessage,
            {
              transform: [{ translateY: animation }],
            },
          ]}
        >
          <Text style={styles.addOnMessageText}>
            {selectedSizes.length === 0
              ? "Please select a size!"
              : "Please select an add-on!"}
          </Text>
        </Animated.View>
      )}
      {showAddedToBasketMessage && (
        <Animated.View
          style={[
            styles.addedToBasketMessage,
            {
              transform: [{ translateY: animation }],
            },
          ]}
        >
          <Text style={styles.addedToBasketMessageText}>Added to basket!</Text>
        </Animated.View>
      )}
      {showAddedToWishlistMessage && (
        <Animated.View
          style={[
            styles.addedToBasketMessage,
            {
              transform: [{ translateY: animation }],
            },
          ]}
        >
          <Text style={styles.addedToBasketMessageText}>
            Added to wishlist!
          </Text>
        </Animated.View>
      )}
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={false}
        customStyles={{
          wrapper: {
            backgroundColor: "transparent",
          },
          draggableIcon: {
            backgroundColor: "#000",
          },
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.7)", // Change this to your desired background color
          },
        }}
      >
        <View style={styles.bottomSheetContainer}>
          <TouchableOpacity
            style={styles.bottomSheetButton}
            onPress={() => {
              refRBSheet.current.close();
              // Handle continue shopping logic here
            }}
          >
            <Text style={styles.bottomSheetButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomSheetButton}
            onPress={() => {
              refRBSheet.current.close();
              // Navigate to the Orders screen
              navigation.navigate("Orders");
            }}
          >
            <Text style={styles.bottomSheetButtonText}>View Basket</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </LinearGradient>
  );
};

export default PharmacyProducts;

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
    color: "white",
  },
  mealHeading: {
    fontSize: 18,
    fontFamily: "Kanitb",
    textAlign: "left",
    color: "white",
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

    color: "white",
  },
  moreText: {
    fontSize: 14,
    fontFamily: "Kanit",
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 5,
    color: "white",
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
