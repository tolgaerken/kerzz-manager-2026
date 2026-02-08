import React from 'react';
import { Box, Typography, Tooltip, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { DarkModeColors, LightModeColors } from '../../tokens/types';

interface ColorBoxProps {
  color: string;
  label: string;
  textColor?: string;
}

function ColorBox({ color, label, textColor }: ColorBoxProps) {
  return (
    <Tooltip title={`${label}: ${color}`} arrow placement="top">
      <Box
        sx={{
          width: '100%',
          height: 28,
          backgroundColor: color,
          borderRadius: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.15s',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            transform: 'scale(1.05)',
            zIndex: 1,
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.6rem',
            color: textColor || (isLightColor(color) ? '#000' : '#fff'),
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
}

function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

interface ModeColorsPreviewProps {
  darkColors: DarkModeColors;
  lightColors: LightModeColors;
}

/**
 * Dark/Light mode renkleri önizleme bileşeni
 * bg, card, border, text varyantlarını gösterir
 */
export function ModeColorsPreview({ darkColors, lightColors }: ModeColorsPreviewProps) {
  const { t } = useTranslation();

  const colorKeys: (keyof DarkModeColors)[] = [
    'bg',
    'card',
    'cardElevated',
    'border',
    'borderLight',
    'text',
    'textSecondary',
    'textMuted',
  ];

  const labelMap: Record<keyof DarkModeColors, string> = {
    bg: 'BG',
    card: 'Card',
    cardElevated: 'Card+',
    border: 'Border',
    borderLight: 'Border-',
    text: 'Text',
    textSecondary: 'Text2',
    textMuted: 'Muted',
  };

  return (
    <Box>
      <Grid container spacing={1}>
        {/* Dark Mode */}
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {t('theme.colorPreview.darkMode', 'Dark Mode')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {colorKeys.map((key) => (
              <ColorBox
                key={`dark-${key}`}
                color={darkColors[key]}
                label={labelMap[key]}
              />
            ))}
          </Box>
        </Grid>

        {/* Light Mode */}
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {t('theme.colorPreview.lightMode', 'Light Mode')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {colorKeys.map((key) => (
              <ColorBox
                key={`light-${key}`}
                color={lightColors[key]}
                label={labelMap[key]}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

