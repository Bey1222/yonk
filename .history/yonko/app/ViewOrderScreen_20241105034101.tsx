import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons, AntDesign } from "@expo/vector-icons"; // Import the Ionicons and AntDesign libraries
import { LinearGradient } from "expo-linear-gradient"; // Import the LinearGradient component
import { useBasket } from "../context/BasketContext"; // Import the BasketContext

const ViewOrderScreen = () => {
  const route = useRoute();
  const { items } = route.params;
  const navigation = useNavigation();
  const { removeFromBasket } = useBasket(); // Use the removeFromBasket function from the context

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDelete = (itemId) => {
    removeFromBasket(itemId);
    navigation.goBack(); // Go back to the OrderScreen to reflect changes
  };

  const renderItem = ({ item }) => {
    const totalPrice =
      item.sizes.reduce((sum, size) => sum + size.price * size.quantity, 0) +
      (item.addOns
        ? Object.values(item.addOns).reduce(
            (sum, addOns) =>
              sum + addOns.reduce((sum, addOn) => sum + addOn.price, 0),
            0
          )
        : 0);

    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <Text style={styles.itemName}>{item.name}</Text>
        {item.sizes.map((size, index) => (
          <View key={index} style={styles.sizeContainer}>
            <Text style={styles.sizeText}>Size: {size.name}</Text>
            <Text style={styles.quantityText}>Quantity: {size.quantity}</Text>
          </View>
        ))}
        {item.addOns && (
          <Text style={styles.itemAddOns}>
            Add-ons:{" "}
            {Object.values(item.addOns)
              .map((addOns) => addOns.map((addOn) => addOn.name).join(", "))
              .join(", ")}
          </Text>
        )}
        {item.note && <Text style={styles.noteText}>Note: {item.note}</Text>}
        <Text style={styles.itemPrice}>₦{totalPrice.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-sharp" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  const totalPrice = items.reduce(
    (acc, item) =>
      acc +
      item.sizes.reduce((sum, size) => sum + size.price * size.quantity, 0) +
      (item.addOns
        ? Object.values(item.addOns).reduce(
            (sum, addOns) =>
              sum + addOns.reduce((sum, addOn) => sum + addOn.price, 0),
            0
          )
        : 0),
    0
  );

  return (
    <LinearGradient
      colors={["#737373", "#d16847", "#737373"]}
      locations={[1, 0.2, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.7 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <AntDesign name="down" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Order(s)</Text>
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`} // Ensure unique keys by combining id and index
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ₦{totalPrice.toFixed(2)}</Text>
      </View>
    </LinearGradient>
  );
};

export default ViewOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 3,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: -10,
    backgroundColor: "transparent",
    borderRadius: 100,
    padding: 10,
    zIndex: 1,
  },
  headerText: {
    fontSize: 20,
    fontFamily: "Kanitb",
    color: "#fff",
  },
  itemContainer: {
    paddingBottom: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#d9d9d9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 10,
    position: "relative",
  },
  itemImage: {
    width: "100%",
    height: 150,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  itemName: {
    fontSize: 18,
    fontFamily: "Kanitb",
    marginBottom: 5,
    marginLeft: 7,
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: "Kanitsb",
    marginLeft: 10,
  },
  itemAddOns: {
    fontSize: 14,
    fontFamily: "Kanit",
    marginLeft: 10,
  },
  sizeContainer: {
    marginLeft: 10,
  },
  sizeText: {
    fontSize: 14,
    fontFamily: "Kanit",
  },
  quantityText: {
    fontSize: 14,
    fontFamily: "Kanit",
  },
  noteText: {
    fontSize: 14,
    fontFamily: "Kanit",
    marginLeft: 10,
  },
  totalContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalText: {
    fontSize: 18,
    fontFamily: "Kanitb",
    color: "#fff",
  },
  deleteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 100,
    padding: 5,
  },
});
