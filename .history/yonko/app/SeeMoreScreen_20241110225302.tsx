import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useTheme, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const categoryMappings = {
  FOOD: {
    screen: "FoodProducts",
    properties: {
      name: "restaurantName",
      image: "restaurantImageUri",
      location: "restaurantLocation",
      state: "restaurantState",
    },
  },
  MEDICINE: {
    screen: "PharmacyProducts",
    properties: {
      name: "pharmacyName",
      image: "pharmacyImageUri",
      location: "pharmacyLocation",
    },
  },
  groceries: {
    screen: "SupernarketProducts",
    properties: {
      name: "supermarketName",
      image: "supermarketImageUri",
      location: "supermarketLocation",
    },
  },
  techs: {
    screen: "TechProducts",
    properties: {
      name: "techName",
      image: "techImageUri",
      location: "techLocation",
    },
  },
  household: {
    screen: "HouseholdProducts",
    properties: {
      name: "householdName",
      image: "householdImageUri",
      location: "householdLocation",
    },
  },
  wardrobe: {
    screen: "WardrobeProducts",
    properties: {
      name: "wardrobeName",
      image: "wardrobeImageUri",
      location: "wardrobeLocation",
    },
  },
  spas: {
    screen: "SpaBeautyProducts",
    properties: {
      name: "spaName",
      image: "spaImageUri",
      location: "spaLocation",
    },
  },
  pet: {
    screen: "PetSuppliesProducts",
    properties: {
      name: "petSupplyName",
      image: "petSupplyImageUri",
      location: "petSupplyLocation",
    },
  },
  plants: {
    screen: "PlantsProducts",
    properties: {
      name: "plantName",
      image: "plantImageUri",
      location: "plantLocation",
    },
  },
};

const SeeMoreScreen = ({ route }) => {
  const { predictions } = route.params;
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handlePress = (item) => {
    const mapping = categoryMappings[item.category];
    if (!mapping) {
      console.error(
        `Category ${item.category} is not defined in categoryMappings`
      );
      return;
    }

    const { screen, properties } = mapping;

    navigation.navigate(screen, {
      item,
      [properties.name]: item[properties.name],
      [properties.image]: item[properties.image],
      [properties.location]: item[properties.location],
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const abbreviateName = (name, maxLength = 17) => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + "...";
    }
    return name;
  };

  const calculateDiscountPercent = (originalPrice, discountPrice) => {
    const discountAmount = originalPrice - discountPrice;
    const discountPercent = (discountAmount / originalPrice) * 100;
    return discountPercent.toFixed(0);
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
        <View style={styles.cardopa}>
          <Image source={{ uri: item.images[0] }} style={styles.image} />
        </View>
        {item.discount && (
          <View style={styles.iconContainer}>
            <Text style={styles.discountPercentText}>
              -{calculateDiscountPercent(item.price, item.discountPrice)}%
            </Text>
          </View>
        )}
        <View style={styles.cardin}>
          <Text style={styles.name}>{abbreviateName(item.name)}</Text>
          <View style={styles.priceContainer}>
            {item.discount ? (
              <Text style={styles.discountPrice}>₦{item.discountPrice}</Text>
            ) : (
              <Text style={styles.price}>₦{item.basePrice}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={["#737373", "#d16847", "#737373"]}
      locations={[1, 0.2, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.7 }}
      style={styles.container}
    >
      <View>
        <View style={[styles.navbar, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={handleBackPress} style={styles.icon}>
            <AntDesign name="left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.navbarTitle, { color: colors.text }]}>
            Search
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <FlatList
          data={predictions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
        />
      </View>
    </LinearGradient>
  );
};

export default SeeMoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  navbarTitle: {
    fontSize: 20,
    fontFamily: "Kanitb",
    textAlign: "center",
    flex: 1,
    marginTop: 30,
  },
  listContainer: {
    marginTop: 10,
    paddingBottom: 100,
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
  price: {
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
  icon: {
    backgroundColor: "#d96540",
    position: "absolute",
    top: 40,
    left: 10,
    padding: 5,
    borderRadius: 100,
    zIndex: 5,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
});
