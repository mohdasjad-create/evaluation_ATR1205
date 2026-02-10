/**
 * QuickBid - Real-time Auction App
 */

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {store} from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from 'react-native-toast-message';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <RootNavigator />
        <Toast />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
