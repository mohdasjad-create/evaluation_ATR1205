import {ThemeColors} from '../types/theme.types';

export const darkTheme: ThemeColors = {
  primary: '#6366F1',
  secondary: '#A78BFA',
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: 'rgba(255, 255, 255, 0.05)',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  border: 'rgba(255, 255, 255, 0.08)',
  error: '#F87171',
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#6366F1',
  price: '#A78BFA',
  card: 'rgba(255, 255, 255, 0.05)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const lightTheme: ThemeColors = {
  primary: '#4F46E5', // Slightly darker indigo for better contrast on light
  secondary: '#7C3AED', // Slightly darker violet
  background: '#F8FAFC', // Soft off-white
  surface: '#FFFFFF',
  surfaceLight: 'rgba(0, 0, 0, 0.03)',
  text: '#0F172A', // Slate 900
  textMuted: '#64748B', // Slate 500
  border: 'rgba(0, 0, 0, 0.08)',
  error: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  info: '#2563EB',
  price: '#4F46E5',
  card: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
};
