import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWishlist } from "../context/WishlishContext";
import { useBasket } from "../context/BasketContext";
import { useNavigation } from "@react-navigation/native";
import emptycart from "../assets/wishlist.png";
import { LinearGradient } from "expo-linear-gradient";

const WishlistScreen: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToBasket } = useBasket();
  const navigation = useNavigation();

  const floatAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnimation]);

  const handleDelete = (index: number) => {
    removeFromWishlist(index);
  };

  const handleAddToBasket = (item: WishlistItem) => {
    const basketItem: BasketItem = {
      id: item.id,
      name: item.name,
      price: totalPrice, // Use the calculated total price
      image: item.images[0],
      sizes: selectedSizes,
      restaurantName: pharmacyName, // Add the pharmacy name
      restaurantImageUri: pharmacyImageUri, // Add the pharmacy image URI
      restaurantLocation: pharmacyLocation,
    };

    console.log("id:", basketItem.id);
    console.log("name:", basketItem.name);
    console.log("price:", basketItem.price);
    console.log("image:", basketItem.image);
    console.log("sizes:", basketItem.sizes);
    console.log("restaurantName:", basketItem.restaurantName);
    console.log("restaurantImageUri:", basketItem.restaurantImageUri);
    console.log("restaurantLocation:", basketItem.restaurantLocation);

    addToBasket(basketItem);
  };

  const handleQuickView = (item: WishlistItem) => {
    navigation.navigate("FoodProducts", { item });
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: WishlistItem;
    index: number;
  }) => (
    <View key={item.id} style={styles.itemContainer}>
      <Image source={{ uri: item.images }} style={styles.image} />
      <View style={styles.textContainer}>
        <TouchableOpacity
          onPress={() => handleDelete(index)}
          style={styles.deleteIcon}
        >
          <Ionicons name="close-sharp" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.name, { color: "#fff" }]}>{item.name}</Text>
        <Text style={[styles.price, { color: "#fff" }]}>
          N{item.price.toFixed(2)}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={() => handleAddToBasket(item)}
        >
          <Text style={[styles.buyNowText]}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={["#737373", "rgba(171,116,95,.5)", "#737373"]}
      locations={[1, 0.1, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.7 }}
      style={styles.container}
    >
      {wishlist.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Animated.Image
            source={emptycart}
            style={[
              styles.emptyCartImage,
              {
                transform: [
                  {
                    translateY: floatAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  },
                ],
              },
            ]}
          />
          <Text style={[styles.emptyCartText, { color: "#fff" }]}>
            Empty Wishlist
          </Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContainer}
        />
      )}
    </LinearGradient>
  );
};

export default WishlistScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  flatListContainer: {
    paddingBottom: 40,
  },
  itemContainer: {
    flexDirection: "column", // Change to column layout
    marginTop: 10,
    margin: 5,
    paddingBottom: 10,

    marginBottom: 10,
    backgroundColor: "rgba(217, 101, 64, .8)",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: "100%", // Make the image take the full width
    height: 150, // Adjust the height as needed
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
  },
  deleteIcon: {
    alignSelf: "flex-end",
    position: "absolute",
    right: 2,
    top: -155,
    borderRadius: 50,
    padding: 5,
    backgroundColor: "rgba(217, 101, 64, .8)",
  },
  name: {
    fontSize: 18,
    fontFamily: "Kanit",
    marginTop: 10,
    textAlign: "center",
  },
  price: {
    fontSize: 16,
    marginTop: 5,
    fontFamily: "Kanitsb",
    textAlign: "center",
  },
  restaurantName: {
    fontSize: 16,
    marginTop: 5,
    fontFamily: "Kanit",
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center", // Center the button horizontally
    marginTop: 10,
    width: "100%", // Make the container take the full width
  },
  buyNowButton: {
    backgroundColor: "green",
    paddingVertical: 10, // Adjust padding as needed
    borderRadius: 5,
    width: "90%", // Make the button take almost the full width of the container
    alignItems: "center", // Center the text inside the button
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buyNowText: {
    fontSize: 16,
    fontFamily: "Kanitsb",
    color: "#fff",
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyCartText: {
    fontSize: 18,
    fontFamily: "Kanitb",
    color: "#000",
  },
});
