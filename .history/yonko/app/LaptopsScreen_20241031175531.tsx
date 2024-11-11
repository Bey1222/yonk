import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const LaptopsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { items } = route.params;
  const { colors } = useTheme();

  const calculateDiscountPercent = (
    originalPrice: number,
    discountPrice: number
  ) => {
    const discountAmount = originalPrice - discountPrice;
    const discountPercent = (discountAmount / originalPrice) * 100;
    return discountPercent.toFixed(0);
  };

  const abbreviateName = (name: string, maxLength = 17) => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + "...";
    }
    return name;
  };

  return (
    <LinearGradient
      colors={["#737373", "rgba(12,54,114,1)", "#737373"]}
      locations={[1, 0.2, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.7 }}
      style={styles.container}
    >
      <View style={styles.container}>
        <View style={[styles.navbar, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.icon}
          >
            <AntDesign name="left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.navbarTitle, { color: colors.text }]}>
            Laptops
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.listContainer}>
            {items.map((item: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("TechProducts", {
                    item,
                    techName: item.techName,
                    techImageUri: item.techImageUri,
                    techLocation: item.techLocation,
                  })
                }
              >
                <View style={styles.cardopa}>
                  <Image source={{ uri: item.image }} style={styles.image} />
                </View>
                {item.discount && (
                  <View style={styles.iconContainer}>
                    <Text style={styles.discountPercentText}>
                      -
                      {calculateDiscountPercent(item.price, item.discountPrice)}
                      %
                    </Text>
                  </View>
                )}
                <View style={styles.cardin}>
                  <Text style={styles.name}>{abbreviateName(item.name)}</Text>
                  <View style={styles.priceContainer}>
                    {item.discount ? (
                      <>
                        <Text style={styles.discountPrice}>
                          ₦{item.discountPrice}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.discountPrice}>₦{item.price}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
  scrollContainer: {
    flex: 1,
    padding: 10,
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
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
});

export default LaptopsScreen;
