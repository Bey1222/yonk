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

const FoodProducts = ({ route }) => {
  const { item, restaurantName, restaurantImageUri, restaurantLocation } =
    route.params;

  console.log("Received item:", item); // Log the received item
  console.log("Received restaurantName:", restaurantName);
  console.log("Received restaurantImageUri:", restaurantImageUri);
  console.log("Received restaurantLocation:", restaurantLocation);

  // Parse the variants JSON string
  const parsedVariants =
    typeof item.variants === "string"
      ? JSON.parse(item.variants)
      : item.variants;

  // Log the product details
  console.log("Product details:", {
    name: item.name,
    description: item.description,
    productId: item._id,
    images: item.images,
    category: item.category,
    specifications: item.specifications,
    variants: JSON.stringify(parsedVariants, null, 2), // Pretty-print the variants object
    addOns: item.addOns,
    basePrice: item.basePrice,
    baseQuantity: item.baseQuantity,
  });

  // Log the variants explicitly
  console.log("Variants:", JSON.stringify(parsedVariants, null, 2));

  const { addToBasket, token } = useBasket(); // Use the BasketContext
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist(); // Use the WishlistContext
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState({});
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [note, setNote] = useState("");
  const addOnsHeight = useRef(new Animated.Value(0)).current;
  const animation = useRef(new Animated.Value(-50)).current; // Initial position off-screen
  const [showAddOnMessage, setShowAddOnMessage] = useState(false);
  const [showAddedToBasketMessage, setShowAddedToBasketMessage] =
    useState(false);
  const [showAddedToWishlistMessage, setShowAddedToWishlistMessage] =
    useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;
  const refRBSheet = useRef(); // Ref for the bottom sheet

  const addOns = [
    { name: "Add-on 1", price: 1.0 },
    { name: "Add-on 2", price: 2.0 },
    { name: "Add-on 3", price: 3.0 },
    { name: "Add-on 4", price: 4.0 },
    { name: "Add-on 5", price: 5.0 },
  ];

  useEffect(() => {
    const isItemInWishlist = wishlist.some(
      (wishlistItem) => wishlistItem.id === item._id
    );
    setIsFavorite(isItemInWishlist);
  }, [wishlist, item._id]);

  const handleAddOnPress = (addOn, size) => {
    setSelectedAddOns((prevSelected) => {
      const newSelectedAddOns = { ...prevSelected };
      if (!newSelectedAddOns[size.name]) {
        newSelectedAddOns[size.name] = [];
      }
      const index = newSelectedAddOns[size.name].findIndex(
        (a) => a.name === addOn.name
      );
      if (index === -1) {
        newSelectedAddOns[size.name].push(addOn);
      } else {
        newSelectedAddOns[size.name].splice(index, 1);
      }
      return newSelectedAddOns;
    });
  };

  const handleSizePress = (size) => {
    setSelectedSizes((prevSelected) => {
      const newSelectedSizes = [...prevSelected];
      const index = newSelectedSizes.findIndex((s) => s.name === size.name);
      if (index === -1) {
        newSelectedSizes.push({
          ...size,
          quantity: 1,
          variantId: size._id, // Ensure variantId is included
          optionId: size._id, // Ensure optionId is included
        });
      } else {
        newSelectedSizes.splice(index, 1);
      }
      Animated.timing(addOnsHeight, {
        toValue: newSelectedSizes.length > 0 ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
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
          selectedAddOns: selectedAddOns[size.name] || [],
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
    setSelectedAddOns((prevSelected) => {
      const newSelectedAddOns = { ...prevSelected };
      delete newSelectedAddOns[size.name];
      return newSelectedAddOns;
    });
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

  const basketPrice =
    selectedSizes.reduce((acc, size) => acc + size.price * size.quantity, 0) +
    Object.values(selectedAddOns).reduce(
      (acc, addOns) =>
        acc + addOns.reduce((sum, addOn) => sum + addOn.price, 0),
      0
    );

  const canAddToBasket = () => {
    return selectedSizes.length > 0;
  };

  const hideAddOnMessage = () => {
    Animated.timing(animation, {
      toValue: -50,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setShowAddOnMessage(false);
    });
  };

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

  const handleAddToBasket = async () => {
    if (selectedSizes.length === 0) {
      displaySizeMessage();
    } else {
      const basketItem = {
        id: item._id,
        name: item.name,
        price: basketPrice,
        sizes: selectedSizes,
        addOns: selectedAddOns,
        note,
        restaurant: restaurantName,
        restaurantImageUri: restaurantImageUri,
        restaurantLocation: restaurantLocation,
        image: item.images[0], // Add the image URI
      };

      // Calculate the total price based on selected sizes and add-ons
      const totalPrice = selectedSizes.reduce((sum, size) => {
        const sizePrice = size.price * size.quantity;
        const addOnsPrice = selectedAddOns[size.name]
          ? selectedAddOns[size.name].reduce(
              (addOnSum, addOn) => addOnSum + addOn.price * size.quantity,
              0
            )
          : 0;
        return sum + sizePrice + addOnsPrice;
      }, 0);

      // Ensure totalPrice is a number
      if (isNaN(totalPrice)) {
        console.error("Total price calculation resulted in NaN");
        return;
      }

      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_BASE_URL}/cart/addToCart`,
          {
            productId: item._id,
            quantity: selectedSizes.reduce(
              (acc, size) => acc + size.quantity,
              0
            ),
            selectedVariantId: selectedSizes
              .map((size) => size.variantId)
              .join(", "),
            selectedOptionId: selectedSizes
              .map((size) => size.optionId)
              .join(", "),
            selectedAddOns: Object.values(selectedAddOns)
              .flat()
              .map((addOn) => ({
                addOnId: addOn.id,
                quantity: addOn.quantity,
              })),
            price: totalPrice,
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
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error message:", error.message);
        }
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
      restaurantName: restaurantName, // Add the pharmacy name
      restaurantImageUri: restaurantImageUri, // Add the pharmacy image URI
    });

    displayAddedToWishlistMessage();
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

  const calculateDiscountPercentage = () => {
    if (item.discountPrice && item.basePrice) {
      const discount = item.basePrice - item.discountPrice;
      const percentage = (discount / item.basePrice) * 100;
      return percentage.toFixed(0);
    }
    return 0;
  };

  const renderVariants = () => {
    if (
      !parsedVariants ||
      !Array.isArray(parsedVariants.variantValues) ||
      parsedVariants.variantValues.length === 0
    ) {
      return (
        <Text style={[styles.variantHeader, { color: "#fff" }]}>
          No variants available
        </Text>
      );
    }

    return parsedVariants.variantValues.map((variantValue, vIndex) => (
      <View key={vIndex} style={styles.variantValueContainer}>
        <Text style={[styles.variantValue, { color: "#fff" }]}>
          {variantValue.value}
        </Text>
        {variantValue.options &&
        Array.isArray(variantValue.options) &&
        variantValue.options.length > 0 ? (
          variantValue.options.map((option, oIndex) => (
            <View key={oIndex} style={styles.optionContainer}>
              <Text style={[styles.optionName, { color: "#fff" }]}>
                {option.optionName}
              </Text>
              {option.optionValues &&
              Array.isArray(option.optionValues) &&
              option.optionValues.length > 0 ? (
                option.optionValues.map((optionValue, ovIndex) => (
                  <View key={ovIndex} style={styles.optionValueContainer}>
                    <Text style={[styles.optionValue, { color: "#fff" }]}>
                      {optionValue.value} - ₦
                      {optionValue.price
                        ? optionValue.price.toFixed(2)
                        : "0.00"}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.variantPrice, { color: "#fff" }]}>
                  ₦{variantValue.price ? variantValue.price.toFixed(2) : "0.00"}
                </Text>
              )}
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
    if (!Array.isArray(selectedSizes) || selectedSizes.length === 0) {
      return null;
    }

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
      colors={["#737373", "rgba(255, 218, 185, .9)", "#d16847"]}
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
            {showFullDescription
              ? item.description || "No description available."
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
          <View style={styles.sizesContainer}>
            {parsedVariants && parsedVariants.variantValues.length > 0 ? (
              parsedVariants.variantValues.map((variantValue, vIndex) => (
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
                      price: variantValue.price || 0, // Access the price directly if it exists
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
                    {variantValue.price
                      ? variantValue.price.toFixed(2)
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
          <Animated.View
            style={[
              styles.addOnsContainer,
              {
                height: addOnsHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, addOns.length * 50], // Adjust the height based on the number of add-ons
                }),
              },
            ]}
          >
            {selectedSizes.length > 0 && (
              <>
                <Text style={[styles.addOnsHeader, { color: "#fff" }]}>
                  Add-ons (select multiple)
                </Text>
                <ScrollView>
                  {addOns.map((addOn) => (
                    <TouchableOpacity
                      key={addOn.name}
                      style={styles.addOnRow}
                      onPress={() =>
                        handleAddOnPress(
                          addOn,
                          selectedSizes[selectedSizes.length - 1]
                        )
                      }
                    >
                      <Text style={[styles.addOnText, { color: "#fff" }]}>
                        {addOn.name} (₦
                        {addOn.price ? addOn.price.toFixed(2) : "0.00"})
                      </Text>
                      <View
                        style={[
                          styles.addOnBullet,
                          {
                            backgroundColor: selectedAddOns[
                              selectedSizes[selectedSizes.length - 1].name
                            ]?.includes(addOn)
                              ? "green"
                              : "#ccc",
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </Animated.View>
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
              renderSelectedVariants()
            )}
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomNavbar}>
        <TouchableOpacity
          style={styles.addToBasketButton}
          onPress={handleAddToBasket}
        >
          <Text style={styles.addToBasketText}>Add to basket</Text>
          <View style={styles.middleDot} />
          <Text style={styles.priceText}>
            ₦{basketPrice ? basketPrice.toFixed(2) : "0.00"}
          </Text>
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

export default FoodProducts;

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
