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

interface Pharmacy {
  id: number;
  name: string;
  category: string;
  location: string;
  state: string;
  routeCategory: string;
  deliveryTime: string;
  about: string;
  rating: number;
  image: string;
  parentObj: {
    routeCategory: string;
    id: number;
  };
  menu: {
    image: string;
    imageGallery: string[];
    name: string;
    description: string;
    fullDescription: string;
    brand: string;
    price: number;
    discountPrice: number;
    discount: boolean;
    isNew: boolean;
    id: number;
    parentObj: {
      routeCategory: string;
      id: number;
    };
  }[];
}

const MainstorePharmacy: React.FC<{
  route: { params: { pharmacy: Pharmacy } };
}> = ({ route }) => {
  const { pharmacy } = route.params;
  const navigation = useNavigation();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredMenu, setFilteredMenu] = useState(pharmacy.menu);

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

  const handleMenuItemPress = (item: any) => {
    navigation.navigate("PharmacyProducts", {
      item,
      pharmacyName: pharmacy.name,
      pharmacyImageUri: pharmacy.image,
      pharmacyLocation: pharmacy.location, // Include the location here
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const shortDescription = pharmacy.about
    ? pharmacy.about.split(" ").slice(0, 30).join(" ") + "..."
    : "No description available.";

  const handleSearchChange = (text: string) => {
    setSearchKeyword(text);
    const filtered = pharmacy.menu.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredMenu(filtered);
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Log the received parameters
  useEffect(() => {
    console.log("MainstorePharmacy received params:", route.params);
  }, [route.params]);

  return (
    <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
      <LinearGradient
        colors={["#737373", "rgba(255,46,65,.7)", "#737373"]}
        locations={[1, 0.2, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0, y: 0.7 }}
        style={styles.container}
      >
        <View style={styles.container}>
          <Animated.Image
            source={{ uri: pharmacy.shop.avatar }}
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
            <MaterialCommunityIcons name="pill" size={24} color="black" />
            <Text style={styles.deliveryTime}>
              {pharmacy.shop.deliveryTime}
            </Text>
          </View>

          <View style={styles.ratingContainer}>
            <Image source={starIcon} style={styles.starIcon} />
            <Text style={styles.ratingText}>{pharmacy.shop.rating}</Text>
          </View>
          <View style={styles.locationContainer}>
            <Image source={locationIcon} style={styles.locationIcon} />
            <Text style={styles.location}>
              {pharmacy.shop.address.street}, {pharmacy.shop.address.city},{" "}
              {pharmacy.shop.address.state}, {pharmacy.shop.address.country}
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
              colors={["#737373", "rgba(255,46,65,.9)", "#737373"]}
              locations={[1, 0.2, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0, y: 0.7 }}
              style={styles.cont}
            >
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{pharmacy.shop.name}</Text>
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
                        ? pharmacy.shop.about
                        : shortDescription}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                    >
                      <Text style={styles.moreText}>
                        {showFullDescription ? "less..." : "See More..."}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.menuHeadingContainer}>
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search store items"
                      value={searchKeyword}
                      onChangeText={handleSearchChange}
                    />
                  </View>
                </View>
                <View style={styles.listContainer}>
                  {filteredMenu && filteredMenu.length > 0 ? (
                    filteredMenu.map((item, index) => (
                      <TouchableOpacity
                        key={item.id} // Ensure each item has a unique id
                        style={styles.menuItem}
                        onPress={() => handleMenuItemPress(item)}
                      >
                        <View style={styles.cardopa}>
                          <Image
                            source={{ uri: item.image }}
                            style={styles.menuImage}
                          />
                        </View>
                        {item.discount && (
                          <View style={styles.iconContainer}>
                            <Text style={styles.discountPercentText}>
                              -
                              {calculateDiscountPercent(
                                item.price,
                                item.discountPrice
                              )}
                              %
                            </Text>
                          </View>
                        )}
                        <View style={styles.cardin}>
                          <Text style={styles.menuName}>
                            {abbreviateName(item.name)}
                          </Text>
                          <View style={styles.priceContainer}>
                            {item.discount ? (
                              <>
                                <Text style={styles.discountPrice}>
                                  ₦{item.discountPrice}
                                </Text>
                              </>
                            ) : (
                              <Text style={styles.discountPrice}>
                                ₦{item.price}
                              </Text>
                            )}
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

export default MainstorePharmacy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 10,
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  navbar: {
    paddingVertical: 0,
  },
  curve: {
    flexDirection: "row",
    padding: 5,
  },
  categoryContainer: {
    marginHorizontal: 10,
    alignItems: "center",
  },
  activeCategoryContainer: {
    borderColor: "#000",
    borderRadius: 10,
    padding: 10,
  },
  categoryImage: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  categoryLabel: {
    marginTop: 5,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Kanit",
  },
  activeCategoryLabel: {},
  contentContainer: {
    flex: 1,
    marginBottom: 30,
  },
  sectionContainer: {
    marginVertical: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  sectionText: {
    fontSize: 20,
    fontFamily: "Kanitb",
  },
  arrowContainer: {
    padding: 5,
  },
  arrowText: {
    fontSize: 20,
  },
  sectionScrollView: {
    marginVertical: 10,
  },
  sectionItem: {
    marginHorizontal: 10,
    alignItems: "center",
    paddingVertical: 5,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  sectionImage: {
    width: 220,
    height: 180,
    borderRadius: 10,
  },

  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 10,
  },

  sectionItemText: {
    marginTop: 5,
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Kanitb",
  },
  infoContainer: {
    flexDirection: "row",
    columnGap: 5,
    alignItems: "center",
    marginTop: 5,
  },
  deliveryTimeText: {
    fontSize: 14,
    textAlign: "right",
    fontFamily: "Kanit",
  },
  ratingContainer: {
    position: "absolute",
    top: 5,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, .3)",

    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Kanit",
    color: "#fff",
  },
  starIcon: {
    width: 15,
    height: 15,
    marginRight: 0,
  },
  bicycleIcon: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
  },
  discountContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "red",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  discountIcon: {
    width: 15,
    height: 15,
    marginRight: 5,
    objectFit: "cover",
  },

  discountSection: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 10,
  },
  discountItem: {
    width: "100%",
    marginVertical: 10,
    alignItems: "center",
  },
  discountImage: {
    width: "100%",
    height: 170,
  },
  discountInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 5,
  },
  priceTextContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  discountPriceText: {
    fontSize: 25,
    textAlign: "center",
    fontFamily: "Kanitb",
    color: "green",
  },
  originalPriceText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Kanit",
    color: "red",
    textDecorationLine: "line-through",
  },
  heartIconContainer: {
    padding: 5,
  },
  heartIcon: {
    width: 25,
    height: 25,
  },
  bestSellersSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,

    paddingHorizontal: 10,
  },
  bestSellerItem: {
    width: "48%",
    borderRadius: 5,
    marginVertical: 5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  bestSellerImage: {
    width: 170,
    height: 190,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageOva: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 170,
    height: 190,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 10,
  },
  bestSellerText: {
    fontSize: 20,
    textAlign: "center",
    fontFamily: "Kanitb",
    position: "absolute",
    bottom: 10,
  },
  newContainer: {
    position: "absolute",
    top: -12,
    left: -17,
    backgroundColor: "transparent",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newIcon: {
    width: 60,
    height: 60,
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
    paddingBottom: 50,
  },
  card: {
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
  image: {
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
  name: {
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
  originalPrice: {
    fontSize: 13,
    color: "rgba(255, 255, 255, .6)",
    textDecorationLine: "line-through",
    fontFamily: "Kanit",
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
  icon: {
    backgroundColor: "#d96540",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    padding: 5,
    borderRadius: 100,
    zIndex: 5,
  },
  closedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  closedText: {
    fontSize: 24,
    fontFamily: "Kanitb",
    color: "#fff",
  },
});
