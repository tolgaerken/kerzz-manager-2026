/**
 * ThemeAwareToaster
 * Tema ile uyumlu toast bildirimleri için wrapper
 * react-hot-toast kullanır ve tema değişikliklerine otomatik uyum sağlar
 */

import { Toaster, ToasterProps } from 'react-hot-toast';
import { useThemeStore } from '../stores/themeStore';
import { semanticColors } from '../tokens/semantic';

export interface ThemeAwareToasterProps extends Omit<ToasterProps, 'toastOptions'> {
  /** Toast süresi (ms) */
  duration?: number;
}

/**
 * Tema ile uyumlu toast bileşeni
 * Dark/light mode'a göre otomatik renk uyumu sağlar
 */
export function ThemeAwareToaster({
  position = 'top-right',
  duration = 4000,
  ...rest
}: ThemeAwareToasterProps) {
  const { isDark, getActivePreset } = useThemeStore();
  const preset = getActivePreset();
  const modeColors = isDark ? preset.colors.dark : preset.colors.light;
  const semantic = preset.semantic || semanticColors;

  return (
    <Toaster
      position={position}
      toastOptions={{
        duration,
        style: {
          background: modeColors.card,
          color: modeColors.text,
          borderRadius: '12px',
          border: `1px solid ${modeColors.border}`,
          boxShadow: isDark
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        },
        success: {
          style: {
            background: isDark ? modeColors.card : semantic.success.light,
            borderColor: semantic.success.main,
          },
          iconTheme: {
            primary: semantic.success.main,
            secondary: isDark ? modeColors.text : '#ffffff',
          },
        },
        error: {
          style: {
            background: isDark ? modeColors.card : semantic.error.light,
            borderColor: semantic.error.main,
          },
          iconTheme: {
            primary: semantic.error.main,
            secondary: isDark ? modeColors.text : '#ffffff',
          },
        },
        loading: {
          iconTheme: {
            primary: preset.colors.primary[500],
            secondary: modeColors.textMuted,
          },
        },
      }}
      {...rest}
    />
  );
}

export default ThemeAwareToaster;
