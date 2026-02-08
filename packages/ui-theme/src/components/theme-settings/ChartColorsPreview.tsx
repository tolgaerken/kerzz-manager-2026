import React from 'react';
import { Box, Typography, Tooltip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ChartColors } from '../../tokens/types';

interface ColorRowProps {
  colors: string[];
  label: string;
}

function ColorRow({ colors, label }: ColorRowProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', mb: 0.25, display: 'block' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.25 }}>
        {colors.map((color, index) => (
          <Tooltip key={`${label}-${index}`} title={color} arrow placement="top">
            <Box
              sx={{
                flex: 1,
                height: 16,
                backgroundColor: color,
                borderRadius: 0.25,
                cursor: 'pointer',
                transition: 'transform 0.15s',
                '&:hover': {
                  transform: 'scaleY(1.5)',
                  zIndex: 1,
                },
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}

interface ChartColorsPreviewProps {
  chartColors: ChartColors;
}

/**
 * Chart renkleri önizleme bileşeni
 * primary, secondary, accent renk dizilerini gösterir
 */
export function ChartColorsPreview({ chartColors }: ChartColorsPreviewProps) {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        {t('theme.colorPreview.chart.title', 'Chart Renkleri')}
      </Typography>
      <Stack spacing={0.75}>
        <ColorRow
          colors={chartColors.primary}
          label={t('theme.colorPreview.chart.primary', 'Primary')}
        />
        <ColorRow
          colors={chartColors.secondary}
          label={t('theme.colorPreview.chart.secondary', 'Secondary')}
        />
        <ColorRow
          colors={chartColors.accent}
          label={t('theme.colorPreview.chart.accent', 'Accent')}
        />
      </Stack>
    </Box>
  );
}

