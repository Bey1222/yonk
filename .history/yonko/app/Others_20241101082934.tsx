import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
  Animated,
  Linking, // Import Linking
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserContext } from "../context/UserContext"; // Import the UserContext

const Others = () => {
  const navigation = useNavigation();
  const { setUserData } = useUserContext(); // Get the setUserData function from UserContext
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const toggleSwitch = () => {
    setIsSubscribed((previousState) => !previousState);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      fadeAnim.setValue(0);
    });
  };

  useEffect(() => {
    if (isSubscribed) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        fadeAnim.setValue(0);
      });
    }
  }, [isSubscribed, fadeAnim]);

  const handleHelpImproveApp = () => {
    const email = "user@example.com"; // Replace with actual user email logic
    const subject = "Help improve the app";
    const body = "Please provide your feedback here:";
    const mailtoLink = `mailto:yonkollc2@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    Linking.canOpenURL(mailtoLink)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mailtoLink);
        } else {
          console.log("Don't know how to open URI: " + mailtoLink);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userData");
      setUserData({
        firstName: "",
        lastName: "",
        image: "",
        email: "",
        dob: "",
        phoneNumber: "",
        address: "",
        state: "",
        additionalInfo: "",
      });
      console.log("Logged out successfully");
      navigation.navigate("Register"); // Navigate back to the Register component
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#737373", "#d16847", "#737373"]}
      locations={[1, 0.2, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.7 }}
      style={styles.container}
    >
      <Text style={styles.heading}>Others</Text>
      <ScrollView>
        <View style={styles.item}>
          <Text style={styles.itemText}>Subscribe To Newsletter</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#d96540" }}
            thumbColor={isSubscribed ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isSubscribed}
          />
        </View>
        {isSubscribed ? (
          <Animated.Text
            style={[styles.subscriptionText, { opacity: fadeAnim }]}
          >
            Subscribed to newsletter
          </Animated.Text>
        ) : (
          <Animated.Text
            style={[styles.subscriptionText, { opacity: fadeAnim }]}
          >
            Unsubscribed from newsletter
          </Animated.Text>
        )}

        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate("RatingsAndReviews")}
        >
          <Text style={styles.itemText}>Ratings and reviews</Text>
          <AntDesign name="right" size={24} style={styles.arrow} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate("RateApp")}
        >
          <Text style={styles.itemText}>Rate App</Text>
          <AntDesign name="right" size={24} style={styles.arrow} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={handleHelpImproveApp} // Updated onPress handler
        >
          <Text style={styles.itemText}>Help improve App</Text>
          <AntDesign name="right" size={24} style={styles.arrow} />
        </TouchableOpacity>

        <View style={{ paddingBottom: 10 }}>
          <TouchableOpacity
            style={[styles.logoutButton]}
            onPress={handleLogout} // Replace with actual logout logic
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.deleteButton]}
          onPress={() => navigation.navigate("DeleteAccount")}
        >
          <Text style={styles.deleteText}>Delete my account</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default Others;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontFamily: "Kanitb",
    marginBottom: 20,
    color: "white",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemText: {
    color: "white",
    fontFamily: "Kanitsb",
  },
  arrow: {
    color: "white",
  },
  logoutButton: {
    marginTop: 30,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    backgroundColor: "#d96540",
    shadowColor: "rgba(0, 0, 0, 0.8)",

    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 2,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
  deleteButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "red",
    shadowColor: "rgba(0, 0, 0, 0.8)",

    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 2,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  subscriptionText: {
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "Kanit",
    color: "white",
  },
});
