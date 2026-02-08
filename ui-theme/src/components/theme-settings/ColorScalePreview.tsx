import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ColorScale } from '../../tokens/types';

interface ColorScalePreviewProps {
  colors: ColorScale;
  label?: string;
}

/**
 * Primary renk skalası önizleme bileşeni
 * 50-950 arası tüm tonları gösterir
 */
export function ColorScalePreview({ colors, label }: ColorScalePreviewProps) {
  const { t } = useTranslation();
  const colorTones = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        {label || t('theme.colorPreview.primaryScale', 'Primary Renk Skalası')}
      </Typography>
      <Box sx={{ display: 'flex', borderRadius: 1, overflow: 'hidden' }}>
        {colorTones.map((tone) => (
          <Tooltip key={tone} title={`${tone}: ${colors[tone]}`} arrow placement="top">
            <Box
              sx={{
                flex: 1,
                height: 24,
                backgroundColor: colors[tone],
                cursor: 'pointer',
                transition: 'transform 0.15s',
                '&:hover': {
                  transform: 'scaleY(1.3)',
                  zIndex: 1,
                },
              }}
            />
          </Tooltip>
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          50
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          950
        </Typography>
      </Box>
    </Box>
  );
}

