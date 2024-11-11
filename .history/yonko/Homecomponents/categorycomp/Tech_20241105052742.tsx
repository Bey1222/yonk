import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "react-native-vector-icons";
import { useNavigation } from "@react-navigation/native";
import SwiperComponent from "../SwiperComponent";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SearchSwiper from "@/Searchcomponents/SearchSwiper";
import newimage from "../../assets/new.png";
import starIcon from "../../assets/star.png";

const Tech = () => {
  const navigation = useNavigation();
  const [categoryData, setCategoryData] = useState([]);
  const [storeData, setStoreData] = useState({});
  const [sectionData, setSectionData] = useState({});

  const sectionNames = [
    "Latest Gadgets",
    "Discounts",
    "Best Sellers",
    "New Arrivals",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/products?category=TECH`,
          {
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN}`,
            },
          }
        );
        if (!response.ok) {
          console.error(
            "Category data fetch failed with status:",
            response.status
          );
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Fetched category data:", data);
        if (data && data.products) {
          setCategoryData(data.products);
        } else {
          console.error("Invalid category data format:", data);
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };

    fetchData();
  }, []);

  const fetchStoreById = async (shopId) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/shops/${shopId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN}`,
          },
        }
      );
      if (!response.ok) {
        console.error("Store data fetch failed with status:", response.status);
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched store data for shopId:", shopId, data);
      if (data && data.shop) {
        setStoreData((prevStoreData) => ({
          ...prevStoreData,
          [shopId]: data.shop,
        }));

        const productsResponse = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/products?shopId=${shopId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN}`,
            },
          }
        );
        if (!productsResponse.ok) {
          console.error(
            "Products data fetch failed with status:",
            productsResponse.status
          );
          throw new Error("Network response was not ok");
        }
        const productsData = await productsResponse.json();
        console.log("Fetched products data for shopId:", shopId, productsData);
        if (productsData && productsData.products) {
          setStoreData((prevStoreData) => ({
            ...prevStoreData,
            [shopId]: {
              ...data.shop,
              products: productsData.products,
            },
          }));
        } else {
          console.error("Invalid products data format:", productsData);
        }
      } else {
        console.error("Invalid store data format:", data);
      }
    } catch (error) {
      console.error("Error fetching store data for shopId:", shopId, error);
    }
  };

  useEffect(() => {
    if (categoryData.length > 0) {
      categoryData.forEach((product) => {
        if (!storeData[product.shopId]) {
          fetchStoreById(product.shopId);
        }
      });
    }
  }, [categoryData]);

  useEffect(() => {
    if (categoryData && Object.keys(storeData).length > 0) {
      const sections = sectionNames;
      const data = {};
      sections.forEach((section, index) => {
        if (section === "Latest Gadgets") {
          data[section] = shuffleArray(Object.values(storeData)).slice(0, 5);
        } else if (section === "Discounts") {
          data[section] = shuffleArray(categoryData).slice(0, 6);
        } else if (section === "Best Sellers") {
          data[section] = bestSellers;
        } else if (section === "New Arrivals") {
          data[section] = shuffleArray(categoryData).slice(0, 5);
        } else {
          data[section] = shuffleArray(categoryData).slice(
            index * 5,
            (index + 1) * 5
          );
        }
      });
      setSectionData(data);
    }
  }, [categoryData, storeData]);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const abbreviateName = (name, maxLength = 17) => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + "...";
    }
    return name;
  };

  const bestSellers = [
    { name: "Smartphones", image: require("../../assets/all11.jpg") },
    { name: "Laptops", image: require("../../assets/laptop.jpg") },
    { name: "Smart Home", image: require("../../assets/all6.jpg") },
    { name: "Gaming", image: require("../../assets/all10.jpg") },
  ];

  const navigateToBrandScreen = (brand) => {
    const brandItems = categoryData.flatMap((item) =>
      item.menu
        .filter((menuItem) => menuItem.brand === brand)
        .map((menuItem) => ({
          ...menuItem,
          techName: item.name,
          techImageUri: item.image,
          techLocation: item.location,
        }))
    );

    if (brand === "Smartphones") {
      navigation.navigate("SmartphonesScreen", { items: brandItems });
    } else if (brand === "Laptops") {
      navigation.navigate("LaptopsScreen", { items: brandItems });
    } else if (brand === "Smart Home") {
      navigation.navigate("SmartHomeScreen", { items: brandItems });
    } else if (brand === "Gaming") {
      navigation.navigate("GamingScreen", { items: brandItems });
    }
  };

  const handleNavigation = (item, screenName) => {
    const shopId =
      item.shopId ||
      (item.products && item.products.length > 0
        ? item.products[0].shopId
        : undefined);

    if (!shopId) {
      console.error("shopId is undefined for item:", item);
      return;
    }

    const store = storeData[shopId];

    if (!store) {
      console.error("Store not found for shopId:", shopId);
      return;
    }

    const tech = {
      shop: store,
      products: store.products || [],
      parentObj: {
        routeCategory: item.routeCategory,
        id: item.id,
      },
    };

    navigation.navigate(screenName, {
      tech,
      techName: store.name,
      techImageUri: store.avatar,
      techLocation: `${store.address.street}, ${store.address.city}, ${store.address.state}, ${store.address.country}`,
    });
  };

  const handleNavigationTechProducts = (item, screenName) => {
    const store = storeData[item.shopId];

    if (!store) {
      console.error("Store not found for shopId:", item.shopId);
      return;
    }

    if (screenName === "TechProducts") {
      console.log("Navigating to TechProducts with item:", item);
      navigation.navigate(screenName, {
        item,
        techName: store.name,
        techImageUri: store.avatar,
        techLocation: `${store.address.street}, ${store.address.city}, ${store.address.state}, ${store.address.country}`,
      });
    }
  };

  return (
    <LinearGradient
      colors={["#737373", "rgba(12,54,114,.5)", "#737373"]}
      locations={[1, 0.2, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.7 }}
      style={styles.container}
    >
      <ScrollView style={styles.contentContainer}>
        {sectionNames.map((section, index) => (
          <View
            key={index}
            style={[
              styles.sectionContainer,
              {
                borderRadius: 10,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionText, { color: "#fff" }]}>
                {section}
              </Text>
              {section !== "Best Sellers" && (
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => {
                    if (section === "Latest Gadgets") {
                      navigation.navigate("LatestGadgets", {
                        latestGadgets: Object.values(storeData),
                      });
                    } else if (section === "Discounts") {
                      navigation.navigate("DiscountTech", {
                        discountItems: categoryData,
                      });
                    } else if (section === "New Arrivals") {
                      navigation.navigate("NewArrivalsTech", {
                        newItems: categoryData,
                      });
                    }
                  }}
                >
                  <AntDesign name="right" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            {section === "Discounts" ? (
              <View style={styles.listContainer}>
                {sectionData[section]?.map((item, idx) => {
                  const store = storeData[item.shopId];
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.card}
                      onPress={() =>
                        handleNavigationTechProducts(item, "TechProducts")
                      }
                    >
                      <View style={styles.cardopa}>
                        <Image
                          source={{ uri: item.images[0] }}
                          style={styles.image}
                        />
                      </View>
                      <View style={styles.cardin}>
                        <Text style={styles.name}>
                          {abbreviateName(item.name)}
                        </Text>

                        <View style={styles.priceContainer}>
                          <Text style={styles.discountPrice}>
                            ₦{item.basePrice}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : section === "Best Sellers" ? (
              <View style={[styles.bestSellersSection]}>
                {bestSellers.map((item, idx) => {
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.bestSellerItem]}
                      onPress={() => navigateToBrandScreen(item.name)}
                    >
                      <View style={styles.imageContainer}>
                        <Image
                          source={item.image}
                          style={styles.bestSellerImage}
                          resizeMode="cover"
                        />
                        <View style={styles.imageOva} />
                      </View>
                      <Text style={[styles.bestSellerText, { color: "#fff" }]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : section === "New Arrivals" ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.sectionScrollView}
              >
                {sectionData[section]?.map((item, idx) => {
                  const store = storeData[item.shopId];
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.sectionItem}
                      onPress={() =>
                        handleNavigationTechProducts(item, "TechProducts")
                      }
                    >
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: item.images[0] }}
                          style={styles.sectionImage}
                        />
                        <View style={styles.newContainer}>
                          <Image source={newimage} style={styles.newIcon} />
                        </View>
                      </View>
                      <Text style={[styles.sectionItemText, { color: "#fff" }]}>
                        {abbreviateName(item.name, 20)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.sectionScrollView}
              >
                {sectionData[section]?.map((store, idx) => {
                  const products = categoryData.filter(
                    (product) => product.shopId === store.id
                  );
                  console.log(
                    "Latest Gadgets item:",
                    store,
                    "Products:",
                    products
                  );
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.sectionItem}
                      onPress={() => handleNavigation(store, "MainstoreTech")}
                    >
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: store.avatar }}
                          style={styles.sectionImage}
                        />
                        <View style={styles.imageOverlay} />
                        {idx === 0 && (
                          <View style={styles.ratingContainer}>
                            <Image source={starIcon} style={styles.starIcon} />
                            <Text style={styles.ratingText}>
                              {store.rating}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View
                        style={{
                          position: "absolute",
                          top: 5,
                          left: 4,
                          flexDirection: "row",
                        }}
                      >
                        {idx === 0 && (
                          <View style={styles.infoContainer}>
                            <FontAwesome6 name="clock" size={13} color="#fff" />
                            <Text
                              style={[
                                styles.deliveryTimeText,
                                { color: "#fff" },
                              ]}
                            >
                              {store.deliveryTime}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View
                        style={{
                          position: "absolute",
                          bottom: 5,
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={[styles.sectionItemText, { color: "#fff" }]}
                        >
                          {abbreviateName(store.name, 20)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        ))}

        <SearchSwiper />
      </ScrollView>
    </LinearGradient>
  );
};

export default Tech;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 50,
    marginTop: 10,
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
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
});
