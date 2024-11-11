import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation, useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

const TopPharmacies = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { topPharmacies, pharmacyName, pharmacyImageUri, pharmacyLocation } =
    route.params;

  const abbreviateName = (name, maxLength = 17) => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + "...";
    }
    return name;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNavigation = (item) => {
    const shopId = item.id;
    const store = topPharmacies.find((store) => store.id === shopId);

    if (!store) {
      console.error("Store not found for shopId:", shopId);
      return;
    }

    const pharmacy = {
      shop: store,
      products: store.products || [],
      parentObj: {
        routeCategory: item.routeCategory,
        id: item.id,
      },
    };

    navigation.navigate("MainstorePharmacy", {
      pharmacy,
      pharmacyName: store.name,
      pharmacyImageUri: store.avatar,
      pharmacyLocation: `${store.address.street}, ${store.address.city}, ${store.address.state}, ${store.address.country}`,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleNavigation(item)}
    >
      <View style={styles.cardopa}>
        <Image source={{ uri: item.avatar }} style={styles.image} />
      </View>
      <View style={styles.iconContainer}>
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
      <View style={styles.cardin}>
        <Text style={styles.name}>{abbreviateName(item.name)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#737373", "rgba(255,46,65,.7)", "#737373"]}
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
            Top Pharmacies
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <FlatList
          data={topPharmacies}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  icon: {
    marginRight: 10,
  },
  navbarTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 10,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 5,
    overflow: "hidden",
  },
  cardopa: {
    aspectRatio: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  iconContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
    borderRadius: 5,
  },
  ratingText: {
    color: "#fff",
    fontSize: 12,
  },
  cardin: {
    padding: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TopPharmacies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
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

export default TopPharmacies;
