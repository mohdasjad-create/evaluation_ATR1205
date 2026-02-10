import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {logoutUser} from '../../store/slices/authSlice';
import {useTheme, useThemeMode} from '../../hooks/useTheme';
import {shadows} from '../../theme/shadows';

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const mode = useThemeMode();
  const {user} = useAppSelector(state => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => dispatch(logoutUser()),
        },
      ],
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background, paddingTop: insets.top + 20}]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, {color: colors.textMuted}]}>Welcome back,</Text>
          <Text style={[styles.userName, {color: colors.text}]}>{user?.name || 'Bidder'}</Text>
        </View>
        <View style={[styles.avatarContainer, {backgroundColor: colors.primary}]}>
          <Text style={[styles.avatarText, {color: '#FFFFFF'}]}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            ...(mode === 'dark' ? shadows.darkMedium : shadows.medium)
          }
        ]}>
          <Text style={styles.cardIcon}>🎉</Text>
          <Text style={[styles.cardTitle, {color: colors.text}]}>You're all set!</Text>
          <Text style={[styles.cardSubtitle, {color: colors.textMuted}]}>
            Authentication is working. Start building your auction features!
          </Text>
        </View>

        {/* Stats Preview */}
        <View style={styles.statsContainer}>
          <View style={[
            styles.statCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              ...(mode === 'dark' ? shadows.small : shadows.small)
            }
          ]}>
            <Text style={[styles.statValue, {color: colors.secondary}]}>0</Text>
            <Text style={[styles.statLabel, {color: colors.textMuted}]}>Active Bids</Text>
          </View>
          <View style={[
            styles.statCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              ...(mode === 'dark' ? shadows.small : shadows.small)
            }
          ]}>
            <Text style={[styles.statValue, {color: colors.secondary}]}>0</Text>
            <Text style={[styles.statLabel, {color: colors.textMuted}]}>Won Auctions</Text>
          </View>
          <View style={[
            styles.statCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              ...(mode === 'dark' ? shadows.small : shadows.small)
            }
          ]}>
            <Text style={[styles.statValue, {color: colors.secondary}]}>$0</Text>
            <Text style={[styles.statLabel, {color: colors.textMuted}]}>Total Spent</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View style={[styles.footer, {paddingBottom: insets.bottom + 20}]}>
        <TouchableOpacity
          style={[styles.logoutButton, {backgroundColor: colors.error + '26', borderColor: colors.error + '4D'}]}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <Text style={[styles.logoutButtonText, {color: colors.error}]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#A78BFA',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    color: '#F87171',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default HomeScreen;
