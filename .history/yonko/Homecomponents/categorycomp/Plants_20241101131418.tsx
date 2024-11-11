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
import starIcon from "../../assets/star.png";
import bicycleIcon from "../../assets/bicycle.png";
import discountIcon from "../../assets/discount.png";
import newimage from "../../assets/new.png";
import SearchSwiper from "@/Searchcomponents/SearchSwiper";

const Plants = () => {
  const navigation = useNavigation();
  const [categoryData, setCategoryData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [sectionData, setSectionData] = useState({});

  const sectionNames = [
    "Green Thumb Picks",
    "Discounts",
    "Best Sellers",
    "New Arrivals",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/products?category=PLANTS`,
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
        if (section === "Green Thumb Picks") {
          data[section] = shuffleArray(storeData).slice(0, 5);
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
    { name: "Succulents", image: require("../../assets/outdoor.jpg") },
    { name: "Herbs", image: require("../../assets/all13.jpg") },
    { name: "Ferns", image: require("../../assets/outdoor.jpg") },
    {
      name: "Flowering Plants",
      image: require("../../assets/all13.jpg"),
    },
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
          plantName: item.name,
          plantImageUri: item.image,
          plantLocation: item.location,
        }))
    );

    if (brand === "Succulents") {
      navigation.navigate("SucculentsScreen", { items: brandItems });
    } else if (brand === "Herbs") {
      navigation.navigate("HerbsScreen", { items: brandItems });
    } else if (brand === "Ferns") {
      navigation.navigate("FernsScreen", { items: brandItems });
    } else if (brand === "Flowering Plants") {
      navigation.navigate("FloweringPlantsScreen", { items: brandItems });
    }
  };

  const handleItemPress = (item, section) => {
    if (section === "Green Thumb Picks") {
      navigation.navigate("MainstorePlants", { plant: item });
    } else if (section === "Discounts" || section === "New Arrivals") {
      navigation.navigate("PlantsProducts", {
        item,
        plantName: item.plantName,
        plantImageUri: item.plantImageUri,
        plantLocation: item.plantLocation,
      });
    }
  };

  const handleSectionPress = (section) => {
    if (section === "Green Thumb Picks") {
      navigation.navigate("GreenThumbPicks", {
        greenThumbPicks: categoryData,
      });
    } else if (section === "Discounts") {
      navigation.navigate("DiscountPlants", {
        discountItems: fetchDiscountItems(),
      });
    } else if (section === "Best Sellers") {
      navigation.navigate("BestsellersPlants", {
        bestSellers,
      });
    } else if (section === "New Arrivals") {
      navigation.navigate("NewarrivalsPlants", {
        newItems: fetchNewItems(),
      });
    }
  };

  const fetchDiscountItems = () => {
    const discountItems = [];
    categoryData.forEach((item) => {
      if (item.menu) {
        item.menu.forEach((menuItem) => {
          if (menuItem.discount) {
            discountItems.push({
              ...menuItem,
              plantName: item.name,
              plantImageUri: item.image,
              plantLocation: item.location,
              discountPercent: calculateDiscountPercent(
                menuItem.price,
                menuItem.discountPrice
              ),
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
              plantName: item.name,
              plantImageUri: item.image,
              plantLocation: item.location,
            });
          }
        });
      }
    });
    return newItems;
  };

  return (
    <LinearGradient
      colors={["#737373", "rgba(34, 139, 34, .5)", "#737373"]}
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
                  onPress={() => handleSectionPress(section)}
                >
                  <AntDesign name="right" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            {section === "Discounts" ? (
              <View style={styles.listContainer}>
                {sectionData[section]?.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.card}
                    onPress={() => handleItemPress(item, section)}
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
                {sectionData[section]?.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.sectionItem}
                    onPress={() => handleItemPress(item, section)}
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
                {sectionData[section]?.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.sectionItem}
                    onPress={() => handleItemPress(item, section)}
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

export default Plants;

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
