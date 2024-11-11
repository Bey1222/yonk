import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import {
  useColorScheme,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import { ThemeProvider, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import CustomSplashScreen from "./CustomSplashScreen"; // Import the custom splash screen component
import Login from "./(modals)/Login";
import OrdersScreen from "./(tabs)/orders";
import ProfileScreen from "./(tabs)/profile";
import WishlistScreen from "./(tabs)/wishlist";
import Colors from "../constants/Colors";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import HomeScreen from "./(tabs)/index"; // Import the HomeScreen component
import ExploreScreen from "./(tabs)/mhome"; // Import the ExploreScreen component
import { CustomDarkTheme, CustomLightTheme } from "../constants/ColorThemes"; // Import custom themes
import StoreFront from "./StoreFront"; // Import the StoreFront component
import StoreFrontSupermarket from "./StoreFrontSupermarket";
import StoreFrontTech from "./StoreFrontTech";
import StoreFrontWardrobe from "./StoreFrontWardrobe";
import StoreFrontHousehold from "./StoreFrontHousehold";
import SearchFood from "./SearchFood";
import SearchPharmacy from "./SearchPharmacy";
import SearchSupermarket from "./SearchSupermarket";
import SearchTech from "./SearchTech";
import SearchWardrobe from "./SearchWardrobe";
import SearchSpaBeauty from "./SearchSpaBeauty";
import SearchHousehold from "./SearchHousehold";
import SearchPetSupplies from "./SearchPetSupplies";
import SearchPlants from "./SearchPlants";
import MainstoreFood from "./MainstoreFood";
import MainstorePharmacy from "./MainstorePharmacy";
import MainstoreSupermarket from "./MainstoreSupermarket";
import MainstoreTech from "./MainstoreTech";
import MainstoreWardrobe from "./MainstoreWardrobe";
import MainstoreSpaBeauty from "./MainstoreSpaBeauty";
import MainstoreHousehold from "./MainstoreHousehold";
import MainstorePetSupplies from "./MainstorePetSupplies";
import MainstorePlants from "./MainstorePlants";
import FoodProducts from "./FoodProducts";
import ViewOrderScreen from "./ViewOrderScreen";
import { BasketProvider, useBasket } from "../context/BasketContext"; // Import the BasketContext
import { WishlistProvider } from "../context/WishlishContext"; // Import the WishlistProvider
import Delivery from "./Delivery";
import PharmacyProducts from "./PharmacyProducts";
import SupernarketProducts from "./SupernarketProducts";
import TechProducts from "./TechProducts";
import SpaBeautyProducts from "./SpaBeautyProducts";
import WardrobeProducts from "./WardrobeProducts";
import HouseholdProducts from "./HouseholdProducts";
import PetSuppliesProducts from "./PetSuppliesProducts";
import PlantsProducts from "./PlantsProducts";
import Info from "./Info";
import { UserProvider } from "../context/UserContext";
import MyPackages from "./MyPackages";
import Inbox from "./Inbox";
import MessageModal from "./MessageModal";
import Others from "./Others";
import RatingsAndReviews from "./RatingsAndReviews";
import RateApp from "./RateApp";
import SectionProducts from "./SectionProducts";
import DiscountsScreen from "./DiscountsScreen";
import BestSellersScreen from "./BestSellersScreen";
import PopularNearYouScreen from "./PopularNearYouScreen";
import NewArrivalsScreen from "./NewArrivalsScreen";
import NewarrivalsPharmacy from "./NewarrivalsPharmacy";
import TopPharmacies from "./TopPharmacies";
import BestsellersPharmacy from "@/app/BestsellersPharmacy";
import DiscountsPharmacy from "./DiscountsPharmacy";
import BestsellersGroceries from "./BestsellersSupermarket";
import BestGroceries from "./BestGroceries";
import NewarrivalsGrocries from "./NewarrivalsSupermarket";
import NewarrivalsSupermarket from "./NewarrivalsSupermarket";
import BestsellersSupermarket from "./BestsellersSupermarket";
import DiscountSupermarket from "./DiscountSupermarket";
import LatestGadgets from "./LatestGadgets";
import DiscountTech from "./DiscountTech";
import BestsellersTech from "./BestsellersTech";
import NewarrivalsTech from "./NewarrivalsTech";
import NewArrivalsWardrobe from "./NewArrivalsWardrobe";
import BestSellersWardrobe from "./BestSellersWardrobe";
import DiscountWardrobe from "./DiscountWardrobe";
import TrendingFashion from "./TrendingFashion";
import NewarrivalsSpaBeauty from "./NewarrivalsSpaBeauty";
import BestsellersSpaBeauty from "./BestsellersSpaBeauty";
import DiscountSpaBeauty from "./DiscountSpaBeauty";
import RelaxingSpas from "./RelaxingSpas";
import NewarrivalsHousehold from "./NewarrivalsHousehold";
import EssentialItems from "./EssentialItems";
import DiscountHousehold from "./DiscountHousehold";
import BestsellersHousehold from "./BestsellersHousehold";
import NewarrivalsPetSupplies from "./NewarrivalsPetSupplies";
import BestsellersPetSupplies from "./BestsellersPetSupplies";
import DiscountPetSupplies from "./DiscountPetSupplies";
import PetCare from "./PetCare";
import NewarrivalsPlants from "./NewarrivalsPlants";
import BestsellersPlants from "./BestsellersPlants";
import DiscountPlants from "./DiscountPlants";
import GreenThumbPicks from "./GreenThumbPicks";
import AiChat from "./AiChat";
import SeeMoreScreen from "./SeeMoreScreen";
import FastFoodScreen from "./FastFoodScreen";
import AlcoholScreen from "./AlcoholScreen";
import LocalDishesScreen from "./LocalDishesScreen";
import HealthyScreen from "./HealthyScreen";
import PrescriptionDrugsScreen from "./PrescriptionDrugsScreen";
import FirstAidKitsScreen from "./FirstAidKitsScreen";
import ProteinShakesScreen from "./ProteinShakesScreen";
import PowerBarsScreen from "./PowerBarsScreen";
import BakeryScreen from "./BakeryScreen";
import MeatSeafoodScreen from "./MeatSeafoodScreen";
import DairyEggsScreen from "./DairyEggsScreen";
import FreshProduceScreen from "./FreshProduceScreen";
import SmartphonesScreen from "./SmartphonesScreen";
import LaptopsScreen from "./LaptopsScreen";
import SmartHomeScreen from "./SmartHomeScreen";
import GamingScreen from "./GamingScreen";
import MensClothingScreen from "./MensClothingScreen";
import WomensClothingScreen from "./WomensClothingScreen";
import KidsClothingScreen from "./KidsClothingScreen";
import AccessoriesScreen from "./AccessoriesScreen";
import SkincareScreen from "./SkincareScreen";
import MakeupScreen from "./MakeupScreen";
import HairCareScreen from "./HairCareScreen";
import NailCareScreen from "./NailCareScreen";
import CleaningSuppliesScreen from "./CleaningSuppliesScreen";
import KitchenwareScreen from "./KitchenwareScreen";
import BedBathScreen from "./BedBathScreen";
import HomeDecorScreen from "./HomeDecorScreen";
import DogFoodScreen from "./DogFoodScreen";
import PetToysScreen from "./PetToysScreen";
import CatFoodScreen from "./CatFoodScreen";
import PetAccessoriesScreen from "./PetAccessoriesScreen";
import SucculentsScreen from "./SucculentsScreen";
import HerbsScreen from "./HerbsScreen";
import FernsScreen from "./FernsScreen";
import FloweringPlantsScreen from "./FloweringPlantsScreen";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Register from "./(modals)/Register";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SourceSans: require("../assets/Font/SourceSans.ttf"),
    Kanit: require("../assets/Font/fonts/Kanit-Regular.ttf"),
    Kanitsb: require("../assets/Font/fonts/Kanit-SemiBold.ttf"),
    Kanitb: require("../assets/Font/fonts/Kanit-ExtraBold.ttf"),
    ...FontAwesome.font,
  });

  const [isSplashReady, setIsSplashReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        setIsSplashReady(true);
      }, 2000); // Simulate a delay for the splash screen
    }
  }, [loaded]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, []);

  if (!isSplashReady) {
    return <CustomSplashScreen />;
  }

  return (
    <NavigationContainer independent={true}>
      <UserProvider>
        <BasketProvider>
          <WishlistProvider>
            <RootLayoutNav
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
          </WishlistProvider>
        </BasketProvider>
      </UserProvider>
    </NavigationContainer>
  );
}

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { basket } = useBasket(); // Use the BasketContext
  const uniqueRestaurants = [...new Set(basket.map((item) => item.restaurant))];

  return (
    <View style={styles.tabBarParent}>
      <View style={styles.tabBarContainer}>
        <BlurView intensity={20} style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[styles.tabItem, isFocused && styles.tabItemActive]}
              >
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    size: 24,
                    color: isFocused ? "#FFFFFF" : Colors.gray,

                    // Change active color to white
                  })}
                {route.name === "Orders" && uniqueRestaurants.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {uniqueRestaurants.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
};

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarLabelStyle: { fontFamily: "Kanitsb" },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color }) => (
            <Entypo name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="store" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color }) => (
            <Entypo name="shopping-basket" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color }) => (
            <AntDesign name="hearto" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

function RootLayoutNav({ isAuthenticated, setIsAuthenticated }) {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [setIsAuthenticated]);

  console.log("isAuthenticated:", isAuthenticated);

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme}
    >
      <NavigationContainer independent={true}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            // Authenticated Routes
            <>
              <Stack.Screen
                name="(tabs)"
                component={HomeTabs}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="SeeMoreScreen"
                component={SeeMoreScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="SectionProducts"
                component={SectionProducts}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="DiscountsScreen"
                component={DiscountsScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="FastFoodScreen"
                component={FastFoodScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="LocalDishesScreen"
                component={LocalDishesScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="AlcoholScreen"
                component={AlcoholScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="HealthyScreen"
                component={HealthyScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="PopularNearYouScreen"
                component={PopularNearYouScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="NewArrivalsScreen"
                component={NewArrivalsScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="DiscountsPharmacy"
                component={DiscountsPharmacy}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="PrescriptionDrugsScreen"
                component={PrescriptionDrugsScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="FirstAidKitsScreen"
                component={FirstAidKitsScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="ProteinShakesScreen"
                component={ProteinShakesScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="PowerBarsScreen"
                component={PowerBarsScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="TopPharmacies"
                component={TopPharmacies}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="NewarrivalsPharmacy"
                component={NewarrivalsPharmacy}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="BestGroceries"
                component={BestGroceries}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="DiscountSupermarket"
                component={DiscountSupermarket}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="BakeryScreen"
                component={BakeryScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="MeatSeafoodScreen"
                component={MeatSeafoodScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="DairyEggsScreen"
                component={DairyEggsScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="FreshProduceScreen"
                component={FreshProduceScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="NewarrivalsSupermarket"
                component={NewarrivalsSupermarket}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="LatestGadgets"
                component={LatestGadgets}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="DiscountTech"
                component={DiscountTech}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="SmartphonesScreen"
                component={SmartphonesScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="LaptopsScreen"
                component={LaptopsScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="SmartHomeScreen"
                component={SmartHomeScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="GamingScreen"
                component={GamingScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="NewarrivalsTech"
                component={NewarrivalsTech}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="TrendingFashion"
                component={TrendingFashion}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="DiscountWardrobe"
                component={DiscountWardrobe}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="MensClothingScreen"
                component={MensClothingScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="WomensClothingScreen"
                component={WomensClothingScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="KidsClothingScreen"
                component={KidsClothingScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="AccessoriesScreen"
                component={AccessoriesScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="NewArrivalsWardrobe"
                component={NewArrivalsWardrobe}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="RelaxingSpas"
                component={RelaxingSpas}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="DiscountSpaBeauty"
                component={DiscountSpaBeauty}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="SkincareScreen"
                component={SkincareScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="MakeupScreen"
                component={MakeupScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="NailCareScreen"
                component={NailCareScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="HairCareScreen"
                component={HairCareScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="NewarrivalsSpaBeauty"
                component={NewarrivalsSpaBeauty}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="EssentialItems"
                component={EssentialItems}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="DiscountHousehold"
                component={DiscountHousehold}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="CleaningSuppliesScreen"
                component={CleaningSuppliesScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="KitchenwareScreen"
                component={KitchenwareScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="BedBathScreen"
                component={BedBathScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="HomeDecorScreen"
                component={HomeDecorScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="NewarrivalsHousehold"
                component={NewarrivalsHousehold}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="PetCare"
                component={PetCare}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="DiscountPetSupplies"
                component={DiscountPetSupplies}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="DogFoodScreen"
                component={DogFoodScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="CatFoodScreen"
                component={CatFoodScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="PetToysScreen"
                component={PetToysScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="PetAccessoriesScreen"
                component={PetAccessoriesScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="NewarrivalsPetSupplies"
                component={NewarrivalsPetSupplies}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="GreenThumbPicks"
                component={GreenThumbPicks}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="DiscountPlants"
                component={DiscountPlants}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="SucculentsScreen"
                component={SucculentsScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="FloweringPlantsScreen"
                component={FloweringPlantsScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="HerbsScreen"
                component={HerbsScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="FernsScreen"
                component={FernsScreen}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="NewarrivalsPlants"
                component={NewarrivalsPlants}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="StoreFront"
                component={StoreFront}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="StoreFrontSupermarket"
                component={StoreFrontSupermarket}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="StoreFrontTech"
                component={StoreFrontTech}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="StoreFrontWardrobe"
                component={StoreFrontWardrobe}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="StoreFrontHousehold"
                component={StoreFrontHousehold}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="SearchFood"
                component={SearchFood}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="SearchPharmacy"
                component={SearchPharmacy}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="SearchSupermarket"
                component={SearchSupermarket}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="SearchTech"
                component={SearchTech}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="SearchWardrobe"
                component={SearchWardrobe}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="SearchSpaBeauty"
                component={SearchSpaBeauty}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="SearchHousehold"
                component={SearchHousehold}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="SearchPetSupplies"
                component={SearchPetSupplies}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="SearchPlants"
                component={SearchPlants}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="MainstoreFood"
                component={MainstoreFood}
                options={{
                  headerShown: false,

                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="MainstorePharmacy"
                component={MainstorePharmacy}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="MainstoreSupermarket"
                component={MainstoreSupermarket}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="MainstoreTech"
                component={MainstoreTech}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="MainstoreWardrobe"
                component={MainstoreWardrobe}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="MainstoreSpaBeauty"
                component={MainstoreSpaBeauty}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="MainstoreHousehold"
                component={MainstoreHousehold}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="MainstorePetSupplies"
                component={MainstorePetSupplies}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />
              <Stack.Screen
                name="MainstorePlants"
                component={MainstorePlants}
                options={{
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="FoodProducts"
                component={FoodProducts}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="PharmacyProducts"
                component={PharmacyProducts}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="SupernarketProducts"
                component={SupernarketProducts}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="TechProducts"
                component={TechProducts}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="SpaBeautyProducts"
                component={SpaBeautyProducts}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="WardrobeProducts"
                component={WardrobeProducts}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="HouseholdProducts"
                component={HouseholdProducts}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="PetSuppliesProducts"
                component={PetSuppliesProducts}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="PlantsProducts"
                component={PlantsProducts}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="ViewOrderScreen"
                component={ViewOrderScreen}
                options={{
                  presentation: "modal",
                  headerShown: false,

                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="Delivery"
                component={Delivery}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="Info"
                component={Info}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="MyPackages"
                component={MyPackages}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="Inbox"
                component={Inbox}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="MessageModal"
                component={MessageModal}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="Others"
                component={Others}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="RatingsAndReviews"
                component={RatingsAndReviews}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="RateApp"
                component={RateApp}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="AiChat"
                component={AiChat}
                options={{
                  presentation: "modal",
                  headerShown: false,
                  headerTitleStyle: {
                    fontFamily: "Kanitsb",
                  },
                }}
              />

              <Stack.Screen
                name="Register"
                component={Register}
                options={{
                  headerShown: false,
                  headerTitleStyle: { fontFamily: "Kanitsb" },
                }}
              />
            </>
          ) : (
            // Unauthenticated Routes
            <>
              <Stack.Screen
                name="Login"
                component={Login}
                options={{
                  headerShown: false,
                  headerTitleStyle: { fontFamily: "Kanitsb" },
                }}
              />
              <Stack.Screen
                name="Register"
                component={(props) => (
                  <Register
                    {...props}
                    setIsAuthenticated={setIsAuthenticated}
                  />
                )}
                options={{
                  headerShown: false,
                  headerTitleStyle: { fontFamily: "Kanitsb" },
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabBarParent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 45, // Adjust the height as needed
    zIndex: 1, // Ensure the parent component is above other content
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0, // Ensure the blur is below the tabBar
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2, // Ensure the tabBar is above the blur
  },
  tabBar: {
    flexDirection: "row",
    width: "65%", // Adjust the width as needed
    borderRadius: 80,
    shadowColor: "#d9d9d9",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 2,
    paddingHorizontal: 20,
    paddingVertical: 15,
    opacity: 0.95,
    overflow: "hidden", // Ensure the border radius is applied correctly
    backgroundColor: "rgba(217, 101, 64, .8)",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Change this to your desired background color
    borderRadius: 50, // Assuming the width and height are 100
    width: 80, // Set the width and height to the same value
    height: 45, // Set the width and height to the same value
    padding: 5,
    shadowColor: "#d9d9d9",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3.84,
    elevation: 12,
  },
  badge: {
    position: "absolute",
    top: -10,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Kanitb",
  },
});
