import React, { useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useWarmUpBrowser } from "../../hooks/useWarmUpBrowser";
import { defaultStyles } from "../../constants/Styles";
import Colors from "../../constants/Colors";
import { Video } from "expo-av";
import { BlurView } from "expo-blur";
import test from "../../assets/test.mp4";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  useWarmUpBrowser();

  const router = useRouter();
  const navigation = useNavigation(); // Get the navigation object

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        // If the user is already authenticated, navigate to the main (tabs) component
        navigation.navigate("");
      }
    };

    checkAuth();
  }, [navigation]);

  const onSelectAuth = (strategy) => {
    // Implement your own authentication logic here
    console.log(`Selected auth strategy: ${strategy}`);
  };

  return (
    <View style={styles.container}>
      <Video
        source={test}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill}
      />
      <BlurView intensity={50} tint="dark" style={styles.blurOverlay} />
      <LinearGradient
        colors={["rgba(217, 101, 64, 0.5)", "rgba(217, 217, 217, 0.8)"]}
        locations={[0, 0.8]} // Adjust the gradient stops
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.overlay}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 30,
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "700",
              color: "#fff",
              fontFamily: "Kanitb",
              paddingTop: 20,
            }}
          >
            Welcome to Yonko
          </Text>

          <Text
            style={{
              paddingTop: 10,
              color: "#fff",
              fontSize: 20,
              fontWeight: "700",
              fontFamily: "Kanit",
            }}
          >
            Discover Convenience
          </Text>
        </View>

        <View style={{ gap: 10, paddingHorizontal: 10 }}>
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => onSelectAuth("Apple")}
          >
            <AntDesign name="apple1" size={24} style={defaultStyles.btnIcon} />
            <Text style={styles.btnOutlineText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => onSelectAuth("Google")}
          >
            <AntDesign name="google" size={24} style={defaultStyles.btnIcon} />
            <Text style={styles.btnOutlineText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => onSelectAuth("Email")}
          >
            <AntDesign name="google" size={24} style={defaultStyles.btnIcon} />
            <Text style={styles.btnOutlineText}>Continue with Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => onSelectAuth("Guest")}
          >
            <AntDesign name="google" size={24} style={defaultStyles.btnIcon} />
            <Text style={styles.btnOutlineText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate("(modals)/Register")} // Navigate to Register screen
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    padding: 5,
    width: "100%", // Ensure full width
  },
  btnOutline: {
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: Colors.grey,
    height: 60,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  btnOutlineText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Kanitb",
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1, // Ensure it's behind the buttons
  },
  signUpButton: {
    backgroundColor: "#d96540",
    borderRadius: 8,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
    marginHorizontal: 5,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Kanitb",
  },
});
