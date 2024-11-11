import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { useUserContext } from "../context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Info = () => {
  const { user, setUserData } = useUserContext();
  const [edit, setEdit] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [phoneNumberData, setPhoneNumberData] = useState({
    phoneNumber: "+234",
  });
  const textInputRef = useRef(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const storedData = await AsyncStorage.getItem("userData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log("Loaded User Data:", parsedData);
          console.log("Token:", token);
          setUserData(parsedData);
          setPhoneNumberData({ phoneNumber: parsedData.phone }); // Update phoneNumberData state
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setUserData((prevData) => ({
      ...prevData,
      birthDate: date.toISOString().split("T")[0],
    }));
    hideDatePicker();
  };

  const onSaveUser = async () => {
    const { name, phone, birthDate, gender, address } = user;
    console.log("User Data before saving:", user);

    try {
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      console.log("User data saved successfully");
    } catch (error) {
      console.error("Error saving user data:", error);
    }

    // Animate the message
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate back to the previous screen
      navigation.goBack();
    });
  };

  const handleChangeText = (text) => {
    // Ensure the text starts with +234 and only contains numeric characters after that
    if (text.startsWith("+234")) {
      const numericText = "+234" + text.slice(4).replace(/[^0-9]/g, ""); // Remove non-numeric characters after +234
      if (numericText.length <= 15) {
        // +234 + 11 digits = 15 characters
        setPhoneNumberData((prevData) => ({
          ...prevData,
          phoneNumber: numericText,
        }));
        setUserData((prevData) => ({
          ...prevData,
          phone: numericText,
        }));
      }
    } else {
      // If the user tries to delete the area code, reset it to +234
      setPhoneNumberData((prevData) => ({
        ...prevData,
        phoneNumber: "+234",
      }));
      setUserData((prevData) => ({
        ...prevData,
        phone: "+234",
      }));
    }
    console.log("Phone Number Data:", phoneNumberData);
  };

  const renderInput = (label, value, placeholder, keyboardType = "default") => {
    return (
      <View>
        <View style={styles.labelContainer}>
          <Ionicons name={label.icon} size={24} color="white" />
          <Text style={styles.label}>{label.text}:</Text>
        </View>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="white"
          value={user[value]}
          onChangeText={(text) =>
            setUserData((prevData) => ({
              ...prevData,
              [value]: text,
            }))
          }
          keyboardType={keyboardType}
          style={[styles.input, { color: "white" }]}
        />
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <LinearGradient
        colors={["#737373", "#d16847", "#737373"]}
        locations={[1, 0.2, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0, y: 0.7 }}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Basic Info</Text>
          <TouchableOpacity onPress={onSaveUser}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.messageText}>Info saved!</Text>
        </Animated.View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            {renderInput(
              { icon: "person-outline", text: "Name" },
              "name",
              "Name"
            )}
            {renderInput(
              { icon: "call-outline", text: "Phone Number" },
              "phone",
              "Phone Number",
              "numeric"
            )}
            {renderInput(
              { icon: "calendar-outline", text: "Date of Birth" },
              "birthDate",
              "Date of Birth"
            )}
            {renderInput(
              { icon: "transgender-outline", text: "Gender" },
              "gender",
              "Gender"
            )}
            {renderInput(
              { icon: "home-outline", text: "Street" },
              "address.street",
              "Street"
            )}
            {renderInput(
              { icon: "home-outline", text: "City" },
              "address.city",
              "City"
            )}
            {renderInput(
              { icon: "home-outline", text: "State" },
              "address.state",
              "State"
            )}
            {renderInput(
              { icon: "home-outline", text: "Country" },
              "address.country",
              "Country"
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

export default Info;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  saveButton: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)", // White with some opacity
    backgroundColor: "rgba(255, 255, 255, 0.2)", // White with some opacity
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  messageContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  messageText: {
    color: "white",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    paddingVertical: 5,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(217, 101, 64, .5)",
    padding: 5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 12,
  },
  label: {
    fontSize: 16,
    marginLeft: 5,
    color: "white",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)", // White with some opacity to match the saveButton background
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    color: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    width: "100%", // Ensure all inputs have the same width
  },
});
