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

type PharmacyProductsRouteProp = RouteProp<
  RootStackParamList,
  "PharmacyProducts"
>;

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

type Props = {
  route: PharmacyProductsRouteProp;
};

const PharmacyProducts: React.FC<Props> = ({ route }) => {
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
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [note, setNote] = useState("");
  const animation = useRef(new Animated.Value(-50)).current;
  const [showAddedToBasketMessage, setShowAddedToBasketMessage] =
    useState(false);
  const [showAddedToWishlistMessage, setShowAddedToWishlistMessage] =
    useState(false);
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
    (acc, size) => acc + size.price * (size.quantity || 1),
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

    const totalPrice = selectedSizes.reduce(
      (sum, size) => sum + size.price * (size.quantity || 1),
      0
    );

    const wishlistItem: WishlistItem = {
      id: item.id,
      name: item.name,
      price: totalPrice,
      image: item.images[0],
      sizes: selectedSizes,
      restaurantName: pharmacyName,
      restaurantImageUri: pharmacyImageUri,
      restaurantLocation: pharmacyLocation,
    };

    addToWishlist(wishlistItem);
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
            showsPagination={false}
            autoplayTimeout={5}
            loop={false}
            onIndexChanged={(index) => setActiveIndex(index)}
          >
            {item.images && item.images.length > 0 ? (
              item.images.map((image, index) => (
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
              ))
            ) : (
              <View style={styles.slide}>
                <Text>No images available</Text>
              </View>
            )}
          </Swiper>
          <View style={styles.paginationWrapper}> {renderPagination()}</View>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={[styles.name, { color: "#fff" }]}>{item.name}</Text>
          <View style={styles.priceContainer}>
            {item.discountPrice && item.basePrice ? (
              <>
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
                  <View style={styles.borderDemarcation} />
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
          <Text style={styles.addToBasketText}>Add to basket</Text>
          <View style={styles.middleDot} />
          <Text style={styles.priceText}>₦{basketPrice.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
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
      {showAddOnMessage && (
        <Animated.View
          style={[
            styles.addOnMessage,
            {
              transform: [{ translateY: animation }],
            },
          ]}
        >
          <Text style={styles.addOnMessageText}>Please select a size!</Text>
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
            backgroundColor: "rgba(255, 255, 255, 0.7)",
          },
        }}
      >
        <View style={styles.bottomSheetContainer}>
          <TouchableOpacity
            style={styles.bottomSheetButton}
            onPress={() => {
              refRBSheet.current?.close();
            }}
          >
            <Text style={styles.bottomSheetButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomSheetButton}
            onPress={() => {
              refRBSheet.current?.close();
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
