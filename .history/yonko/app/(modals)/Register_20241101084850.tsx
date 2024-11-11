import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Register = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(true);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      console.log(
        `Attempting to login with email: ${email} and password: ${password}`
      );

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/user/login`,
        {
          email,
          password,
        }
      );

      console.log("Login response:", response.data);

      const token = response.data.user.token; // Extract the token from the user object
      console.log("Login token:", token); // Debug log

      if (token) {
        setMessage(`Hey ${response.data.user.name}, welcome back!`);
        setUserName(response.data.user.name);
        setToken(token); // Store the token
        await AsyncStorage.setItem("token", token); // Save the token to AsyncStorage
        setIsAuthenticated(true); // Update the authentication state
        console.log("Login successful, navigating to (tabs)");
        navigation.navigate("(tabs)"); // Use the correct route name
        setIsModalVisible(true); // Show the modal
      } else {
        setMessage("Error: Token is undefined");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      if (error.response) {
        setMessage(
          `Error logging in: ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        setMessage("Error logging in: No response received from the server");
      } else if (error.code === "ECONNABORTED") {
        setMessage("Error logging in: Request timeout");
      } else {
        setMessage("Error logging in: " + error.message);
      }
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/user/register`,
        {
          email,
        }
      );

      const token = response.data.data.token; // Extract the token from the response
      console.log("Registration token:", token); // Debug log

      if (token) {
        setMessage(response.data.message);
        setToken(token); // Store the token
        await AsyncStorage.setItem("token", token); // Save the token to AsyncStorage
        setIsAuthenticated(true); // Update the authentication state
        console.log("Registration successful, navigating to (tabs)");
        navigation.navigate("(tabs)"); // Navigate to the home screen
        setIsModalVisible(true); // Show the modal
      } else {
        setMessage("Error: Token is undefined");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setMessage("Error registering user");
    }
  };

  // Other handlers...

  return (
    <LinearGradient
      colors={["#737373", "rgba(52,18,9,.9)", "#737373"]}
      locations={[1, 0.2, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.7 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        {isRegistering ? (
          <View>
            {!isVerifyingOtp ? (
              <View>
                <Text style={styles.header}>Registration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Button title="Register" onPress={handleRegister} />
              </View>
            ) : (
              <View>
                {!isSettingPassword ? (
                  <View>
                    <Text style={styles.header}>Verify OTP</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="OTP"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                    />
                    <Button title="Verify OTP" onPress={handleVerifyOtp} />
                    <Button title="Resend OTP" onPress={handleResendOtp} />
                  </View>
                ) : (
                  <View>
                    {!isUpdatingProfile ? (
                      <View>
                        <Text style={styles.header}>Set Password</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Password"
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry
                        />
                        <Button
                          title="Set Password"
                          onPress={handleSetPassword}
                        />
                      </View>
                    ) : (
                      <View>
                        <Text style={styles.header}>Update Profile</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Name"
                          value={name}
                          onChangeText={setName}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Phone"
                          value={phone}
                          onChangeText={setPhone}
                          keyboardType="phone-pad"
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Birth Date"
                          value={birthDate}
                          onChangeText={setBirthDate}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Gender"
                          value={gender}
                          onChangeText={setGender}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Street"
                          value={street}
                          onChangeText={setStreet}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="City"
                          value={city}
                          onChangeText={setCity}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="State"
                          value={state}
                          onChangeText={setState}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Country"
                          value={country}
                          onChangeText={setCountry}
                        />
                        <Button
                          title="Save Data"
                          onPress={handleUpdateProfile}
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.header}>Login</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} />
            <Text style={styles.link} onPress={() => setIsRegistering(true)}>
              New user? Sign up now
            </Text>
          </View>
        )}
        <Button
          title={isRegistering ? "Switch to Login" : "Switch to Register"}
          onPress={() => setIsRegistering(!isRegistering)}
        />
        {message && <Text style={styles.message}>{message}</Text>}
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Login Successful</Text>
            <Text>Token: {token}</Text>
            <Text>Name: {userName}</Text>
            <Button title="Close" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: "100%",
    fontSize: 16,
  },
  link: {
    color: "blue",
    marginTop: 20,
    textAlign: "center",
  },
  message: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});
