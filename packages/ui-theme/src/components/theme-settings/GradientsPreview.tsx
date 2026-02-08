import React from 'react';
import { Box, Typography, Tooltip, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { GradientConfig, GradientDefinition } from '../../tokens/types';

interface GradientBoxProps {
  gradient: GradientDefinition;
  label: string;
}

function GradientBox({ gradient, label }: GradientBoxProps) {
  const gradientCss = `linear-gradient(${gradient.angle ?? 135}deg, ${gradient.colors.join(', ')})`;

  return (
    <Tooltip title={`${label}: ${gradient.colors.join(' → ')}`} arrow placement="top">
      <Box
        sx={{
          height: 32,
          borderRadius: 0.5,
          background: gradientCss,
          cursor: 'pointer',
          transition: 'transform 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.65rem',
            color: '#fff',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
}

interface GradientsPreviewProps {
  gradients: GradientConfig;
}

/**
 * Tüm gradient önizlemeleri bileşeni
 * morning, afternoon, evening, primary, dark gradientlerini gösterir
 */
export function GradientsPreview({ gradients }: GradientsPreviewProps) {
  const { t } = useTranslation();

  const gradientEntries: { key: keyof GradientConfig; labelKey: string; fallback: string }[] = [
    { key: 'primary', labelKey: 'theme.colorPreview.gradients.primary', fallback: 'Primary' },
    { key: 'morning', labelKey: 'theme.colorPreview.gradients.morning', fallback: 'Morning' },
    { key: 'afternoon', labelKey: 'theme.colorPreview.gradients.afternoon', fallback: 'Afternoon' },
    { key: 'evening', labelKey: 'theme.colorPreview.gradients.evening', fallback: 'Evening' },
    { key: 'dark', labelKey: 'theme.colorPreview.gradients.dark', fallback: 'Dark' },
  ];

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        {t('theme.colorPreview.gradients.title', 'Gradientler')}
      </Typography>
      <Grid container spacing={0.5}>
        {gradientEntries.map(({ key, labelKey, fallback }) => (
          <Grid item xs={12} key={key}>
            <GradientBox
              gradient={gradients[key]}
              label={t(labelKey, fallback)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

