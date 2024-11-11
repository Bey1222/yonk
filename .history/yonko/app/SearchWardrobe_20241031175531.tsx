import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { useTheme, useNavigation } from "@react-navigation/native";
import wardrobeData from "../assets/data/clothingdata.json";
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

const SearchWardrobe = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [resultsCount, setResultsCount] = useState(0);

  const filters = ["All", "Category", "Ratings"];
  const categories = ["Men", "Women", "Kids", "Unisex", "Jewelry", "Clothing"];
  const brands = [
    "Levi's",
    "Tommy Hilfiger",
    "Nike",
    "Carter's",
    "GapKids",
    "Zara",
    "H&M",
    "Forever 21",
    "Timberland",
    "Ralph Lauren",
  ];
  const ratings = [
    { label: "5.0 - 4.5", min: 4.5, max: 5.0 },
    { label: "4.4 - 3.5", min: 3.5, max: 4.4 },
    { label: "3.4 - 2.5", min: 2.5, max: 3.4 },
    { label: "2.4 - 1.5", min: 1.5, max: 2.4 },
    { label: "1.4 - 0.5", min: 0.5, max: 1.4 },
  ];
  const promotions = ["New in", "Other"];

  const filteredWardrobe = useMemo(() => {
    let filtered = wardrobeData.wardrobe;

    if (activeFilter === "Category" && selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    } else if (activeFilter === "Brand" && selectedBrand) {
      filtered = filtered.filter((item) =>
        item.menu.some((menuItem) => menuItem.brand === selectedBrand)
      );
    } else if (activeFilter === "Ratings" && selectedRating) {
      filtered = filtered.filter(
        (item) =>
          item.rating >= selectedRating.min && item.rating <= selectedRating.max
      );
    } else if (activeFilter === "Promotions" && selectedPromotion) {
      filtered = filtered.filter((item) =>
        item.menu.some(
          (menuItem) => menuItem.isNew && selectedPromotion === "New in"
        )
      );
    }

    // Sort the filtered wardrobe based on the package attribute
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
  ]);

  useEffect(() => {
    setResultsCount(filteredWardrobe.length);
  }, [filteredWardrobe]);

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

  const handleBackPress = () => {
    navigation.goBack();
  };

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
                    ? colors.primary
                    : colors.background,
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
                      ? colors.background
                      : colors.text,
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("MainstoreWardrobe", { wardrobe: item })
      }
    >
      <View style={styles.cardopa}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>
      <View style={styles.iconContainer}>
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
      <View style={styles.packageIconContainer}>
        {item.package === "Elite" && (
          <MaterialCommunityIcons name="crown" size={20} color="#d96540" />
        )}
        {item.package === "Premium" && (
          <MaterialCommunityIcons name="star" size={20} color="#d96540" />
        )}
        {item.package === "Basic" && (
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
      colors={["#737373", "rgba(156,114,74,.9)", "#737373"]}
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
            <Text style={[styles.header, { color: "#ffffff" }]}>Wardrobe</Text>
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
          data={filteredWardrobe}
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

export default SearchWardrobe;

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
