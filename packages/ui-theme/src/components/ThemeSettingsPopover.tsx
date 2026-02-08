import React from 'react';
import {
  Popover,
  Box,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  alpha,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Check as CheckIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../stores/themeStore';

export interface ThemeSettingsPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

/**
 * Theme Settings Popover Component
 * Dark/Light mode ve tema preset secimi icin compact popup
 * Remote (DB'den) ve local preset'leri destekler
 */
export function ThemeSettingsPopover({ anchorEl, onClose }: ThemeSettingsPopoverProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDark, toggleTheme, activePresetId, setPreset, getAllPresets, remotesLoading, remoteThemes } = useThemeStore();
  // getAllPresets() remote + local temaları birleştirir
  const presets = getAllPresets();

  // Remote tema ID'lerini set olarak tut (icon gösterimi için)
  const remoteThemeIds = new Set(remoteThemes.map((t) => t.id));

  const handlePresetClick = (presetId: string) => {
    setPreset(presetId);
  };

  const handleThemeToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: 'light' | 'dark' | null,
  ) => {
    if (newValue !== null) {
      if ((newValue === 'dark' && !isDark) || (newValue === 'light' && isDark)) {
        toggleTheme();
      }
    }
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          mt: 1,
          minWidth: 280,
          maxWidth: 320,
          p: 2,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <Stack spacing={2.5}>
        {/* Dark/Light Mode Toggle */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: 'text.secondary',
              mb: 1,
              display: 'block',
            }}
          >
            {t('theme.toggle', 'Tema Modu')}
          </Typography>
          <ToggleButtonGroup
            value={isDark ? 'dark' : 'light'}
            exclusive
            onChange={handleThemeToggle}
            fullWidth
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                py: 0.75,
                gap: 1,
              },
            }}
          >
            <ToggleButton value="light" aria-label="light mode">
              <LightModeIcon fontSize="small" />
              <Typography variant="body2">{t('theme.light', 'Aydınlık')}</Typography>
            </ToggleButton>
            <ToggleButton value="dark" aria-label="dark mode">
              <DarkModeIcon fontSize="small" />
              <Typography variant="body2">{t('theme.dark', 'Karanlık')}</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Theme Presets */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: 'text.secondary',
              mb: 1.5,
              display: 'block',
            }}
          >
            {t('theme.presets.title', 'Renk Teması')}
          </Typography>

          {remotesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack spacing={1.5} sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {presets.map((preset) => {
                const isActive = activePresetId === preset.id;
                const isRemote = remoteThemeIds.has(preset.id);
                return (
                  <Box
                    key={preset.id}
                    onClick={() => handlePresetClick(preset.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: isActive ? 'primary.main' : 'divider',
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: isActive ? 'primary.main' : 'primary.light',
                        bgcolor: isActive
                          ? alpha(theme.palette.primary.main, 0.12)
                          : alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    {/* Color Circle */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: preset.colors.primary[500],
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid',
                        borderColor: 'background.paper',
                        boxShadow: theme.shadows[2],
                      }}
                    >
                      {isActive && (
                        <CheckIcon
                          sx={{
                            fontSize: 18,
                            color: '#fff',
                          }}
                        />
                      )}
                    </Box>

                    {/* Preset Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isActive ? 600 : 500,
                            color: 'text.primary',
                          }}
                        >
                          {t(preset.name, preset.id)}
                        </Typography>
                        {isRemote && (
                          <Tooltip title={t('theme.presets.remote', 'Özel tema')}>
                            <CloudIcon
                              sx={{
                                fontSize: 14,
                                color: 'primary.main',
                                opacity: 0.7,
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t(preset.description, '')}
                      </Typography>
                    </Box>

                    {/* Color Chips */}
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Light Mode">
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: 0.5,
                            bgcolor: preset.colors.light.bg,
                            border: '1px solid',
                            borderColor: preset.colors.light.border,
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Dark Mode">
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: 0.5,
                            bgcolor: preset.colors.dark.bg,
                            border: '1px solid',
                            borderColor: preset.colors.dark.border,
                          }}
                        />
                      </Tooltip>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Stack>
    </Popover>
  );
}

