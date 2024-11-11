import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import speechBubbleImage from "../assets/speechbubble.jpg";
import starIcon from "../assets/star.png";
import locationIcon from "../assets/location.png";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

interface Restaurant {
  shop: {
    id: string;
    name: string;
    email: string;
    phone: string;
    description: string;
    avatar: string;
    subscription: string;
    category: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
    };
  };
}

interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  basePrice: number;
  baseQuantity: number;
  variants: {
    variantName: string;
    variantValues: {
      value: string;
      options: {
        optionName: string;
        optionValues: {
          value: string;
          price: number;
          quantity: number;
        }[];
      }[];
    }[];
  }[];
  addOns: {
    name: string;
    price: number;
    maxQuantityAllowed: number;
  }[];
  specifications: {
    Material: string;
    Fit: string;
    Wash: string;
  };
  status: string;
  category: string;
  shopId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const MainstoreFood: React.FC<{
  route: { params: { restaurant: Restaurant } };
}> = ({ route }) => {
  const { restaurant } = route.params;
  const { shop } = restaurant;
  console.log("Received shop data:", shop); // Log the shop object
  const navigation = useNavigation();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollOffset = useRef(new Animated.Value(0)).current;

  const imageAnimatedStyle = {
    transform: [
      {
        translateY: scrollOffset.interpolate({
          inputRange: [-height * 0.4, 0, height * 0.4],
          outputRange: [-height * 0.2, 0, height * 0.2],
        }),
      },
      {
        scale: scrollOffset.interpolate({
          inputRange: [-height * 0.4, 0, height * 0.4],
          outputRange: [2, 1, 1],
        }),
      },
    ],
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products based on category and shopId
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/products?category=${shop.category}&shopId=${shop.id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN}`,
            },
          }
        );
        if (!response.ok) {
          console.error("Products fetch failed with status:", response.status);
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Fetched products data:", data); // Log the fetched data
        if (data && data.products) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        } else {
          console.error("Invalid products data format:", data);
        }
      } catch (error) {
        console.error("Error fetching products data:", error); // Log any errors
      }
    };

    fetchProducts();
  }, [shop.id, shop.category]);

  const handleMenuItemPress = (item: Product) => {
    navigation.navigate("FoodProducts", {
      item,
      restaurantName: shop.name,
      restaurantImageUri: shop.avatar,
      restaurantLocation: `${shop.address.street}, ${shop.address.city}, ${shop.address.state}, ${shop.address.country}`, // Include the location here
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const shortDescription = shop.description
    ? shop.description.split(" ").slice(0, 30).join(" ") + "..."
    : "No description available.";

  const handleSearchChange = (text: string) => {
    setSearchKeyword(text);
    const filtered = products.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    console.log("Filtered products after search:", filtered); // Log filtered products after search
    setFilteredProducts(filtered);
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
      <LinearGradient
        colors={["#737373", "rgba(255, 218, 185, .9)", "#d16847"]}
        locations={[1, 0.29, 0.5]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0, y: 0.75 }}
        style={styles.container}
      >
        <View style={styles.container}>
          <Animated.Image
            source={{ uri: shop.avatar }}
            style={[styles.image, imageAnimatedStyle]}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          <Animated.View style={[styles.header]}>
            <TouchableOpacity onPress={handleBackPress}>
              <Ionicons
                name="chevron-back"
                size={24}
                color="white"
                style={styles.backIcon}
              />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.deliveryTimeContainer}>
            <MaterialCommunityIcons
              name="food-takeout-box"
              size={24}
              color="black"
            />
            <Text style={styles.deliveryTime}>{shop.deliveryTime}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <Image source={starIcon} style={styles.starIcon} />
            <Text style={styles.ratingText}>{shop.rating}</Text>
          </View>
          <View style={styles.locationContainer}>
            <Image source={locationIcon} style={styles.locationIcon} />
            <Text style={styles.location}>
              {shop.address.street}, {shop.address.city}, {shop.address.state},{" "}
              {shop.address.country}
            </Text>
          </View>

          <Animated.ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContentContainer}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false} // Remove the scrollbar
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollOffset } } }],
              { useNativeDriver: false }
            )}
          >
            <View style={{ height: height * 0.4 }} />

            <LinearGradient
              colors={["#737373", "rgba(255, 218, 185, .9)", "#d16847"]}
              locations={[1, 0.29, 0.5]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0, y: 0.75 }}
              style={styles.cont}
            >
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{shop.name}</Text>
                <TouchableOpacity>
                  <Image
                    source={speechBubbleImage}
                    style={styles.speechBubble}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.backgroundContainer}>
                <View style={styles.aboutCard}>
                  <View style={styles.aboutCardContent}>
                    <Text style={styles.about}>
                      {showFullDescription
                        ? shop.description
                        : shortDescription}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                    >
                      <Text style={styles.moreText}>
                        {showFullDescription ? "Show less..." : "Show More..."}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.menuHeadingContainer}>
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search menu items"
                      value={searchKeyword}
                      onChangeText={handleSearchChange}
                    />
                  </View>
                </View>
                <View style={styles.listContainer}>
                  {filteredProducts && filteredProducts.length > 0 ? (
                    filteredProducts.map((item, index) => (
                      <TouchableOpacity
                        key={item._id} // Ensure each item has a unique id
                        style={styles.menuItem}
                        onPress={() => handleMenuItemPress(item)}
                      >
                        <View style={styles.cardopa}>
                          <Image
                            source={{ uri: item.images[0] }}
                            style={styles.menuImage}
                          />
                        </View>
                        <View style={styles.cardin}>
                          <Text style={styles.menuName}>
                            {abbreviateName(item.name)}
                          </Text>
                          <View style={styles.priceContainer}>
                            <Text style={styles.discountPrice}>
                              ₦{item.basePrice}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.menuName}>
                      No menu items available.
                    </Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          </Animated.ScrollView>
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const calculateDiscountPercent = (
  originalPrice: number,
  discountPrice: number
) => {
  const discountAmount = originalPrice - discountPrice;
  const discountPercent = (discountAmount / originalPrice) * 100;
  return discountPercent.toFixed(0);
};

const abbreviateName = (name: string, maxLength = 17) => {
  if (name.length > maxLength) {
    return name.slice(0, maxLength) + "...";
  }
  return name;
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