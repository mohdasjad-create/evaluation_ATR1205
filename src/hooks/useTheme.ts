import {useAppSelector} from '../store/store';
import {lightTheme, darkTheme} from '../theme/colors';
import {ThemeColors} from '../types/theme.types';

export const useTheme = (): ThemeColors => {
  const mode = useAppSelector(state => state.theme.mode);
  return mode === 'light' ? lightTheme : darkTheme;
};

export const useThemeMode = () => {
  return useAppSelector(state => state.theme.mode);
};
