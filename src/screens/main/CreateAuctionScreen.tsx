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
  const [durationDays, setDurationDays] = useState('0');
  const [durationHours, setDurationHours] = useState('0');
  const [durationMinutes, setDurationMinutes] = useState('5');
  const [durationSeconds, setDurationSeconds] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setTitle('');
      setDescription('');
      setStartingPrice('');
      setDurationDays('0');
      setDurationHours('0');
      setDurationMinutes('5');
      setDurationSeconds('0');
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

    const days = parseInt(durationDays || '0', 10);
    const hrs = parseInt(durationHours || '0', 10);
    const mins = parseInt(durationMinutes || '0', 10);
    const secs = parseInt(durationSeconds || '0', 10);
    const totalSeconds = days * 86400 + hrs * 3600 + mins * 60 + secs;

    if (totalSeconds < 30) {
      Alert.alert('Error', 'Minimum auction duration is 30 seconds');
      return;
    }

    const endsAt = new Date(Date.now() + totalSeconds * 1000);

    setIsLoading(true);
    try {
      await createAuctionApi({
        title,
        description,
        startingPrice: price,
        endsAt: endsAt.toISOString(),
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

  const handleDurationChange = (type: 'day' | 'hr' | 'min' | 'sec', text: string) => {
    const filtered = text.replace(/[^0-9]/g, '');
    const val = parseInt(filtered || '0', 10);

    switch (type) {
      case 'day':
        setDurationDays(filtered);
        break;
      case 'hr':
        setDurationHours(val > 23 ? '23' : filtered);
        break;
      case 'min':
        setDurationMinutes(val > 59 ? '59' : filtered);
        break;
      case 'sec':
        setDurationSeconds(val > 59 ? '59' : filtered);
        break;
    }
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

          <Text style={[styles.label, {color: colors.secondary}]}>Duration (Timer)</Text>
          <View style={styles.durationGrid}>
            {/* Days */}
            <View style={styles.durationInputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.durationInput,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                    ...(mode === 'dark' ? shadows.small : shadows.small)
                  }
                ]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={durationDays}
                onChangeText={(text) => handleDurationChange('day', text)}
                keyboardType="number-pad"
                maxLength={2}
                editable={!isLoading}
              />
              <Text style={[styles.durationLabel, {color: colors.textMuted}]}>DAYS</Text>
            </View>

            {/* Hours */}
            <View style={styles.durationInputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.durationInput,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                    ...(mode === 'dark' ? shadows.small : shadows.small)
                  }
                ]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={durationHours}
                onChangeText={(text) => handleDurationChange('hr', text)}
                keyboardType="number-pad"
                maxLength={2}
                editable={!isLoading}
              />
              <Text style={[styles.durationLabel, {color: colors.textMuted}]}>HOURS</Text>
            </View>

            {/* Minutes */}
            <View style={styles.durationInputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.durationInput,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                    ...(mode === 'dark' ? shadows.small : shadows.small)
                  }
                ]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={durationMinutes}
                onChangeText={(text) => handleDurationChange('min', text)}
                keyboardType="number-pad"
                maxLength={2}
                editable={!isLoading}
              />
              <Text style={[styles.durationLabel, {color: colors.textMuted}]}>MINS</Text>
            </View>

            {/* Seconds */}
            <View style={styles.durationInputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.durationInput,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                    ...(mode === 'dark' ? shadows.small : shadows.small)
                  }
                ]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={durationSeconds}
                onChangeText={(text) => handleDurationChange('sec', text)}
                keyboardType="number-pad"
                maxLength={2}
                editable={!isLoading}
              />
              <Text style={[styles.durationLabel, {color: colors.textMuted}]}>SECS</Text>
            </View>
          </View>

          <Text style={[styles.relativeTime, {color: colors.secondary}]}>
            ⏱️ Auction duration: {durationDays || '0'}d {durationHours || '0'}h {durationMinutes || '0'}m {durationSeconds || '0'}s
          </Text>

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
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationInputWrapper: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
    gap: 8,
  },
  durationInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    padding: 12,
  },
  durationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  durationSeparator: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: -24,
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
