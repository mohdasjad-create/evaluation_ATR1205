import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import type {Auction} from '../types/auction.types';
import {useTheme, useThemeMode} from '../hooks/useTheme';
import {shadows} from '../theme/shadows';

interface AuctionCardProps {
  auction: Auction;
  onPress?: () => void;
}

const formatPrice = (price: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(price));
};

const getStatusColor = (status: string, colors: any) => {
  switch (status) {
    case 'active':
      return {bg: colors.success + '33', text: colors.success};
    case 'sold':
      return {bg: colors.primary + '33', text: colors.primary};
    case 'expired':
      return {bg: colors.textMuted + '33', text: colors.textMuted};
    case 'draft':
      return {bg: colors.info + '33', text: colors.info};
    default:
      return {bg: colors.textMuted + '33', text: colors.textMuted};
  }
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
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const AuctionCard: React.FC<AuctionCardProps> = ({auction, onPress}) => {
  const colors = useTheme();
  const mode = useThemeMode();
  const [timeRemaining, setTimeRemaining] = useState(
    formatTimeRemaining(auction.endsAt),
  );
  const statusColors = getStatusColor(auction.status, colors);

  const updateCountdown = useCallback(() => {
    setTimeRemaining(formatTimeRemaining(auction.endsAt));
  }, [auction.endsAt]);

  useEffect(() => {
    if (auction.status !== 'active') {
      return;
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [auction.status, updateCountdown]);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          ... (mode === 'dark' ? shadows.darkMedium : shadows.medium)
        }
      ]}
      onPress={onPress}
      activeOpacity={0.85}>
      {/* Image Placeholder */}
      <View style={[styles.imagePlaceholder, {backgroundColor: colors.surfaceLight}]}>
        <View style={[styles.imageGradient, {backgroundColor: colors.primary + '1A'}]}>
          <Text style={[styles.placeholderIcon, {color: colors.textMuted}]}>🏷️</Text>
        </View>
        {/* Status Badge */}
        <View
          style={[styles.statusBadge, {backgroundColor: statusColors.bg}]}>
          <Text style={[styles.statusText, {color: statusColors.text}]}>
            {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, {color: colors.text}]} numberOfLines={2}>
          {auction.title}
        </Text>

        <View style={styles.detailsRow}>
          {/* Current Price */}
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, {color: colors.textMuted}]}>Current Bid</Text>
            <Text style={[styles.priceValue, {color: colors.secondary}]}>
              {formatPrice(auction.currentPrice)}
            </Text>
          </View>

          {/* Countdown */}
          {auction.status === 'active' && (
            <View style={styles.countdownContainer}>
              <Text style={[styles.countdownLabel, {color: colors.textMuted}]}>Ends in</Text>
              <Text style={[styles.countdownValue, {color: colors.warning}]}>{timeRemaining}</Text>
            </View>
          )}

          {auction.status === 'sold' && (
            <View style={styles.countdownContainer}>
              <Text style={[styles.countdownLabel, {color: colors.textMuted}]}>Status</Text>
              <Text style={[styles.countdownValue, {color: colors.primary}]}>
                Sold
              </Text>
            </View>
          )}

          {auction.status === 'expired' && (
            <View style={styles.countdownContainer}>
              <Text style={[styles.countdownLabel, {color: colors.textMuted}]}>Status</Text>
              <Text style={[styles.countdownValue, {color: colors.textMuted}]}>
                Expired
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  imagePlaceholder: {
    height: 140,
    backgroundColor: '#1A1A2E',
    position: 'relative',
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  placeholderIcon: {
    fontSize: 40,
    opacity: 0.6,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 24,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#A78BFA',
  },
  countdownContainer: {
    alignItems: 'flex-end',
  },
  countdownLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countdownValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F59E0B',
  },
  bidCountContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  bidCountText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default AuctionCard;
