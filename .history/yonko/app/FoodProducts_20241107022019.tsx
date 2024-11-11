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

  console.log("Received item:", item);
  console.log("Received restaurantName:", restaurantName);
  console.log("Received restaurantImageUri:", restaurantImageUri);
  console.log("Received restaurantLocation:", restaurantLocation);

  // Log the product details
  console.log("Product details:", {
    name: item.name,
    description: item.description,
    productId: item._id,
    images: item.images,
    category: item.category,
    specifications: item.specifications,
    variants: item.variants,
    addOns: item.addOns,
    basePrice: item.basePrice,
    baseQuantity: item.baseQuantity,
  });

  // Log the variants explicitly
  console.log("Variants:", JSON.stringify(item.variants, null, 2));

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
        newSelectedSizes.push({ ...size, quantity: 1 });
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
            selectedAddOns: Object.values(selectedAddOns).flat(),
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
      price: totalPrice, // Use the calculated total pric


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
