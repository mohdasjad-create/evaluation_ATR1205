import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {
  fetchAuctions,
  fetchMoreAuctions,
  setStatusFilter,
} from '../../store/slices/auctionSlice';
import {logoutUser} from '../../store/slices/authSlice';
import AuctionCard from '../../components/AuctionCard';
import {useTheme, useThemeMode} from '../../hooks/useTheme';
import {shadows} from '../../theme/shadows';
import type {Auction, AuctionStatus} from '../../types/auction.types';
import type {MainStackParamList} from '../../navigation/RootNavigator';

type FilterOption = AuctionStatus | 'all';

const FILTER_OPTIONS: {label: string; value: FilterOption}[] = [
  {label: 'All', value: 'all'},
  {label: 'Active', value: 'active'},
  {label: 'Sold', value: 'sold'},
  {label: 'Expired', value: 'expired'},
];

const AuctionListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const mode = useThemeMode();
  const {user} = useAppSelector(state => state.auth);
  const {
    auctions,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    hasMore,
    statusFilter,
  } = useAppSelector(state => state.auction);

  useEffect(() => {
    dispatch(fetchAuctions());
  }, [dispatch, statusFilter]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchAuctions());
    }, [dispatch, statusFilter]),
  );

  const handleRefresh = useCallback(() => {
    dispatch(fetchAuctions({refresh: true}));
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      dispatch(fetchMoreAuctions());
    }
  }, [dispatch, isLoadingMore, hasMore, isLoading]);

  const handleFilterChange = (filter: FilterOption) => {
    if (filter !== statusFilter) {
      dispatch(setStatusFilter(filter));
    }
  };

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

  const handleAuctionPress = (auctionId: string) => {
    navigation.navigate('AuctionDetail', {auctionId});
  };

  const renderAuctionCard = ({item}: {item: Auction}) => (
    <AuctionCard auction={item} onPress={() => handleAuctionPress(item.id)} />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterTab,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                ...(mode === 'dark' ? shadows.small : shadows.small)
              },
              statusFilter === option.value && {backgroundColor: colors.secondary + '33', borderColor: colors.secondary},
            ]}
            onPress={() => handleFilterChange(option.value)}>
            <Text
              style={[
                styles.filterTabText,
                {color: colors.textMuted},
                statusFilter === option.value && {color: colors.secondary},
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={[styles.emptyTitle, {color: colors.text}]}>No Auctions Found</Text>
        <Text style={[styles.emptySubtitle, {color: colors.textMuted}]}>
          {statusFilter === 'all'
            ? 'There are no auctions available right now.'
            : `No ${statusFilter} auctions at the moment.`}
        </Text>
        <TouchableOpacity style={[styles.retryButton, {backgroundColor: colors.primary}]} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) {
      return <View style={{height: 20}} />;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.secondary} size="small" />
        <Text style={[styles.footerLoaderText, {color: colors.textMuted}]}>Loading more...</Text>
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={[styles.errorTitle, {color: colors.text}]}>Something went wrong</Text>
      <Text style={[styles.errorMessage, {color: colors.error}]}>{error}</Text>
      <TouchableOpacity style={[styles.retryButton, {backgroundColor: colors.primary}]} onPress={handleRefresh}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background, paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, {color: colors.textMuted}]}>Welcome</Text>
          <Text style={[styles.userName, {color: colors.text}]}>{user?.name || 'Bidder'}</Text>
        </View>
        {/* <TouchableOpacity style={[styles.logoutIcon, {backgroundColor: colors.surfaceLight}]} onPress={handleLogout}>
          <Text style={styles.logoutIconText}>👋</Text>
        </TouchableOpacity> */}
      </View>

      {/* Loading State */}
      {isLoading && auctions.length === 0 && !error && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.secondary} size="large" />
          <Text style={[styles.loadingText, {color: colors.textMuted}]}>Loading auctions...</Text>
        </View>
      )}

      {/* Error State */}
      {error && auctions.length === 0 && renderError()}

      {/* Auction List */}
      {(!isLoading || auctions.length > 0) && !error && (
        <FlatList
          data={auctions}
          keyExtractor={item => item.id}
          renderItem={renderAuctionCard}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.secondary}
              colors={[colors.secondary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  logoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIconText: {
    fontSize: 20,
  },
  headerContent: {
    paddingBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterTabActive: {
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    borderColor: '#A78BFA',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#A78BFA',
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
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
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  footerLoaderText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default AuctionListScreen;
