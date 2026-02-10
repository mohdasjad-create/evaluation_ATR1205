import React, {useEffect} from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAppDispatch, useAppSelector} from '../store/store';
import {restoreSession} from '../store/slices/authSlice';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import AuctionListScreen from '../screens/main/AuctionListScreen';
import AuctionDetailScreen from '../screens/main/AuctionDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CreateAuctionScreen from '../screens/main/CreateAuctionScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import WonAuctionsScreen from '../screens/main/WonAuctionsScreen';
import {loadTheme} from '../store/slices/themeSlice';
import {useTheme} from '../hooks/useTheme';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  TabHome: undefined;
  AuctionDetail: {auctionId: string};
  Settings: undefined;
  WonAuctions: undefined;
};

export type TabParamList = {
  Auctions: undefined;
  Create: undefined;
  Profile: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const colors = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textMuted,
      }}>
      <Tab.Screen
        name="Auctions"
        component={AuctionListScreen}
        options={{
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>🏷️</Text>,
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateAuctionScreen}
        options={{
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>➕</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const MainNavigator = () => (
  <MainStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}>
    <MainStack.Screen name="TabHome" component={TabNavigator} />
    <MainStack.Screen name="AuctionDetail" component={AuctionDetailScreen} />
    <MainStack.Screen name="Settings" component={SettingsScreen} />
    <MainStack.Screen name="WonAuctions" component={WonAuctionsScreen} />
  </MainStack.Navigator>
);

const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const {isAuthenticated, isRestoring} = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
    dispatch(loadTheme());
  }, [dispatch]);

  // Only show splash/loading during initial session restoration
  if (isRestoring) {
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
