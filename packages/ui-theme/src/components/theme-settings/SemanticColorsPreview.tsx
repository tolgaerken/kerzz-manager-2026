import React from 'react';
import { Box, Typography, Tooltip, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SemanticColorPalette } from '../../tokens/types';

interface SemanticColorRowProps {
  palette: SemanticColorPalette;
  label: string;
}

function SemanticColorRow({ palette, label }: SemanticColorRowProps) {
  const tones = [
    { key: 'light', color: palette.light },
    { key: 'main', color: palette.main },
    { key: 'dark', color: palette.dark },
  ];

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', mb: 0.25, display: 'block' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.25 }}>
        {tones.map(({ key, color }) => (
          <Tooltip key={key} title={`${key}: ${color}`} arrow placement="top">
            <Box
              sx={{
                flex: 1,
                height: 20,
                backgroundColor: color,
                borderRadius: 0.25,
                cursor: 'pointer',
                transition: 'transform 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  transform: 'scaleY(1.3)',
                  zIndex: 1,
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.5rem',
                  color: key === 'light' ? '#000' : '#fff',
                  fontWeight: 500,
                }}
              >
                {key}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}

interface SemanticColorsPreviewProps {
  semanticColors: {
    success: SemanticColorPalette;
    warning: SemanticColorPalette;
    error: SemanticColorPalette;
    info: SemanticColorPalette;
  };
}

/**
 * Semantic renkler önizleme bileşeni
 * success, warning, error, info renklerini gösterir
 */
export function SemanticColorsPreview({ semanticColors }: SemanticColorsPreviewProps) {
  const { t } = useTranslation();

  const semanticEntries: { key: keyof typeof semanticColors; labelKey: string; fallback: string }[] = [
    { key: 'success', labelKey: 'theme.colorPreview.semantic.success', fallback: 'Success' },
    { key: 'warning', labelKey: 'theme.colorPreview.semantic.warning', fallback: 'Warning' },
    { key: 'error', labelKey: 'theme.colorPreview.semantic.error', fallback: 'Error' },
    { key: 'info', labelKey: 'theme.colorPreview.semantic.info', fallback: 'Info' },
  ];

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        {t('theme.colorPreview.semantic.title', 'Semantic Renkler')}
      </Typography>
      <Grid container spacing={0.5}>
        {semanticEntries.map(({ key, labelKey, fallback }) => (
          <Grid item xs={6} key={key}>
            <SemanticColorRow
              palette={semanticColors[key]}
              label={t(labelKey, fallback)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

