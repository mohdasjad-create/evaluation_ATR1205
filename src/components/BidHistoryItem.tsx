import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import type {Bid} from '../types/auction.types';

interface BidHistoryItemProps {
  bid: Bid;
  isHighestBid: boolean;
}

const formatPrice = (price: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(price));
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getEmailUsername = (email: string): string => {
  return email.split('@')[0];
};

const BidHistoryItem: React.FC<BidHistoryItemProps> = ({bid, isHighestBid}) => {
  return (
    <View style={[styles.container, isHighestBid && styles.highestBid]}>
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {bid.bidder.email.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.bidderInfo}>
          <Text style={styles.bidderName}>
            {getEmailUsername(bid.bidder.email)}
            {isHighestBid && (
              <Text style={styles.highestLabel}> · Highest</Text>
            )}
          </Text>
          <Text style={styles.bidTime}>{formatTime(bid.createdAt)}</Text>
        </View>
      </View>
      <Text style={[styles.amount, isHighestBid && styles.highestAmount]}>
        {formatPrice(bid.amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  highestBid: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 12,
    marginHorizontal: -8,
    paddingHorizontal: 24,
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  bidderInfo: {
    flex: 1,
  },
  bidderName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  highestLabel: {
    color: '#22C55E',
    fontWeight: '600',
  },
  bidTime: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A78BFA',
  },
  highestAmount: {
    color: '#22C55E',
  },
});

export default BidHistoryItem;
