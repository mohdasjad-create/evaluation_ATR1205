import React, {useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {fetchProfile} from '../../store/slices/userSlice';
import {logoutUser} from '../../store/slices/authSlice';
import {useTheme, useThemeMode} from '../../hooks/useTheme';
import {shadows} from '../../theme/shadows';
import {MainStackParamList} from '../../navigation/RootNavigator';

const formatPrice = (price: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(price));
};

const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const mode = useThemeMode();
  const {profile, isLoading, error} = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchProfile());
    }, [dispatch]),
  );

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => dispatch(logoutUser()),
        },
      ],
    );
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleWonAuctions = () => {
    navigation.navigate('WonAuctions');
  };

  if (isLoading && !profile) {
    return (
      <View style={[styles.container, styles.centered, {backgroundColor: colors.background}]}>
        <ActivityIndicator color={colors.secondary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background, paddingTop: insets.top}]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, {color: colors.text}]}>Profile</Text>
        </View>

        {profile && (
          <>
            <View style={[
              styles.profileCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                ...(mode === 'dark' ? shadows.darkMedium : shadows.medium)
              }
            ]}>
              <View style={[styles.avatar, {backgroundColor: colors.surfaceLight, borderColor: colors.secondary}]}>
                <Text style={[styles.avatarText, {color: colors.secondary}]}>
                  {profile.email.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.userEmail, {color: colors.text}]}>{profile.email}</Text>
              <Text style={[styles.joinDate, {color: colors.textMuted}]}>
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={[
                styles.statBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  ...(mode === 'dark' ? shadows.small : shadows.small)
                }
              ]}>
                <Text style={[styles.statLabel, {color: colors.secondary}]}>Current Balance</Text>
                <Text style={[styles.statValue, {color: colors.text}]}>{formatPrice(profile.balance)}</Text>
              </View>
            </View>

            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: colors.card,
                    ...(mode === 'dark' ? shadows.small : shadows.small)
                  }
                ]}
                onPress={handleWonAuctions}>
                <Text style={styles.menuIcon}>🏆</Text>
                <Text style={[styles.menuText, {color: colors.text}]}>Won Auctions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: colors.card,
                    ...(mode === 'dark' ? shadows.small : shadows.small)
                  }
                ]}>
                <Text style={styles.menuIcon}>📑</Text>
                <Text style={[styles.menuText, {color: colors.text}]}>My Listings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: colors.card,
                    ...(mode === 'dark' ? shadows.small : shadows.small)
                  }
                ]}
                onPress={handleSettings}>
                <Text style={styles.menuIcon}>⚙️</Text>
                <Text style={[styles.menuText, {color: colors.text}]}>Settings</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, {color: colors.error}]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, {backgroundColor: colors.primary}]}
              onPress={() => dispatch(fetchProfile())}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={[styles.logoutButton, {backgroundColor: colors.error + '1A', borderColor: colors.error + '33'}]} onPress={handleLogout}>
          <Text style={[styles.logoutButtonText, {color: colors.error}]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#A78BFA',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#A78BFA',
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statBox: {
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  statLabel: {
    fontSize: 14,
    color: '#A78BFA',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  menuContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    color: '#F87171',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6366F1',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 40,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#F87171',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
