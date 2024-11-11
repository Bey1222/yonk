import {
  StyleSheet,
  Text,
  View,
  Image,
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
  const { userData, setUserData } = useUserContext();
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
        const storedData = await AsyncStorage.getItem("userData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log("Loaded User Data:", parsedData);
          setUserData(parsedData);
          setPhoneNumberData({ phoneNumber: parsedData.phoneNumber }); // Update phoneNumberData state
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
      dob: date.toISOString().split("T")[0],
    }));
    hideDatePicker();
  };

  const onSaveUser = async () => {
    const { dob, phoneNumber, address, state, firstName, lastName } = userData;
    console.log("User Data before saving:", userData);

    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
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
          phoneNumber: numericText,
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
        phoneNumber: "+234",
      }));
    }
    console.log("Phone Number Data:", phoneNumberData);
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
            {userData.image && (
              <Image source={{ uri: userData.image }} style={styles.avatar} />
            )}
            <View style={styles.labelContainer}>
              <Ionicons name="person-outline" size={24} color="white" />
              <Text style={styles.label}>Name:</Text>
            </View>
            {!edit && (
              <View style={styles.editRow}>
                <Text style={[styles.name, styles.input]}>
                  {userData.firstName} {userData.lastName}
                </Text>
                <TouchableOpacity onPress={() => setEdit(true)}>
                  <Ionicons name="create-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            )}
            {edit && (
              <View style={styles.editRow}>
                <TextInput
                  placeholder="First Name"
                  placeholderTextColor="white"
                  value={userData.firstName}
                  onChangeText={(text) =>
                    setUserData((prevData) => ({
                      ...prevData,
                      firstName: text,
                    }))
                  }
                  style={[styles.input, { color: "white" }]}
                />
                <TextInput
                  placeholder="Last Name"
                  placeholderTextColor="white"
                  value={userData.lastName}
                  onChangeText={(text) =>
                    setUserData((prevData) => ({
                      ...prevData,
                      lastName: text,
                    }))
                  }
                  style={[styles.input, { color: "white" }]}
                />
                <TouchableOpacity onPress={onSaveUser}>
                  <Ionicons name="checkmark-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.labelContainer}>
              <Ionicons name="mail-outline" size={24} color="white" />
              <Text style={styles.label}>Email:</Text>
            </View>
            <Text style={[styles.email, styles.input]}>{userData.email}</Text>
            <View style={styles.labelContainer}>
              <Ionicons name="calendar-outline" size={24} color="white" />
              <Text style={styles.label}>Date of Birth (DOB):</Text>
            </View>
            <View style={styles.dobContainer}>
              <TouchableOpacity
                onPress={showDatePicker}
                style={[styles.input, { color: "white" }]}
              >
                <TextInput
                  placeholder="Date of Birth"
                  placeholderTextColor="white"
                  value={userData.dob}
                  editable={false}
                  style={{ color: "#fff" }}
                />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </View>
            <View style={styles.labelContainer}>
              <Ionicons name="call-outline" size={24} color="white" />
              <Text style={styles.label}>Phone Number:</Text>
            </View>
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="white"
              value={phoneNumberData.phoneNumber}
              onChangeText={handleChangeText}
              keyboardType="numeric"
              style={[styles.input, { color: "white" }]}
              selection={{
                start: phoneNumberData.phoneNumber.length,
                end: phoneNumberData.phoneNumber.length,
              }} // Control the cursor position
              onSelectionChange={(event) => {
                const {
                  nativeEvent: { selection },
                } = event;
                if (selection.start < 4 || selection.end < 4) {
                  // Prevent the user from selecting or deleting the area code
                  textInputRef.current.setNativeProps({
                    selection: { start: 4, end: 4 },
                  });
                }
              }}
              ref={textInputRef} // Create a reference to the TextInput
            />
            <View style={styles.labelContainer}>
              <Ionicons name="home-outline" size={24} color="white" />
              <Text style={styles.label}>Address:</Text>
            </View>
            <TextInput
              placeholder="Full Address"
              placeholderTextColor="white"
              value={userData.address}
              onChangeText={(text) =>
                setUserData((prevData) => ({
                  ...prevData,
                  address: text,
                }))
              }
              style={[styles.input, { color: "white" }]}
            />
            <View style={styles.labelContainer}>
              <Ionicons name="location-outline" size={24} color="white" />
              <Text style={styles.label}>State:</Text>
            </View>
            <RNPickerSelect
              placeholder={{ label: "Select a state...", value: null }}
              value={userData.state}
              onValueChange={(value) =>
                setUserData((prevData) => ({
                  ...prevData,
                  state: value,
                }))
              }
              items={[
                { label: "Abia", value: "AB" },
                { label: "Adamawa", value: "AD" },
                { label: "Akwa Ibom", value: "AK" },
                { label: "Anambra", value: "AN" },
                { label: "Bauchi", value: "BA" },
                { label: "Bayelsa", value: "BY" },
                { label: "Benue", value: "BE" },
                { label: "Borno", value: "BO" },
                { label: "Cross River", value: "CR" },
                { label: "Delta", value: "DE" },
                { label: "Ebonyi", value: "EB" },
                { label: "Edo", value: "ED" },
                { label: "Ekiti", value: "EK" },
                { label: "Enugu", value: "EN" },
                { label: "Gombe", value: "GO" },
                { label: "Imo", value: "IM" },
                { label: "Jigawa", value: "JI" },
                { label: "Kaduna", value: "KD" },
                { label: "Kano", value: "KN" },
                { label: "Katsina", value: "KT" },
                { label: "Kebbi", value: "KE" },
                { label: "Kogi", value: "KO" },
                { label: "Kwara", value: "KW" },
                { label: "Lagos", value: "LA" },
                { label: "Nasarawa", value: "NA" },
                { label: "Niger", value: "NI" },
                { label: "Ogun", value: "OG" },
                { label: "Ondo", value: "ON" },
                { label: "Osun", value: "OS" },
                { label: "Oyo", value: "OY" },
                { label: "Plateau", value: "PL" },
                { label: "Rivers", value: "RI" },
                { label: "Sokoto", value: "SO" },
                { label: "Taraba", value: "TA" },
                { label: "Yobe", value: "YO" },
                { label: "Zamfara", value: "ZA" },
                { label: "FCT", value: "FC" },
              ]}
              style={{
                inputIOS: [styles.picker, { color: "white" }],
                inputAndroid: [styles.picker, { color: "white" }],
              }}
            />
            <View style={[styles.labelContainer, styles.additionalInfoLabel]}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="white"
              />
              <Text style={styles.label}>Additional Information:</Text>
            </View>
            <TextInput
              placeholder="Additional Information"
              placeholderTextColor="white"
              value={userData.additionalInfo}
              onChangeText={(text) =>
                setUserData((prevData) => ({
                  ...prevData,
                  additionalInfo: text,
                }))
              }
              style={[
                styles.input,
                styles.noBorder,
                styles.additionalInfoInput,
              ]}
            />
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
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
  name: {
    fontSize: 18,
  },
  email: {
    fontSize: 18,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
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
  picker: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
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
  noBorder: {
    borderBottomWidth: 0,
  },
  dobContainer: {
    flexDirection: "row",
    alignItems: "center",

    width: "100%", // Ensure the date of birth container has the same width as the rest
  },
  additionalInfoLabel: {
    opacity: 0,
  },
  additionalInfoInput: {
    opacity: 0,
  },
});
