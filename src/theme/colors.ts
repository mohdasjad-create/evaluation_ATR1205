import {ThemeColors} from '../types/theme.types';

export const darkTheme: ThemeColors = {
  primary: '#6366F1', // Indigo 500
  secondary: '#8B5CF6', // Violet 500
  background: '#0B0B14', // Deeper, more modern dark
  surface: '#161626', // Elevated surface
  surfaceLight: 'rgba(255, 255, 255, 0.04)',
  text: '#F8FAFC', // Slate 50
  textMuted: '#94A3B8', // Slate 400
  border: 'rgba(255, 255, 255, 0.08)',
  error: '#F87171',
  success: '#10B981', // Emerald 500
  warning: '#FBBF24', // Amber 400
  info: '#3B82F6', // Blue 500
  price: '#8B5CF6',
  card: '#1E1E30',
  overlay: 'rgba(0, 0, 0, 0.8)',
};

export const lightTheme: ThemeColors = {
  primary: '#4F46E5', // Indigo 600
  secondary: '#7C3AED', // Violet 600
  background: '#F1F5F9', // Clearer off-white (Slate 100)
  surface: '#FFFFFF',
  surfaceLight: 'rgba(0, 0, 0, 0.04)',
  text: '#0F172A', // Slate 900
  textMuted: '#475569', // Slate 600
  border: 'rgba(0, 0, 0, 0.06)',
  error: '#DC2626',
  success: '#059669', // Emerald 600
  warning: '#D97706',
  info: '#2563EB',
  price: '#4F46E5',
  card: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.4)',
};
