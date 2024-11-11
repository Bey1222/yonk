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
  tech: {
    screen: "TechProducts",
    properties: {
      name: "name",
      image: "images",
      location: "shopId",
    },
  },
  clothing: {
    screen: "WardrobeProducts",
    properties: {
      name: "name",
      image: "images",
      location: "shopId",
    },
  },
  household: {
    screen: "HouseholdProducts",
    properties: {
      name: "name",
      image: "images",
      location: "shopId",
    },
  },
  beauty: {
    screen: "SpaBeautyProducts",
    properties: {
      name: "name",
      image: "images",
      location: "shopId",
    },
  },
  pet: {
    screen: "PetSuppliesProducts",
    properties: {
      name: "name",
      image: "images",
      location: "shopId",
    },
  },
  plant: {
    screen: "PlantsProducts",
    properties: {
      name: "name",
      image: "images",
      location: "shopId",
    },
  },
  medicine: {
    screen: "PharmacyProducts",
    properties: {
      name: "name",
      image: "images",
      location: "shopId",
    },
  },
  supermarket: {
    screen: "SupermarketProducts",
    properties: {
      name: "name",
      image: "images",
      location: "shopId",
    },
  },
  food: {
    screen: "FoodProducts",
    properties: {
      name: "name",
      image: "images",
      location: "shopId",
    },
  },
};

const SeeMoreScreen = ({ route }) => {
  const { predictions } = route.params;
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handlePress = (item) => {
    const mapping = categoryMappings[item.category.toLowerCase()];
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
      [properties.image]: item[properties.image][0], // Access the first image in the images array
      [properties.location]: item[properties.location],
      pharmacyName: item.pharmacyName, // Add any additional required parameters
      pharmacyImageUri: item.pharmacyImageUri, // Add any additional required parameters
      pharmacyLocation: item.pharmacyLocation, // Add any additional required parameters

      techName: item.techName, // Add any additional required parameters
      techImageUri: item.techImageUri, // Add any additional required parameters
      techLocation: item.techLocation, // Add any additional required parameters

      spaName: item.spaName, // Add any additional required parameters
      spaImageUri: item.spaImageUri, // Add any additional required parameters
      spaLocation: item.spaLocation, // Add any additional required parameters

      wardrobeName: item.wardrobeName, // Add any additional required parameters
      wardrobeImageUri: item.wardrobeImageUri, // Add any additional required parameters
      wardrobeLocation: item.wardrobeLocation, // Add any additional required parameters

      supermarketName: item.supermarketName, // Add any additional required parameters
      supermarketImageUri: item.supermarketImageUri, // Add any additional required parameters
      supermarketLocation: item.supermarketLocation, // Add any additional required parameters

      plantName: item.plantName, // Add any additional required parameters
      plantImageUri: item.plantImageUri, // Add any additional required parameters
      plantLocation: item.plantLocation, // Add any additional required parameters

      petSupplyName: item.petSupplyName, // Add any additional required parameters
      petSupplyImageUri: item.petSupplyImageUri, // Add any additional required parameters
      petSupplyLocation: item.petSupplyLocation, // Add any additional required parameters

      householdName: item.householdName, // Add any additional required parameters
      householdImageUri: item.householdImageUri, // Add any additional required parameters
      householdLocation: item.householdLocation, // Add any additional required parameters
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
