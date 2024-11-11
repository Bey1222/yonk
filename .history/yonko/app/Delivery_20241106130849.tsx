import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
  FlatList,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons"; // Import AntDesign for the icon
import { useBasket } from "../context/BasketContext";
import { useUserContext } from "../context/UserContext";
import { LinearGradient } from "expo-linear-gradient";
import bagIcon from "../assets/pickup.png"; // Import the bag icon
import bicycleIcon from "../assets/bicycle.png";

const Delivery: React.FC = () => {
  const { basket } = useBasket();
  const { user } = useUserContext();
  const [groupedBasket, setGroupedBasket] = useState<{ [key: string]: any[] }>(
    {}
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [showDeliveryMessage, setShowDeliveryMessage] =
    useState<boolean>(false);
  const [showLocationMessage, setShowLocationMessage] =
    useState<boolean>(false);
  const [newAddress, setNewAddress] = useState<string>("");
  const [addresses, setAddresses] = useState<string[]>([user.address.street]);
  const [activeAddress, setActiveAddress] = useState<string>(
    user.address.street
  );
  const [showNewAddressInput, setShowNewAddressInput] =
    useState<boolean>(false);

  const pickerRef = useRef<ScrollView>(null);
  const itemWidth = Dimensions.get("window").width * 0.8; // 80% of screen width
  const newAddressHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const grouped = basket.reduce((acc, item) => {
      if (!acc[item.restaurant]) {
        acc[item.restaurant] = [];
      }
      acc[item.restaurant].push(item);
      return acc;
    }, {} as { [key: string]: any[] });

    setGroupedBasket(grouped);
  }, [basket]);

  const totalPrice = basket.reduce(
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

  const deliveryPrices = {
    Priority: 500,
    Standard: 200,
  };

  const [deliveryPrice, setDeliveryPrice] = useState(0);

  useEffect(() => {
    if (selectedOption === "Priority") {
      setDeliveryPrice(deliveryPrices.Priority);
    } else if (selectedOption === "Standard") {
      setDeliveryPrice(deliveryPrices.Standard);
    } else {
      setDeliveryPrice(0);
    }
  }, [selectedOption]);

  const taxRate = 0.075; // 7.5% tax rate
  const tax = (totalPrice + deliveryPrice) * taxRate;
  const grandTotal = totalPrice + deliveryPrice + tax;

  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleOptionPress = (option: string) => {
    setSelectedOption(option);
    if (option === "Pickup") {
      setActiveAddress("");
    } else {
      setActiveAddress(user.address.street);
    }
  };

  const locations = [
    "Location 1 (5 km)",
    "Location 2 (10 km)",
    "Location 3 (15 km)",
    "Location 4 (15 km)",
    "Location 5 (55 km)",
    "Location 6 (35 km)",
    "Location 6 (35 km)",
    "Location 6 (35 km)",
    "Location 6 (35 km)",
    "Location 6 (35 km)",
    "Location 6 (35 km)",
    "Location 6 (35 km)",
  ];

  const handleCheckoutPress = () => {
    if (!selectedOption) {
      setShowDeliveryMessage(true);
      setTimeout(() => {
        setShowDeliveryMessage(false);
      }, 2000);
    } else if (selectedOption === "Pickup" && selectedLocation === "") {
      setShowLocationMessage(true);
      setTimeout(() => {
        setShowLocationMessage(false);
      }, 2000);
    } else {
      // Handle checkout logic here
    }
  };

  const toggleNewAddressInput = () => {
    setShowNewAddressInput(!showNewAddressInput);
  };

  const handleAddNewAddress = () => {
    if (newAddress.trim()) {
      const updatedAddresses = [...addresses, newAddress];
      setAddresses(updatedAddresses);
      setActiveAddress(newAddress); // Set the newly added address as the active address
      setNewAddress("");
      toggleNewAddressInput();
    }
  };

  useEffect(() => {
    if (selectedOption === "Pickup") {
      Animated.timing(newAddressHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [selectedOption]);

  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const breakdownData = [
    { label: "Subtotal", value: totalPrice },
    { label: "Delivery", value: deliveryPrice },
    { label: "Tax", value: tax },
  ];

  return (
    <LinearGradient
      colors={["#737373", "#d16847", "#737373"]}
      locations={[1, 0.2, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 0.7 }}
      style={styles.container}
    >
      <View style={[styles.container]}>
        <View style={[, { borderRadius: 10 }]}>
          <TouchableOpacity
            style={styles.totalContainer}
            onPress={() => setShowBreakdown(!showBreakdown)}
          >
            <Text style={[styles.totalText, { color: "#FFF" }]}>
              Grand Total : ₦{grandTotal.toFixed(2)}
            </Text>
            <Ionicons
              name={showBreakdown ? "chevron-up" : "chevron-down"}
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>

          {showBreakdown && (
            <View style={styles.breakdownContainer}>
              {breakdownData.map(({ label, value }) => (
                <View key={label} style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: "#FFF" }]}>
                    {label}
                  </Text>
                  <Text style={[styles.breakdownValue, { color: "#FFF" }]}>
                    N{value.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <ScrollView
          style={styles.mainScrollView}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView style={styles.scrollView}>
            {Object.keys(groupedBasket).map((restaurant) => {
              const items = groupedBasket[restaurant];
              const restaurantLocation = items[0].restaurantLocation;
              const restaurantImageUri = items[0].restaurantImageUri;
              const restaurantTotal = items.reduce(
                (acc, item) =>
                  acc +
                  item.sizes.reduce(
                    (sum, size) => sum + size.price * size.quantity,
                    0
                  ) +
                  (item.addOns
                    ? Object.values(item.addOns).reduce(
                        (sum, addOns) =>
                          sum +
                          addOns.reduce((sum, addOn) => sum + addOn.price, 0),
                        0
                      )
                    : 0),
                0
              );

              return <View key={restaurant}></View>;
            })}
          </ScrollView>

          {addresses.map((address, index) => (
            <View
              key={index}
              style={[
                styles.addressContainer,
                activeAddress === address && styles.activeAddressContainer,
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  setActiveAddress(address);
                  if (selectedOption === "Pickup") {
                    toggleModal();
                  }
                }}
                style={[
                  styles.addressTouchable,
                  {
                    backgroundColor: "rgba(217, 101, 64, .5)",
                    elevation: 5, // For Android
                    shadowColor: "#000", // For iOS
                    shadowOffset: { width: 0, height: 2 }, // For iOS
                    shadowOpacity: 0.2, // For iOS
                    shadowRadius: 2, // For iOS
                    borderRadius: 5, // Add border radius
                  },
                ]}
              >
                <Image source={bicycleIcon} style={styles.bicycleIcon} />
                <View style={styles.addressTextContainer}>
                  <Text style={[styles.addressTitle, { color: "#FFF" }]}>
                    {index === 0 ? "Home Address" : "Temporary Address"}
                  </Text>
                  <Text style={[styles.addressText, { color: "#FFF" }]}>
                    {address}, {user.address.state}
                  </Text>
                </View>
                {activeAddress === address && (
                  <View style={styles.bulletPoint} />
                )}
              </TouchableOpacity>
            </View>
          ))}

          {selectedOption === "Pickup" && selectedLocation && (
            <View
              style={[styles.addressContainer, styles.activeAddressContainer]}
            >
              <TouchableOpacity
                style={[
                  styles.addressTouchable,
                  {
                    backgroundColor: "rgba(217, 101, 64, .5)",
                    elevation: 5, // For Android
                    shadowColor: "#000", // For iOS
                    shadowOffset: { width: 0, height: 2 }, // For iOS
                    shadowOpacity: 0.2, // For iOS
                    shadowRadius: 2, // For iOS
                    borderRadius: 5, // Add border radius
                  },
                ]}
              >
                <Image source={bagIcon} style={styles.bicycleIcon} />
                <View style={styles.addressTextContainer}>
                  <Text style={[styles.addressTitle, { color: "#FFF" }]}>
                    Pickup Location
                  </Text>
                  <Text style={[styles.addressText, { color: "#FFF" }]}>
                    {selectedLocation}
                  </Text>
                </View>
                {selectedLocation && <View style={styles.bulletPoint} />}
              </TouchableOpacity>
            </View>
          )}

          {showNewAddressInput && (
            <View
              style={[
                styles.newAddressInputContainer,
                { height: newAddressHeight },
              ]}
            >
              <View style={styles.newAddressInputWrapper}>
                <TextInput
                  style={[
                    styles.newAddressInput,
                    {
                      color: "#FFF",
                      borderColor: "#FFF",
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 10,
                    },
                  ]}
                  placeholder={`No 1 Shanks Street, ${user.address.state}`}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={newAddress}
                  onChangeText={setNewAddress}
                />
              </View>
            </View>
          )}

          {selectedOption !== "Pickup" && (
            <View style={[styles.addAddressContainer, { opacity: 1 }]}>
              <TouchableOpacity
                onPress={toggleNewAddressInput}
                style={[
                  styles.addAddressContainer,
                  {
                    backgroundColor: "rgba(217, 101, 64, .5)",
                    elevation: 5, // For Android
                    shadowColor: "#000", // For iOS
                    shadowOffset: { width: 0, height: 2 }, // For iOS
                    shadowOpacity: 0.2, // For iOS
                    shadowRadius: 2, // For iOS
                    borderRadius: 5, // Add border radius
                  },
                ]}
              >
                <Text style={[styles.addAddressText, { color: "#FFF" }]}>
                  + Add New Address
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.deliveryOptionsHeader}>Delivery Options</Text>
          <View style={styles.deliveryOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.deliveryOption,
                selectedOption === "Priority" && styles.selectedOption,
              ]}
              onPress={() => handleOptionPress("Priority")}
            >
              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  {
                    backgroundColor: "rgba(217, 101, 64, .5)",
                    elevation: 5, // For Android
                    shadowColor: "#000", // For iOS
                    shadowOffset: { width: 0, height: 2 }, // For iOS
                    shadowOpacity: 0.2, // For iOS
                    shadowRadius: 2, // For iOS
                    borderRadius: 5, // Add border radius
                  },
                ]}
              >
                <Image source={bicycleIcon} style={styles.icon} />
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionText, { color: "#FFF" }]}>
                    Priority
                  </Text>
                  <Text style={[styles.optionSubText, { color: "#FFF" }]}>
                    20 - 30 minutes
                  </Text>
                </View>
                <View style={styles.priceBulletContainer}>
                  <Text style={[styles.optionPrice, { color: "#FFF" }]}>
                    ₦{deliveryPrices.Priority}
                  </Text>
                  {selectedOption === "Priority" && (
                    <View style={styles.bulletPoint} />
                  )}
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deliveryOption,
                selectedOption === "Standard" && styles.selectedOption,
              ]}
              onPress={() => handleOptionPress("Standard")}
            >
              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  {
                    backgroundColor: "rgba(217, 101, 64, .5)",
                    elevation: 5, // For Android
                    shadowColor: "#000", // For iOS
                    shadowOffset: { width: 0, height: 2 }, // For iOS
                    shadowOpacity: 0.2, // For iOS
                    shadowRadius: 2, // For iOS
                    borderRadius: 5, // Add border radius
                  },
                ]}
              >
                <Image source={bicycleIcon} style={styles.icon} />
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionText, { color: "#FFF" }]}>
                    Standard
                  </Text>
                  <Text style={[styles.optionSubText, { color: "#FFF" }]}>
                    20 - 30 minutes
                  </Text>
                </View>
                <View style={styles.priceBulletContainer}>
                  <Text style={[styles.optionPrice, { color: "#FFF" }]}>
                    ₦{deliveryPrices.Standard}
                  </Text>
                  {selectedOption === "Standard" && (
                    <View style={styles.bulletPoint} />
                  )}
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deliveryOption,
                selectedOption === "Pickup" && styles.selectedOption,
              ]}
              onPress={() => {
                handleOptionPress("Pickup");
                toggleModal(); // Show the modal immediately
              }}
            >
              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  {
                    backgroundColor: "rgba(217, 101, 64, .5)",
                    elevation: 5, // For Android
                    shadowColor: "#000", // For iOS
                    shadowOffset: { width: 0, height: 2 }, // For iOS
                    shadowOpacity: 0.2, // For iOS
                    shadowRadius: 2, // For iOS
                    borderRadius: 5, // Add border radius
                  },
                ]}
              >
                <Image source={bagIcon} style={styles.icon} />
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionText, { color: "#FFF" }]}>
                    Pickup at nearest location
                  </Text>
                  <Text style={[styles.optionSubText, { color: "#FFF" }]}>
                    Select Location
                  </Text>
                </View>
                {selectedOption === "Pickup" && (
                  <View style={styles.bulletPoint} />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckoutPress}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Pay</Text>
          </TouchableOpacity>
        </ScrollView>

        {showDeliveryMessage && (
          <View style={[styles.deliveryMessage]}>
            <Text style={styles.deliveryMessageText}>
              Please select a delivery option
            </Text>
          </View>
        )}

        {showLocationMessage && (
          <View style={[styles.deliveryMessage]}>
            <Text style={styles.deliveryMessageText}>
              Please select a location
            </Text>
          </View>
        )}

        {showNewAddressInput && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleAddNewAddress}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={toggleModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                onPress={toggleModal}
                style={styles.backIconContainer}
              >
                <AntDesign
                  name="down"
                  size={24}
                  color="white"
                  style={styles.downArrow}
                />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Location</Text>
              <FlatList
                data={locations}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedLocation(item);
                      setActiveAddress(item);
                      toggleModal();
                    }}
                  >
                    <Text style={styles.modalItemName}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
};

export default Delivery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 25,
    paddingHorizontal: 10,
  },
  totalContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "green",
    borderRadius: 10,
    shadowColor: "rgba(0, 0, 0, 0.8)",

    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3.84,
    elevation: 2,
  },
  totalText: {
    fontSize: 18,
    fontFamily: "Kanitb",
    paddingVertical: 15,
    padding: 5,
    borderRadius: 5,
    textAlign: "center",
  },
  breakdownContainer: {
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    backgroundColor: "rgba(217, 101, 64, .5)",

    shadowColor: "rgba(0, 0, 0, 0.8)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3.84,
    elevation: 2,
    marginTop: 10,
  },

  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  breakdownLabel: {
    fontSize: 16,
    fontFamily: "Kanit",
  },
  breakdownValue: {
    fontSize: 16,
    fontFamily: "Kanit",
  },

  breakdownText: {
    fontSize: 16,
    fontFamily: "Kanit",
    marginBottom: 5,
  },
  mainScrollView: {
    flex: 1,
    paddingHorizontal: 10,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 0, // Remove border width
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    position: "relative",
  },
  activeAddressContainer: {
    borderColor: "green",
  },
  addressTouchable: {
    flex: 1,
  },
  bicycleIcon: {
    width: 30,
    height: 30,
    position: "absolute",
    left: 10,
    top: 10,
  },
  bicycleIconAbove: {
    width: 30,
    height: 30,
    alignSelf: "center",
    marginBottom: 20,
  },
  addressTextContainer: {
    marginLeft: 50, // Adjust to ensure text doesn't overlap with the icon
  },
  addressTitle: {
    fontSize: 16,
    fontFamily: "Kanitb",
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    fontFamily: "Kanit",
  },
  addAddressContainer: {
    padding: 10,
    borderWidth: 0, // Remove border width
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  addAddressText: {
    fontSize: 14,
    fontFamily: "Kanit",
    color: "#007BFF",
  },
  newAddressInputContainer: {
    borderWidth: 0, // Remove border width
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    overflow: "hidden",
  },
  newAddressInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 0,
    marginBottom: 10,
    padding: 5,
    paddingHorizontal: 15,
  },
  newAddressInput: {
    flex: 1,
    paddingHorizontal: 7,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  doneButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Kanitb",
  },
  scrollView: {
    maxHeight: 200, // Adjust the height as needed
  },
  restaurantContainer: {
    marginBottom: 20,
  },
  restaurantName: {
    fontSize: 18,
    fontFamily: "Kanitb",
    marginBottom: 10,
  },
  restaurantLocation: {
    fontSize: 16,
    fontFamily: "Kanit",
    marginBottom: 10,
  },
  deliveryOptionsContainer: {
    marginTop: 20,
  },
  deliveryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderWidth: 0, // Remove border width
    borderColor: "#ccc",
    borderRadius: 5,

    justifyContent: "space-between",
  },
  selectedOption: {
    borderColor: "green",
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  optionTextContainer: {
    flex: 1,
    justifyContent: "center", // Center vertically
  },
  optionText: {
    fontSize: 14,
    fontFamily: "Kanit",
  },
  optionSubText: {
    fontSize: 12,
    fontFamily: "Kanit",
    color: "#666",
  },
  optionPrice: {
    fontSize: 12,
    fontFamily: "Kanit",
    color: "#666",
    marginRight: 5,
  },
  priceBulletContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bulletPoint: {
    width: 10,
    height: 10,
    backgroundColor: "green",
    borderRadius: 100,
    position: "absolute",
    right: 10,
    top: 20,
    borderWidth: 1.5,
    borderColor: "#fff",
    padding: 5,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  pickerScrollView: {
    maxHeight: 80,
  },
  pickerItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 0, // Remove border width
    marginHorizontal: 5,
    backgroundColor: "#ccc", // Add a background color for better visibility of shadows

    // For Android
    elevation: 5,

    // For iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  selectedPickerItem: {
    borderColor: "green",
    color: "#000",
  },
  pickerItemText: {
    fontSize: 14,
    fontFamily: "Kanit",
  },
  selectedLocationContainer: {
    padding: 10,
    borderWidth: 0, // Remove border width
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
  },
  selectedLocationTitle: {
    fontSize: 16,
    fontFamily: "Kanitb",
    marginBottom: 5,
  },
  selectedLocationText: {
    fontSize: 14,
    fontFamily: "Kanit",
  },
  checkoutButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Kanitb",
  },
  deliveryMessage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    alignItems: "center",
  },
  deliveryMessageText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Kanitb",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, .8)",
    padding: 20,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    height: 200, // Set a fixed height for the modal content
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Kanitb",
    marginBottom: 10,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#d9d9d9",
    width: "100%",
  },
  modalItemName: {
    fontSize: 18,
    fontFamily: "Kanitb",
  },
  modalItemPrice: {
    fontSize: 16,
    fontFamily: "Kanit",
  },
  modalTotalSeparator: {
    borderTopWidth: 1,
    borderColor: "#d9d9d9",
    marginVertical: 30,
  },
  modalTotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  modalTotalText: {
    fontSize: 20,
    fontFamily: "Kanitb",
  },
  deliveryOptionsHeader: {
    fontSize: 20,
    fontFamily: "Kanitb",
    marginBottom: 10,
    color: "#FFF",
    alignSelf: "center",
  },
  backIconContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(217, 101, 64, 1)",
    borderRadius: 100,
  },
  downArrow: {
    padding: 5,
  },
});
