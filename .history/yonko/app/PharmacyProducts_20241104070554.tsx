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
import { useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Swiper from "react-native-swiper";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useBasket } from "../context/BasketContext";
import { useWishlist } from "../context/WishlishContext";
import { LinearGradient } from "expo-linear-gradient";
import logo from "../assets/logo.png";
import RBSheet from "react-native-raw-bottom-sheet";

const { width, height } = Dimensions.get("window");

type RootStackParamList = {
  PharmacyProducts: {
    item: any;
    pharmacyName: string;
    pharmacyImageUri: string;
    pharmacyLocation: string;
  };
};

type PharmacyProductsRouteProp = RouteProp<RootStackParamList, 'PharmacyProducts'>;
type PharmacyProductsNavigationProp = StackNavigationProp<RootStackParamList, 'PharmacyProducts'>;

type Props = {
  route: PharmacyProductsRouteProp;
  navigation: PharmacyProductsNavigationProp;
};

type Size = {
  name: string;
  price: number;
  quantity?: number;
};

type BasketItem = {
  id: string;
  name: string;
  price: number;
  sizes: Size[];
  note: string;
  restaurant: string;
  restaurantImageUri: string;
  restaurantLocation: string;
};

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  sizes: Size[];
  restaurantName: string;
  restaurantImageUri: string;
  restaurantLocation: string;
};

const PharmacyProducts: React.FC<Props> = ({ route, navigation }) => {
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

  const { addToBasket } = useBasket();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [note, setNote] = useState("");
  const animation = useRef(new Animated.Value(-50)).current;
  const [showAddedToBasketMessage, setShowAddedToBasketMessage] = useState(false);
  const [showAddedToWishlistMessage, setShowAddedToWishlistMessage] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddOnMessage, setShowAddOnMessage] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;
  const refRBSheet = useRef<RBSheet>(null);

  const sizes: Size[] = [
    { name: "Small", price: 10.0 },
    { name: "Medium", price: 15.0 },
    { name: "Large", price: 20.0 },
  ];

  useEffect(() => {
    if (item && item.id) {
      const isItemInWishlist = wishlist.some(
        (wishlistItem) => wishlistItem.id === item.id
      );
      setIsFavorite(isItemInWishlist);
    }
  }, [wishlist, item]);

  const handleSizePress = (size: Size) => {
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

  const handleQuantityChange = (type: "increase" | "decrease", size: Size) => {
    setSelectedSizes((prevSelected) =>
      prevSelected.map((s) =>
        s.name === size.name
          ? {
              ...s,
              quantity:
                type === "increase"
                  ? s.quantity! + 1
                  : Math.max(s.quantity! - 1, 1),
            }
          : s
      )
    );
  };

  const handleDeleteSize = (size: Size) => {
    setSelectedSizes((prevSelected) =>
      prevSelected.filter((s) => s.name !== size.name)
    );
  };

  const renderPagination = () => {
    if (!item.images || item.images.length === 0) {
      return null;
    }

    return (
      <View style={styles.paginationContainer}>
        {item.images.map((_, i) => {
          const isActive = i === activeIndex;
          const dotColor = isActive ? "#d96540" : "#fff";
          const dotSize = isActive ? 28 : 8;
          const dotSizeHeight = isActive ? 10 : 8;
          const dotBorderRadius = isActive ? 5 : 4;

          return (
            <View
              key={i}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: dotColor,
                  width: dotSize,
                  height: dotSizeHeight,
                  borderRadius: dotBorderRadius,
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
    (acc, size) => acc + size.price * (size.quantity || 0),
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
      const basketItem: BasketItem = {
        id: item.id,
        name: item.name,
        price: basketPrice,
        sizes: selectedSizes,
        note,
        restaurant: pharmacyName,
        restaurantImageUri: pharmacyImageUri,
        restaurantLocation: pharmacyLocation,
      };
      addToBasket(basketItem);
      displayAddedToBasketMessage();
      refRBSheet.current?.open();
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleFavoritePress = () => {
    if (selectedSizes.length === 0) {
      displaySizeMessage();
      retur


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swiperContainer: {
    height: height * 0.4,
  },
  swiper: {
    height: height * 0.4,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width,
    height: height * 0.4,
    resizeMode: "cover",
  },
  iconContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 10,
  },
  paginationWrapper: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    marginHorizontal: 5,
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  discountPrice: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: "line-through",
    color: "gray",
  },
  discountPercentageContainer: {
    backgroundColor: "red",
    paddingHorizontal: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  discountPercentage: {
    color: "white",
    fontSize: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
  },
  moreText: {
    color: "blue",
    fontSize: 16,
  },
  borderDemarcation: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 10,
  },
  addOnsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sizesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sizeButton: {
    backgroundColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    margin: 5,
  },
  sizeText: {
    fontSize: 16,
  },
  noteContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  noteInput: {
    fontSize: 16,
  },
  summaryHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryContainer: {
    marginVertical: 10,
  },
  emptySummaryContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  emptySummaryImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  emptySummaryText: {
    fontSize: 16,
    color: "gray",
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  deleteIcon: {
    marginRight: 10,
  },
  summaryHeaderContainer: {
    flex: 1,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  quantityButton: {
    backgroundColor: "#ccc",
    borderRadius: 5,
    padding: 5,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  bottomNavbar: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  addToBasketButton: {
    backgroundColor: "#d96540",
    padding: 15,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addToBasketText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  middleDot: {
    width: 5,
    height: 5,
    backgroundColor: "#fff",
    borderRadius: 2.5,
  },
  priceText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  addedToBasketMessage: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addedToBasketMessageText: {
    color: "#fff",
    fontSize: 16,
  },
  addOnMessage: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addOnMessageText: {
    color: "#fff",
    fontSize: 16,
  },
  bottomSheetContainer: {
    padding: 20,
  },
  bottomSheetButton: {
    backgroundColor: "#d96540",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: "center",
  },
  bottomSheetButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PharmacyProducts;
