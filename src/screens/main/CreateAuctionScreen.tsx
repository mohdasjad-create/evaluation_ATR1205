import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {createAuctionApi} from '../../api/create-auction.api';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useTheme, useThemeMode} from '../../hooks/useTheme';
import {shadows} from '../../theme/shadows';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {TabParamList} from '../../navigation/RootNavigator';

const CreateAuctionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const mode = useThemeMode();
  const navigation = useNavigation<NativeStackNavigationProp<TabParamList>>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 5 * 60 * 1000)); // Default to 5m from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setTitle('');
      setDescription('');
      setStartingPrice('');
      setDate(new Date(Date.now() + 5 * 60 * 1000));
    }, [])
  );

  const handleCreate = async () => {
    if (!title || !description || !startingPrice) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const price = parseFloat(startingPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid starting price');
      return;
    }

    setIsLoading(true);
    try {
      await createAuctionApi({
        title,
        description,
        startingPrice: price,
        endsAt: date.toISOString(),
      });
      Alert.alert('Success', 'Auction created successfully!', [
        {text: 'OK', onPress: () => navigation.navigate('Auctions')},
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create auction');
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatRelativeTime = (targetDate: Date) => {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Invalid time (must be in future)';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Starts for ${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `Starts for ${hours}h ${minutes % 60}m`;
    return `Starts for ${minutes}m`;
  };

  const handlePriceChange = (text: string) => {
    // Only allow numbers and one decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) {
      setStartingPrice(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setStartingPrice(filtered);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background, paddingTop: insets.top}]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.headerTitle, {color: colors.text}]}>Create Auction</Text>

        <View style={styles.form}>
          <Text style={[styles.label, {color: colors.secondary}]}>Title</Text>
          <TextInput
            style={[styles.input, {backgroundColor: colors.surface, color: colors.text, borderColor: colors.border}]}
            placeholder="Item name"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            editable={!isLoading}
          />

          <Text style={[styles.label, {color: colors.secondary}]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
                ...(mode === 'dark' ? shadows.small : shadows.small)
              }
            ]}
            placeholder="Describe your item..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!isLoading}
          />

          <Text style={[styles.label, {color: colors.secondary}]}>Starting Price ($)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
                ...(mode === 'dark' ? shadows.small : shadows.small)
              }
            ]}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            value={startingPrice}
            onChangeText={handlePriceChange}
            keyboardType="decimal-pad"
            editable={!isLoading}
          />

          <Text style={[styles.label, {color: colors.secondary}]}>Ends At</Text>
          <TouchableOpacity
            style={[
              styles.dateSelector,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                ...(mode === 'dark' ? shadows.small : shadows.small)
              }
            ]}
            onPress={() => setShowDatePicker(true)}
            disabled={isLoading}>
            <Text style={[styles.dateText, {color: colors.text}]}>{date.toLocaleString()}</Text>
          </TouchableOpacity>
          <Text style={[styles.relativeTime, {color: colors.secondary}]}>
            ⏱️ {formatRelativeTime(date)}
          </Text>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              is24Hour={true}
              display="default"
              onChange={onChangeDate}
              minimumDate={new Date()}
              themeVariant={mode}
            />
          )}

          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: colors.primary,
                ...(mode === 'dark' ? shadows.darkMedium : shadows.medium)
              },
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleCreate}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.createButtonText}>List Auction</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: -12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  dateSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#6366F1',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#4B5563',
    shadowOpacity: 0,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  relativeTime: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: -8,
    marginLeft: 4,
  },
});

export default CreateAuctionScreen;
