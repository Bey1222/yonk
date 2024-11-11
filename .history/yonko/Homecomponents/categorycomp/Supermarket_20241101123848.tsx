import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "react-native-vector-icons";
import { useNavigation } from "@react-navigation/native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SearchSwiper from "@/Searchcomponents/SearchSwiper";
import starIcon from "../../assets/star.png";
import newimage from "../../assets/new.png";

const Supermarket = () => {
  const navigation = useNavigation();
  const [categoryData, setCategoryData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [sectionData, setSectionData] = useState({});

  const sectionNames = [
    "Best Groceries",
    "Discounts",
    "Best Sellers",
    "New Arrivals",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/products?category=GROCERIES`,
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
        console.log("Fetched category data:", data); // Log the fetched data
        if (data && data.products) {
          setCategoryData(data.products);
        } else {
          console.error("Invalid category data format:", data);
        }
      } catch (error) {
        console.error("Error fetching category data:", error); // Log any errors
      }
    };

    const fetchStores = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/products/shopProducts?status=PUBLISHED`,
          {
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN}`,
            },
          }
        );
        if (!response.ok) {
          console.error(
            "Store data fetch failed with status:",
            response.status
          );
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Fetched store data:", data); // Log the fetched data
        if (data && data.products) {
          setStoreData(data.products);
        } else {
          console.error("Invalid store data format:", data);
        }
      } catch (error) {
        console.error("Error fetching store data:", error); // Log any errors
      }
    };

    fetchData();
    fetchStores();
  }, []);

  useEffect(() => {
    if (categoryData && storeData) {
      const sections = sectionNames;
      const data = {};
      sections.forEach((section, index) => {
        if (section === "Discounts") {
          const discountItems = fetchDiscountItems();
          data[section] = shuffleArray(discountItems).slice(0, 6);
        } else if (section === "Best Sellers") {
          data[section] = bestSellers;
        } else if (section === "New Arrivals") {
          const newItems = fetchNewItems();
          data[section] = shuffleArray(newItems).slice(0, 5);
        } else if (section === "Best Groceries") {
          // Ensure isOpen is set correctly for Best Groceries
          data[section] = shuffleArray(storeData)
            .slice(index * 5, (index + 1) * 5)
            .map((item) => ({
              ...item,
              isOpen: isSupermarketOpen(item),
            }));
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

  const fetchDiscountItems = () => {
    const discountItems = [];
    categoryData.forEach((item) => {
      if (item.menu) {
        item.menu.forEach((menuItem) => {
          if (menuItem.discount) {
            discountItems.push({
              ...menuItem,
              supermarketName: item.name,
              supermarketImageUri: item.image,
              supermarketLocation: item.location,
              discountPercent: calculateDiscountPercent(
                menuItem.price,
                menuItem.discountPrice
              ),
              isOpen: isSupermarketOpen(item),
              openingTime: item["Opening Time"],
              closingTime: item["Closing Time"],
            });
          }
        });
      }
    });
    return discountItems;
  };

  const fetchNewItems = () => {
    const newItems = [];
    categoryData.forEach((item) => {
      if (item.menu) {
        item.menu.forEach((menuItem) => {
          if (menuItem.isNew) {
            newItems.push({
              ...menuItem,
              supermarketName: item.name,
              supermarketImageUri: item.image,
              supermarketLocation: item.location,
              isOpen: isSupermarketOpen(item),
              openingTime: item["Opening Time"],
              closingTime: item["Closing Time"],
            });
          }
        });
      }
    });
    return newItems;
  };

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
    { name: "Fresh Produce", image: require("../../assets/all8.jpg") },
    { name: "Dairy & Eggs", image: require("../../assets/all20.jpg") },
    { name: "Meat & Seafood", image: require("../../assets/all19.jpg") },
    { name: "Bakery", image: require("../../assets/all23.jpg") },
  ];

  const calculateDiscountPercent = (originalPrice, discountPrice) => {
    const discountAmount = originalPrice - discountPrice;
    const discountPercent = (discountAmount / originalPrice) * 100;
    return discountPercent.toFixed(0);
  };

  const navigateToBrandScreen = (brand) => {
    const brandItems = categoryData.flatMap((item) =>
      item.menu
        .filter((menuItem) => menuItem.brand === brand)
        .map((menuItem) => ({
          ...menuItem,
          supermarketName: item.name,
          supermarketImageUri: item.image,
          supermarketLocation: item.location,
          openingTime: item["Opening Time"],
          closingTime: item["Closing Time"],
        }))
    );

    if (brand === "Fresh Produce") {
      navigation.navigate("FreshProduceScreen", { items: brandItems });
    } else if (brand === "Dairy & Eggs") {
      navigation.navigate("DairyEggsScreen", { items: brandItems });
    } else if (brand === "Meat & Seafood") {
      navigation.navigate("MeatSeafoodScreen", { items: brandItems });
    } else if (brand === "Bakery") {
      navigation.navigate("BakeryScreen", { items: brandItems });
    }
  };

  const isSupermarketOpen = (supermarket) => {
    const currentHour = new Date().getHours();
    const openingTime = parseTime(supermarket["Opening Time"]);
    const closingTime = parseTime(supermarket["Closing Time"]);

    if (closingTime < openingTime) {
      // Supermarket is open past midnight
      return currentHour >= openingTime || currentHour < closingTime;
    } else {
      return currentHour >= openingTime && currentHour < closingTime;
    }
  };

  const parseTime = (timeString) => {
    const [time, period] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours;
  };

  const sortItems = (items) => {
    if (!items) {
      console.error("Items is undefined or null");
      return [];
    }
    return items.sort((a, b) =>
      a.isOpen === b.isOpen ? 0 : a.isOpen ? -1 : 1
    );
  };

  return (
    <LinearGradient
      colors={["#737373", "rgba(52,18,9,.5)", "#737373"]}
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
                    if (section === "Best Groceries") {
                      navigation.navigate("BestGroceries", {
                        bestGroceries: storeData,
                      });
                    } else if (section === "Discounts") {
                      navigation.navigate("DiscountSupermarket", {
                        discountItems: fetchDiscountItems(),
                      });
                    } else if (section === "New Arrivals") {
                      navigation.navigate("NewarrivalsSupermarket", {
                        newItems: fetchNewItems(),
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
                {sortItems(sectionData[section]).map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.card}
                    onPress={() =>
                      navigation.navigate("SupernarketProducts", {
                        item,
                        supermarketName: item.supermarketName,
                        supermarketImageUri: item.supermarketImageUri,
                        supermarketLocation: item.supermarketLocation,
                      })
                    }
                  >
                    <View style={styles.cardopa}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.image}
                      />
                    </View>
                    <View style={styles.iconContainer}>
                      <Text style={styles.discountPercentText}>
                        -{item.discountPercent}%
                      </Text>
                    </View>
                    <View style={styles.cardin}>
                      <Text style={styles.name}>
                        {abbreviateName(item.name)}
                      </Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.originalPrice}>₦{item.price}</Text>
                        <Text style={styles.discountPrice}>
                          ₦{item.discountPrice}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : section === "Best Sellers" ? (
              <View style={[styles.bestSellersSection]}>
                {bestSellers.map((item, idx) => (
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
                ))}
              </View>
            ) : section === "New Arrivals" ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.sectionScrollView}
              >
                {sortItems(sectionData[section]).map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.sectionItem}
                    onPress={() =>
                      navigation.navigate("SupernarketProducts", {
                        item,
                        supermarketName: item.supermarketName,
                        supermarketImageUri: item.supermarketImageUri,
                        supermarketLocation: item.supermarketLocation,
                      })
                    }
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: item.image }}
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
                ))}
              </ScrollView>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.sectionScrollView}
              >
                {sortItems(sectionData[section]).map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.sectionItem}
                    onPress={() =>
                      navigation.navigate("MainstoreSupermarket", {
                        supermarket: item,
                      })
                    }
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.sectionImage}
                      />
                      <View style={styles.imageOverlay} />

                      <View style={styles.ratingContainer}>
                        <Image source={starIcon} style={styles.starIcon} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    </View>

                    <View
                      style={{
                        position: "absolute",
                        top: 5,
                        left: 4,
                        flexDirection: "row",
                      }}
                    >
                      <View style={styles.infoContainer}>
                        <AntDesign name="clockcircleo" size={13} color="#fff" />
                        <Text
                          style={[styles.deliveryTimeText, { color: "#fff" }]}
                        >
                          {item.deliveryTime}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        position: "absolute",
                        bottom: 5,
                        flexDirection: "row",
                      }}
                    >
                      <Text style={[styles.sectionItemText, { color: "#fff" }]}>
                        {abbreviateName(item.name, 20)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ))}

        <SearchSwiper />
      </ScrollView>
    </LinearGradient>
  );
};

export default Supermarket;

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
});