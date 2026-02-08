import React from 'react';
import { useThemeStore } from '../stores/themeStore';

export interface LogoProps {
  /** Logo boyutu */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Logo varyantı: icon (sadece logo) veya text (logo + yazı) */
  variant?: 'icon' | 'text';
  /** Ek CSS sınıfları */
  className?: string;
  /** Alt text */
  alt?: string;
}

// Icon versiyonu için boyutlar (kare)
const iconSizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
};

// Text versiyonu için boyutlar (yatay)
const textSizeMap = {
  sm: { width: 100, height: 24 },
  md: { width: 140, height: 32 },
  lg: { width: 180, height: 48 },
  xl: { width: 240, height: 64 },
};

/**
 * Kerzz Cloud Logo Componenti
 * Dark/Light mode destekli
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'icon',
  className = '',
  alt = 'Kerzz Cloud Logo',
}) => {
  const { isDark } = useThemeStore();
  const isText = variant === 'text';
  const dimensions = isText ? textSizeMap[size] : iconSizeMap[size];

  // Dark mode için dark logo (açık renkli), light mode için light logo (koyu renkli)
  const src = isText
    ? isDark
      ? '/logo-text-dark-v2.png'
      : '/logo-text-light-v2.png'
    : isDark
      ? '/logo-dark-v2.png'
      : '/logo-light-v2.png';

  // Text variant için wrapper div kullan
  if (isText) {
    return (
      <div style={{ padding: 8, display: 'flex', alignItems: 'center' }} className={className}>
        <img
          src={src}
          alt={alt}
          width={dimensions.width}
          height={dimensions.height}
          style={{ objectFit: 'contain' }}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Logo;






