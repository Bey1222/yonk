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

interface HouseholdItem {
  image: string;
  name: string;
  rating: number;
  deliveryTime: string;
}

interface HouseholdItemsProps {
  householdItems: HouseholdItem[];
}

const EssentialItems: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { householdItems } = route.params as HouseholdItemsProps;

  const abbreviateName = (name, maxLength = 17) => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + "...";
    }
    return name;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderItem = ({ item }: { item: HouseholdItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("MainstoreHousehold", { household: item })
      }
    >
      <View style={styles.cardopa}>
        <Image source={{ uri: item.image }} style={styles.image} />
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
      colors={["#737373", "rgba(175, 238, 238, .7)", "#737373"]}
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
            Top Household Items
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <FlatList
          data={householdItems}
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

export default EssentialItems;
