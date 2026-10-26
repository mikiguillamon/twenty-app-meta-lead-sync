/** Semantic colours scoped to a Twenty Remote DOM front component. */
export type UiColorScheme = 'light' | 'dark';

export type UiPalette = {
  colorScheme: UiColorScheme;
  text: string;
  textMuted: string;
  surface: string;
  border: string;
  divider: string;
  control: string;
  controlBorder: string;
  neutralButton: string;
  neutralBorder: string;
  neutralText: string;
  primaryButton: string;
  primaryText: string;
  accent: string;
  successSurface: string;
  successText: string;
  successBorder: string;
  errorSurface: string;
  errorText: string;
  errorBorder: string;
};

const light: UiPalette = {
  colorScheme: 'light',
  text: '#1d2734', textMuted: '#526174',
  surface: '#ffffff', border: '#dbe2e9', divider: '#e3e8ee',
  control: '#ffffff', controlBorder: '#aebdca',
  neutralButton: '#f0f4f8', neutralBorder: '#b9c9dc', neutralText: '#23466b',
  primaryButton: '#245b9e', primaryText: '#ffffff', accent: '#245b9e',
  successSurface: '#edf8f2', successText: '#1c6345', successBorder: '#a7d8bf',
  errorSurface: '#fdf0ed', errorText: '#a02e22', errorBorder: '#efc2b8',
};

const dark: UiPalette = {
  colorScheme: 'dark',
  text: '#edf1f5', textMuted: '#b6c1ce',
  surface: '#24272d', border: '#424a56', divider: '#3c444f',
  control: '#1b1f25', controlBorder: '#697789',
  neutralButton: '#313b48', neutralBorder: '#617187', neutralText: '#edf3fa',
  primaryButton: '#2864ae', primaryText: '#ffffff', accent: '#79b7ff',
  successSurface: '#173c30', successText: '#b6ebd0', successBorder: '#326e55',
  errorSurface: '#442a2a', errorText: '#ffc3b7', errorBorder: '#93544a',
};

export const getUiPalette = (mode: UiColorScheme): UiPalette =>
  mode === 'dark' ? dark : light;
