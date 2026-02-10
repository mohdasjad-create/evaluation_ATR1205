import {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../store/store';
import {socketService} from '../services/socket.service';
import {fetchAuctionDetail, updateAuctionStatus, updateAuctionEndsAt} from '../store/slices/auctionDetailSlice';
import Toast from 'react-native-toast-message';

export const useAuctionSocket = (auctionId: string | undefined) => {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!auctionId) return;

    // Connect and join room
    socketService.connect().then(() => {
      socketService.joinAuction(auctionId);
    });

    // Listen for events
    socketService.on('NEW_BID', (data: { auctionId: string, amount: number, bidderId: string, bidId: string }) => {
      console.group('[SOCKET EVENT] 🔔 NEW_BID');
      console.log('Data Received:', data);
      
      if (data.auctionId === auctionId) {
        // Since backend doesn't send full bidder object, we refetch to get updated list and bidder info
        dispatch(fetchAuctionDetail(auctionId)).then((result) => {
          if (fetchAuctionDetail.fulfilled.match(result)) {
            const auction = result.payload;
            // If current user was the second highest bidder now, they were outbid
            if (user && auction.bids.length > 1 && auction.bids[1].bidderId === user.id && data.bidderId !== user.id) {
              Toast.show({
                type: 'info',
                text1: 'Outbid! 📉',
                text2: `Someone just bid ${data.amount} on ${auction.title}`,
              });
            } else if (user && data.bidderId !== user.id) {
              // General update if someone else bids
              Toast.show({
                type: 'info',
                text1: 'New Bid! 💰',
                text2: `Current bid is now ${data.amount}`,
              });
            }
          }
        });
      } else {
        console.warn('❌ AuctionId mismatch, ignoring event.');
      }
      console.groupEnd();
    });

    socketService.on('AUCTION_SOLD', (data: { auctionId: string, winnerId: string, finalPrice: number }) => {
      console.log('[SOCKET EVENT] 🏆 AUCTION_SOLD:', data);
      if (data.auctionId === auctionId) {
        dispatch(updateAuctionStatus({ status: 'sold', winnerId: data.winnerId }));
        dispatch(fetchAuctionDetail(auctionId));

        if (user && data.winnerId === user.id) {
          Toast.show({
            type: 'success',
            text1: 'Congratulations! 🏆',
            text2: `You won the auction for ${data.finalPrice}!`,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Auction Ended 🏁',
            text2: `Sold for ${data.finalPrice}`,
          });
        }
      }
    });

    socketService.on('AUCTION_EXPIRED', (data: { auctionId: string }) => {
      console.log('[SOCKET EVENT] ⌛ AUCTION_EXPIRED:', data);
      if (data.auctionId === auctionId) {
        dispatch(updateAuctionStatus({ status: 'expired' }));
        dispatch(fetchAuctionDetail(auctionId));
        Toast.show({
          type: 'info',
          text1: 'Auction Expired ⌛',
          text2: 'No bids were placed.',
        });
      }
    });

    socketService.on('AUCTION_ENDING_SOON', (data: { auctionId: string, endsAt: string }) => {
      console.log('⚠️ [SOCKET EVENT] AUCTION_ENDING_SOON:', data);
      if (data.auctionId === auctionId) {
        Toast.show({
          type: 'error',
          text1: 'Ending Soon! ⏳',
          text2: 'Only 5 minutes left to bid!',
          visibilityTime: 10000,
        });
      }
    });

    socketService.on('AUCTION_EXTENDED', (data: { auctionId: string, endsAt: string }) => {
      console.log('👀 [DEBUG] RECEIVED AUCTION_EXTENDED event');
      console.log('👀 [DEBUG] Data Received:', JSON.stringify(data, null, 2));
      console.log('👀 [DEBUG] Expected auctionId:', auctionId);
      
      if (data.auctionId === auctionId) {
        console.log('✅ [DEBUG] Match! Dispatching updateAuctionEndsAt...');
        dispatch(updateAuctionEndsAt({ endsAt: data.endsAt }));
        Toast.show({
          type: 'info',
          text1: 'Auction Extended! ⏱️',
          text2: '+30s added to the timer.',
        });
      } else {
        console.warn('❌ [DEBUG] Auction ID mismatch:', data.auctionId, '!==', auctionId);
      }
    });

    socketService.on('VIEWER_COUNT', (data: { room: string, count: number }) => {
      console.log('[SOCKET EVENT] 👥 VIEWER_COUNT:', data);
    });

    // Cleanup
    return () => {
      console.log('[SOCKET] Component unmounting, cleaning up for:', auctionId);
      socketService.leaveAuction(auctionId);
      socketService.off('NEW_BID');
      socketService.off('AUCTION_SOLD');
      socketService.off('AUCTION_EXPIRED');
      socketService.off('AUCTION_ENDING_SOON');
      socketService.off('AUCTION_EXTENDED');
      socketService.off('VIEWER_COUNT');
    };
  }, [auctionId, dispatch, user]);
};
