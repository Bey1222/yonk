import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { useTheme, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Entypo from "react-native-vector-icons/Entypo"; // Import Entypo

const SearchHousehold = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [resultsCount, setResultsCount] = useState(0);
  const [storesData, setStoresData] = useState([]);
  const [storeData, setStoreData] = useState({});

  const filters = ["All", "Category", "Brand", "Ratings", "Promotions"];
  const categories = ["Household Supplies"];
  const brands = [
    "IKEA",
    "Target",
    "Clorox",
    "Neutrogena",
    "Dove",
    "Pine-Sol",
    "Mr. Clean",
  ];
  const ratings = [
    { label: "5.0 - 4.5", min: 4.5, max: 5.0 },
    { label: "4.4 - 3.5", min: 3.5, max: 4.4 },
    { label: "3.4 - 2.5", min: 2.5, max: 3.4 },
    { label: "2.4 - 1.5", min: 1.5, max: 2.4 },
    { label: "1.4 - 0.5", min: 0.5, max: 1.4 },
  ];
  const promotions = ["New in", "Other"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/products?category=HOUSEHOLD`,
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
          setStoresData(data.products);
        } else {
          console.error("Invalid category data format:", data);
        }
      } catch (error) {
        console.error("Error fetching category data:", error); // Log any errors
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
      console.log("Fetched store data for shopId:", shopId, data); // Log the fetched data
      if (data && data.shop) {
        setStoreData((prevStoreData) => ({
          ...prevStoreData,
          [shopId]: data.shop,
        }));

        // Fetch products for the store
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
        console.log("Fetched products data for shopId:", shopId, productsData); // Log the fetched products data
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
      console.error("Error fetching store data for shopId:", shopId, error); // Log any errors
    }
  };

  useEffect(() => {
    if (storesData.length > 0) {
      storesData.forEach((product) => {
        if (!storeData[product.shopId]) {
          fetchStoreById(product.shopId);
        }
      });
    }
  }, [storesData]);

  const filteredHouseholds = useMemo(() => {
    let filtered = Object.values(storeData);

    if (activeFilter === "Category" && selectedCategory) {
      filtered = filtered.filter(
        (store) => store.category === selectedCategory
      );
    } else if (activeFilter === "Brand" && selectedBrand) {
      filtered = filtered.filter((store) =>
        store.menu.some((item) => item.brand === selectedBrand)
      );
    } else if (activeFilter === "Ratings" && selectedRating) {
      filtered = filtered.filter(
        (store) =>
          store.rating >= selectedRating.min &&
          store.rating <= selectedRating.max
      );
    } else if (activeFilter === "Promotions" && selectedPromotion) {
      filtered = filtered.filter((store) =>
        store.promotions.includes(selectedPromotion)
      );
    }

    // Sort the filtered households based on the package attribute
    filtered.sort((a, b) => {
      const packageOrder = { Elite: 1, Premium: 2, Basic: 3 };
      return packageOrder[a.package] - packageOrder[b.package];
    });

    return filtered;
  }, [
    activeFilter,
    selectedCategory,
    selectedBrand,
    selectedRating,
    selectedPromotion,
    storeData,
  ]);

  useEffect(() => {
    setResultsCount(filteredHouseholds.length);
  }, [filteredHouseholds]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "m";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    } else {
      return num.toString();
    }
  };

  const filterOpacity = useSharedValue(0);
  const subFilterOpacity = useSharedValue(0);

  const filterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: filterOpacity.value,
    transform: [{ scale: filterOpacity.value }],
  }));

  const subFilterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subFilterOpacity.value,
    transform: [{ scale: subFilterOpacity.value }],
  }));

  useEffect(() => {
    if (showFilters) {
      filterOpacity.value = withTiming(1, { duration: 300 });
    } else {
      filterOpacity.value = withTiming(0, { duration: 300 });
      subFilterOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [showFilters]);

  useEffect(() => {
    if (
      activeFilter === "Category" ||
      activeFilter === "Brand" ||
      activeFilter === "Ratings" ||
      activeFilter === "Promotions"
    ) {
      subFilterOpacity.value = withTiming(1, { duration: 300 });
    } else {
      subFilterOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [activeFilter]);

  const filterButtonScale = useSharedValue(1);

  useEffect(() => {
    if (!showFilters) {
      filterButtonScale.value = withRepeat(
        withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      filterButtonScale.value = withTiming(1, { duration: 500 });
    }
  }, [showFilters]);

  const filterButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterButtonScale.value }],
  }));

  const renderSubFilters = () => {
    let filterOptions;

    switch (activeFilter) {
      case "Category":
        filterOptions = categories;
        break;
      case "Brand":
        filterOptions = brands;
        break;
      case "Ratings":
        filterOptions = ratings;
        break;
      case "Promotions":
        filterOptions = promotions;
        break;
      default:
        filterOptions = [];
    }

    return (
      <Animated.View
        style={[styles.subFilterContainer, subFilterAnimatedStyle]}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={typeof option === "object" ? option.label : option}
            style={[
              styles.subFilterButton,
              {
                backgroundColor:
                  (activeFilter === "Category" &&
                    selectedCategory === option) ||
                  (activeFilter === "Brand" && selectedBrand === option) ||
                  (activeFilter === "Ratings" &&
                    selectedRating &&
                    selectedRating.label === option.label) ||
                  (activeFilter === "Promotions" &&
                    selectedPromotion === option)
                    ? "#d96540"
                    : "#ffffff",
              },
            ]}
            onPress={() => handleSubFilterPress(option)}
          >
            <Text
              style={[
                styles.subFilterText,
                {
                  color:
                    (activeFilter === "Category" &&
                      selectedCategory === option) ||
                    (activeFilter === "Brand" && selectedBrand === option) ||
                    (activeFilter === "Ratings" &&
                      selectedRating &&
                      selectedRating.label === option.label) ||
                    (activeFilter === "Promotions" &&
                      selectedPromotion === option)
                      ? "#ffffff"
                      : "#000000",
                },
              ]}
            >
              {typeof option === "object" ? option.label : option}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };

  const handleSubFilterPress = (option) => {
    switch (activeFilter) {
      case "Category":
        setSelectedCategory(option);
        break;
      case "Brand":
        setSelectedBrand(option);
        break;
      case "Ratings":
        setSelectedRating(option);
        break;
      case "Promotions":
        setSelectedPromotion(option);
        break;
    }
  };

  const handleStorePress = (store) => {
    navigation.navigate("MainstoreHousehold", {
      household: {
        shop: store,
        products: store.products,
      },
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleStorePress(item)}
    >
      <View style={styles.cardopa}>
        <Image source={{ uri: item.avatar }} style={styles.image} />
      </View>
      <View style={styles.iconContainer}>
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
      <View style={styles.packageIconContainer}>
        {item.subscription === "ELITE" && (
          <MaterialCommunityIcons name="crown" size={20} color="#d96540" />
        )}
        {item.subscription === "PREMIUM" && (
          <MaterialCommunityIcons name="star" size={20} color="#d96540" />
        )}
        {item.subscription === "BASIC" && (
          <MaterialCommunityIcons name="circle" size={20} color="#d96540" />
        )}
      </View>
      <View style={styles.cardin}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#737373", "rgba(175, 238, 238, .7)", "#737373"]}
      locations={[1, 0.2, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.7 }}
      style={styles.container}
    >
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={handleBackPress}>
              <Entypo name="chevron-thin-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={[styles.header, { color: "#ffffff" }]}>Household</Text>
          </View>

          <Animated.View style={filterButtonAnimatedStyle}>
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
              <Icon name="filter-list" size={30} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
        <Text style={[styles.resultsCount, { color: "#ffffff" }]}>
          Results ({formatNumber(resultsCount)})
        </Text>
        {showFilters && (
          <Animated.View style={[styles.filterContainer, filterAnimatedStyle]}>
            <View style={styles.filterButtonsContainer}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor:
                        activeFilter === filter ? "#d96540" : "#ffffff",
                    },
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      {
                        color: activeFilter === filter ? "#ffffff" : "#000000",
                      },
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {(activeFilter === "Category" ||
              activeFilter === "Brand" ||
              activeFilter === "Ratings" ||
              activeFilter === "Promotions") &&
              renderSubFilters()}
          </Animated.View>
        )}
        <FlatList
          data={filteredHouseholds}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      </View>
    </LinearGradient>
  );
};
export default SearchHousehold;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 25,
    borderRadius: 20,
    paddingHorizontal: 5,
  },
  header: {
    fontSize: 24,
    fontFamily: "Kanitb",
  },
  resultsCount: {
    fontSize: 16,
    marginBottom: 16,
    fontFamily: "Kanit",
    paddingHorizontal: 5,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // Center the filters
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterText: {
    fontSize: 14,
  },
  subFilterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // Center the sub-filters
    marginTop: 8,
  },
  subFilterButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  subFilterText: {
    fontSize: 12,
  },
  listContainer: {
    paddingHorizontal: 10,
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
  ratingText: {
    fontSize: 14,
    color: "#d96540",
    fontFamily: "Kanit",
    textAlign: "center",
  },
  packageIconContainer: {
    position: "absolute",
    top: 10,
    right: 4,
    backgroundColor: "rgba(255, 255, 255, .8)",
    padding: 5,
    borderRadius: 1000,
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
});
