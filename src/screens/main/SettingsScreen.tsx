import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {toggleTheme} from '../../store/slices/themeSlice';
import {useTheme} from '../../hooks/useTheme';

const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const mode = useAppSelector(state => state.theme.mode);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background, paddingTop: insets.top}]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, {color: colors.text}]}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.textMuted}]}>Appearance</Text>
          <View style={[styles.settingItem, {backgroundColor: colors.surface, borderColor: colors.border}]}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, {color: colors.text}]}>Dark Mode</Text>
              <Text style={[styles.settingSubLabel, {color: colors.textMuted}]}>
                Toggle between dark and light themes
              </Text>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={handleToggleTheme}
              trackColor={{false: '#D1D5DB', true: colors.primary}}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D5DB"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.textMuted}]}>Account</Text>
          <TouchableOpacity style={[styles.settingItem, {backgroundColor: colors.surface, borderColor: colors.border}]}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Profile Settings</Text>
            <Text style={{color: colors.textMuted}}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, {backgroundColor: colors.surface, borderColor: colors.border, marginTop: 12}]}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Privacy Policy</Text>
            <Text style={{color: colors.textMuted}}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, {color: colors.textMuted}]}>Version 0.0.1</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  settingSubLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
  },
});

export default SettingsScreen;
