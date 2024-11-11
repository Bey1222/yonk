import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

const PopularNearYouScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [popularStores, setPopularStores] = useState([]);

  useEffect(() => {
    const fetchPopularStores = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/shops`,
          {
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN}`,
            },
          }
        );
        if (!response.ok) {
          console.error(
            "Popular stores fetch failed with status:",
            response.status
          );
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data && data.shops) {
          const storesWithProducts = await Promise.all(
            data.shops.map(async (store) => {
              const productsResponse = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/products?shopId=${store.id}`,
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
              return {
                ...store,
                products: productsData.products,
              };
            })
          );
          setPopularStores(storesWithProducts);
        } else {
          console.error("Invalid popular stores data format:", data);
        }
      } catch (error) {
        console.error("Error fetching popular stores:", error);
      }
    };

    fetchPopularStores();
  }, []);

  const abbreviateName = (name, maxLength = 17) => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + "...";
    }
    return name;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("MainstoreFood", {
          restaurant: {
            shop: item,
            products: item.products, // Pass the products to MainstoreFood
          },
        })
      }
    >
      <View style={styles.cardopa}>
        <Image source={{ uri: item.avatar }} style={styles.image} />
      </View>
      <View style={styles.cardin}>
        <Text style={styles.name}>{abbreviateName(item.name)}</Text>
        <Text style={styles.address}>
          {item.address.street}, {item.address.city}, {item.address.state}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#737373", "rgba(255, 218, 185, .9)", "#d16847"]}
      locations={[1, 0.29, 0.5]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.75 }}
      style={styles.container}
    >
      <View>
        <View style={[styles.navbar, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={handleBackPress} style={styles.icon}>
            <AntDesign name="left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.navbarTitle, { color: colors.text }]}>
            Popular Near You
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <FlatList
          data={popularStores}
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

export default PopularNearYouScreen;

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