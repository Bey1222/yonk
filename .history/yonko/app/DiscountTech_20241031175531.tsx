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

interface DiscountItem {
  image: string;
  name: string;
  discountPrice: number;
  price: number;
  parentObj: {
    name: string;
    image: string;
    location: string;
  };
}

interface DiscountsScreenProps {
  discountItems: DiscountItem[];
}

const DiscountTech: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { discountItems } = route.params as DiscountsScreenProps;

  const abbreviateName = (name: string, maxLength: number = 17): string => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + "...";
    }
    return name;
  };

  const calculateDiscountPercent = (
    originalPrice: number,
    discountPrice: number
  ): string => {
    const discountAmount = originalPrice - discountPrice;
    const discountPercent = (discountAmount / originalPrice) * 100;
    return discountPercent.toFixed(0);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: DiscountItem;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("TechProducts", {
          item,
          techName: item.parentObj.name,
          techImageUri: item.parentObj.image,
          techLocation: item.parentObj.location,
        })
      }
    >
      <View style={styles.cardopa}>
        <Image source={{ uri: item.image }} style={styles.image} />
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
          <Text style={styles.discountPrice}>₦{item.discountPrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#737373", "rgba(12,54,114,1)", "#737373"]}
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
            Discounts
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <FlatList
          data={discountItems}
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

export default DiscountTech;
