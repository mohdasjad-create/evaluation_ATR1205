import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppSelector} from '../../store/store';
import {useTheme, useThemeMode} from '../../hooks/useTheme';
import {shadows} from '../../theme/shadows';
import {WonAuction} from '../../api/user.api';

const formatPrice = (price: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(price));
};

const WonAuctionsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const mode = useThemeMode();
  const {profile} = useAppSelector(state => state.user);
  const wonAuctions = profile?.wonAuctions || [];

  const renderWonAuctionCard = ({item}: {item: WonAuction}) => (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
        ...(mode === 'dark' ? shadows.darkMedium : shadows.medium)
      }
    ]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.title, {color: colors.text}]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.price, {color: colors.success}]}>
          {formatPrice(item.finalPrice)}
        </Text>
      </View>
      <Text style={[styles.description, {color: colors.textMuted}]} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={[styles.cardFooter, {borderTopColor: colors.border}]}>
        <Text style={[styles.dateLabel, {color: colors.textMuted}]}>Won on:</Text>
        <Text style={[styles.dateValue, {color: colors.text}]}>
          {new Date(item.soldAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🏆</Text>
      <Text style={[styles.emptyTitle, {color: colors.text}]}>No Wins Yet</Text>
      <Text style={[styles.emptySubtitle, {color: colors.textMuted}]}>
        You haven't won any auctions yet. Start bidding to see your trophies here!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background, paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, {color: colors.text}]}>Won Auctions</Text>
      </View>

      <FlatList
        data={wonAuctions}
        keyExtractor={item => item.id}
        renderItem={renderWonAuctionCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    // Shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default WonAuctionsScreen;
