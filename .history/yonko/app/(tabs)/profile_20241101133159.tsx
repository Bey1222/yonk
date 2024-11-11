import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import bicycleIcon from "../../assets/bicycle.png";
import packages from "../../assets/package.png";
import logo from "../../assets/logo.png";
import mail from "../../assets/mail.png";
import chain from "../../assets/communication.png";
import usermag from "../../assets/user.png";
import { useUserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = () => {
  const navigation = useNavigation();
  const ref = useRef(null);
  const { user, setUser, loading } = useUserContext();

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("userData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const token = await AsyncStorage.getItem("token");
          setUser({ ...parsedData, token });

          // Log the user data and token
          console.log("User data:", parsedData);
          console.log("Token:", token);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  // Log the user object to verify if it's being passed correctly
  useEffect(() => {
    console.log("User context in Profile:", user);
  }, [user]);

  // Capture image from camera roll
  // Upload to the server as avatar
  const onCaptureImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = `data:image/png;base64,${result.assets[0].base64}`;
      // Upload the image to your server here
      // Example: await axios.post(`${BASE_URL}/user/upload-avatar`, { image: base64 });
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <LinearGradient
      colors={["#737373", "rgba(245, 222, 179, .5)", "#737373"]}
      locations={[1, 0.2, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.7 }}
      style={styles.container}
    >
      <View style={{ position: "absolute", top: 30 }}>
        <Image source={logo} style={styles.logo} />
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("Info")}
        >
          <Image source={usermag} style={styles.bicycleIcon} />
          <Text style={[styles.optionText, { color: "white" }]}>
            Basic Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("MyPackages")}
        >
          <Image source={packages} style={styles.bicycleIcon} />
          <Text style={[styles.optionText, { color: "white" }]}>
            My Packages
          </Text>
        </TouchableOpacity>
      </View>

      {user && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.imageContainer}
        >
          <TouchableOpacity onPress={onCaptureImage}>
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", gap: 6 }}>
            <Text
              style={{
                fontFamily: "Kanitb",
                fontSize: 22,
                color: "white",
              }}
            >
              {user.name}
            </Text>
          </View>
        </KeyboardAvoidingView>
      )}

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("Inbox")}
        >
          <Image source={mail} style={styles.bicycleIcon} />
          <Text style={[styles.optionText, { color: "white" }]}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("Others")}
        >
          <Image source={chain} style={styles.bicycleIcon} />
          <Text style={[styles.optionText, { color: "white" }]}>Others</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  middleOptionsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    position: "absolute",
    top: "80%",
    transform: [{ translateY: -50 }],
  },
  option: {
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
  },
  logo: {
    width: 120,
    height: 120,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bicycleIcon: {
    width: 80,
    height: 80,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionText: {
    fontFamily: "Kanitb",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
    width: "100%",
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
});
