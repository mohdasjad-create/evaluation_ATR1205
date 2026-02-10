import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {
  fetchAuctionDetail,
  placeBid,
  clearAuctionDetail,
  clearBidError,
} from '../../store/slices/auctionDetailSlice';
import BidHistoryItem from '../../components/BidHistoryItem';
import PlaceBidModal from '../../components/PlaceBidModal';
import {useAuctionSocket} from '../../hooks/useAuctionSocket';
import {useTheme, useThemeMode} from '../../hooks/useTheme';
import {shadows} from '../../theme/shadows';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MainStackParamList} from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'AuctionDetail'>;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return {bg: 'rgba(34, 197, 94, 0.2)', text: '#22C55E'};
    case 'sold':
      return {bg: 'rgba(168, 85, 247, 0.2)', text: '#A855F7'};
    case 'expired':
      return {bg: 'rgba(107, 114, 128, 0.2)', text: '#9CA3AF'};
    default:
      return {bg: 'rgba(107, 114, 128, 0.2)', text: '#9CA3AF'};
  }
};

const formatPrice = (price: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(price));
};

const formatTimeRemaining = (endsAt: string): string => {
  const now = new Date().getTime();
  const end = new Date(endsAt).getTime();
  const diff = end - now;

  if (diff <= 0) {
    return 'Ended';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const getEmailUsername = (email: string): string => {
  return email.split('@')[0];
};

const AuctionDetailScreen: React.FC<Props> = ({route, navigation}) => {
  const {auctionId} = route.params;
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const mode = useThemeMode();

  const {auction, isLoading, isPlacingBid, error, bidError} = useAppSelector(
    state => state.auctionDetail,
  );

  useAuctionSocket(auctionId);

  const [timeRemaining, setTimeRemaining] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAuctionDetail(auctionId));

    return () => {
      dispatch(clearAuctionDetail());
    };
  }, [dispatch, auctionId]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchAuctionDetail(auctionId));
    }, [dispatch, auctionId]),
  );

  useEffect(() => {
    if (!auction || auction.status !== 'active') {
      return;
    }

    const updateTime = () => {
      setTimeRemaining(formatTimeRemaining(auction.endsAt));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchAuctionDetail(auctionId));
    setRefreshing(false);
  }, [dispatch, auctionId]);

  const handlePlaceBid = async (amount: number) => {
    const result = await dispatch(placeBid({auctionId, amount}));
    if (placeBid.fulfilled.match(result)) {
      setShowBidModal(false);
      dispatch(fetchAuctionDetail(auctionId)); // Refresh to get updated data
    }
  };

  const handleOpenBidModal = () => {
    dispatch(clearBidError());
    setShowBidModal(true);
  };

  if (isLoading && !auction) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#A78BFA" size="large" />
        <Text style={styles.loadingText}>Loading auction...</Text>
      </View>
    );
  }

  if (error && !auction) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Failed to load</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!auction) {
    return null;
  }

  const statusColors = getStatusColor(auction.status);
  const isActive = auction.status === 'active';

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Auction Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#A78BFA"
          />
        }>
        {/* Image Placeholder */}
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderIcon}>🏷️</Text>
          <View style={[styles.statusBadge, {backgroundColor: statusColors.bg}]}>
            <Text style={[styles.statusText, {color: statusColors.text}]}>
              {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Title & Description */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{auction.title}</Text>
          <Text style={styles.description}>{auction.description}</Text>

          {/* Creator */}
          <View style={styles.creatorRow}>
            <Text style={styles.creatorLabel}>Listed by</Text>
            <Text style={styles.creatorName}>
              {getEmailUsername(auction.creator.email)}
            </Text>
          </View>
        </View>

        {/* Price Card */}
        <View style={[
          styles.priceCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            ...(mode === 'dark' ? shadows.darkMedium : shadows.medium)
          }
        ]}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Current Bid</Text>
              <Text style={styles.currentPrice}>
                {formatPrice(auction.currentPrice)}
              </Text>
            </View>
            {isActive && (
              <View style={styles.timeContainer}>
                <Text style={styles.timeLabel}>Ends in</Text>
                <Text style={styles.timeValue}>{timeRemaining}</Text>
              </View>
            )}
          </View>

          <View style={styles.priceDetails}>
            <View style={styles.priceDetailItem}>
              <Text style={styles.priceDetailLabel}>Starting Price</Text>
              <Text style={styles.priceDetailValue}>
                {formatPrice(auction.startingPrice)}
              </Text>
            </View>
            <View style={styles.priceDetailItem}>
              <Text style={styles.priceDetailLabel}>Total Bids</Text>
              <Text style={styles.priceDetailValue}>{auction.bids.length}</Text>
            </View>
          </View>
        </View>

        {/* Winner (if sold) */}
        {auction.status === 'sold' && auction.winner && (
          <View style={[
            styles.winnerCard,
            {
              backgroundColor: colors.success + '1A',
              borderColor: colors.success + '33',
              ...(mode === 'dark' ? shadows.small : shadows.small)
            }
          ]}>
            <Text style={styles.winnerIcon}>🏆</Text>
            <View>
              <Text style={styles.winnerLabel}>Winner</Text>
              <Text style={styles.winnerName}>
                {getEmailUsername(auction.winner.email)}
              </Text>
            </View>
          </View>
        )}

        {/* Bid History */}
        <View style={styles.bidHistorySection}>
          <Text style={styles.sectionTitle}>Bid History</Text>
          {auction.bids.length === 0 ? (
            <View style={styles.noBids}>
              <Text style={styles.noBidsText}>No bids yet. Be the first!</Text>
            </View>
          ) : (
            auction.bids.map((bid, index) => (
              <BidHistoryItem
                key={bid.id}
                bid={bid}
                isHighestBid={index === 0}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Place Bid Button */}
      {isActive && (
        <View style={[styles.bottomBar, {paddingBottom: insets.bottom + 16}]}>
          <TouchableOpacity
            style={styles.bidButton}
            onPress={handleOpenBidModal}
            activeOpacity={0.8}>
            <Text style={styles.bidButtonText}>Place Bid</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bid Modal */}
      <PlaceBidModal
        visible={showBidModal}
        onClose={() => setShowBidModal(false)}
        onSubmit={handlePlaceBid}
        currentPrice={auction.currentPrice}
        isLoading={isPlacingBid}
        error={bidError}
      />
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    color: '#F87171',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imagePlaceholder: {
    height: 220,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  placeholderIcon: {
    fontSize: 64,
    opacity: 0.6,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoSection: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
    marginBottom: 16,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  priceCard: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#A78BFA',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F59E0B',
  },
  priceDetails: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
  },
  priceDetailItem: {
    flex: 1,
  },
  priceDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  winnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  winnerIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  winnerLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  winnerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A855F7',
  },
  bidHistorySection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  noBids: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noBidsText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F0F1A',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  bidButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  bidButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AuctionDetailScreen;
