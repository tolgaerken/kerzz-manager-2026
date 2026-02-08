import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
  Stack,
  Collapse,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Cloud as CloudIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../stores/themeStore';
import {
  ColorScalePreview,
  ModeColorsPreview,
  GradientsPreview,
  ChartColorsPreview,
  SemanticColorsPreview,
} from './theme-settings';
import { semanticColors } from '../tokens';

/**
 * Theme Preset Selector Component
 * Kullanicilarin tema preset'lerini secmelerini saglar
 * Remote (DB'den) ve local preset'leri destekler
 */
export function ThemePresetSelector() {
  const { t } = useTranslation();
  const { activePresetId, setPreset, getAllPresets, remotesLoading, remoteThemes } = useThemeStore();
  // getAllPresets() remote + local temaları birleştirir
  const presets = getAllPresets();
  const [expandedPresets, setExpandedPresets] = useState<Record<string, boolean>>({});

  // Remote tema ID'lerini set olarak tut (icon gösterimi için)
  const remoteThemeIds = new Set(remoteThemes.map((t) => t.id));

  const handlePresetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreset(event.target.value);
  };

  const toggleExpanded = (presetId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedPresets((prev) => ({
      ...prev,
      [presetId]: !prev[presetId],
    }));
  };

  // Loading durumu
  if (remotesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          {t('theme.presets.loading', 'Temalar yükleniyor...')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('theme.presets.title', 'Tema Seç')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('theme.presets.subtitle', 'Uygulamanız için bir renk teması seçin')}
        {remoteThemes.length > 0 && (
          <Typography component="span" variant="body2" color="primary.main" sx={{ ml: 1 }}>
            ({remoteThemes.length} {t('theme.presets.remoteCount', 'özel tema')})
          </Typography>
        )}
      </Typography>

      <FormControl component="fieldset" fullWidth>
        <RadioGroup value={activePresetId} onChange={handlePresetChange}>
          <Grid container spacing={2}>
            {presets.map((preset) => {
              const isExpanded = expandedPresets[preset.id] || false;
              const isRemote = remoteThemeIds.has(preset.id);

              return (
                <Grid item xs={12} sm={6} md={4} key={preset.id}>
                  <Card
                    sx={{
                      border: 2,
                      borderColor: activePresetId === preset.id ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => setPreset(preset.id)}
                  >
                    <CardContent sx={{ pb: isExpanded ? 1 : 2 }}>
                      <Stack spacing={2}>
                        {/* Header with Radio */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">
                              {t(preset.name, preset.id)}
                            </Typography>
                            {isRemote && (
                              <CloudIcon
                                fontSize="small"
                                sx={{ color: 'primary.main', opacity: 0.7 }}
                                titleAccess={t('theme.presets.remote', 'Özel tema')}
                              />
                            )}
                          </Box>
                          <FormControlLabel
                            value={preset.id}
                            control={<Radio />}
                            label=""
                            sx={{ m: 0 }}
                          />
                        </Box>

                        {/* Description */}
                        <Typography variant="body2" color="text.secondary">
                          {t(preset.description, `${preset.id} theme description`)}
                        </Typography>

                        {/* Color Preview - Compact */}
                        <Box>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip
                              size="small"
                              label="Primary"
                              sx={{
                                backgroundColor: preset.colors.primary[500],
                                color: '#fff',
                                fontWeight: 600,
                              }}
                            />
                            <Chip
                              size="small"
                              label="Light"
                              sx={{
                                backgroundColor: preset.colors.light.bg,
                                color: preset.colors.light.text,
                                border: '1px solid',
                                borderColor: preset.colors.light.border,
                              }}
                            />
                            <Chip
                              size="small"
                              label="Dark"
                              sx={{
                                backgroundColor: preset.colors.dark.bg,
                                color: preset.colors.dark.text,
                              }}
                            />
                          </Stack>
                        </Box>

                        {/* Gradient Preview */}
                        <Box
                          sx={{
                            height: 40,
                            borderRadius: 1,
                            background: `linear-gradient(${preset.gradients.primary.angle ?? 135}deg, ${preset.gradients.primary.colors.join(', ')})`,
                          }}
                        />

                        {/* Expand Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -1 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => toggleExpanded(preset.id, e)}
                            sx={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s',
                            }}
                          >
                            <ExpandMoreIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Stack>
                    </CardContent>

                    {/* Expanded Details */}
                    <Collapse in={isExpanded}>
                      <CardContent
                        sx={{
                          pt: 0,
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'action.hover',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Stack spacing={2}>
                          {/* Primary Color Scale */}
                          <ColorScalePreview colors={preset.colors.primary} />

                          {/* Mode Colors */}
                          <ModeColorsPreview
                            darkColors={preset.colors.dark}
                            lightColors={preset.colors.light}
                          />

                          {/* Semantic Colors */}
                          <SemanticColorsPreview semanticColors={semanticColors} />

                          {/* Gradients */}
                          <GradientsPreview gradients={preset.gradients} />

                          {/* Chart Colors */}
                          <ChartColorsPreview chartColors={preset.chart} />
                        </Stack>
                      </CardContent>
                    </Collapse>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </RadioGroup>
      </FormControl>
    </Box>
  );
}
