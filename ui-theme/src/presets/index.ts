/**
 * Presets Index
 * Tum preset'leri export eden merkezi dosya
 */

export * from './types';
export { kerzzRedPreset } from './kerzz-red';
export { oceanBluePreset } from './ocean-blue';
export { forestGreenPreset } from './forest-green';
export { sunsetOrangePreset } from './sunset-orange';
export { midnightPurplePreset } from './midnight-purple';
export { anthraciteGrayPreset } from './anthracite-gray';

import { kerzzRedPreset } from './kerzz-red';
import { oceanBluePreset } from './ocean-blue';
import { forestGreenPreset } from './forest-green';
import { sunsetOrangePreset } from './sunset-orange';
import { midnightPurplePreset } from './midnight-purple';
import { anthraciteGrayPreset } from './anthracite-gray';
import type { PresetCollection, ThemeSemanticColors } from './types';
import { semanticColors } from '../tokens/semantic';

/**
 * Tum preset'lerin koleksiyonu
 */
export const presets: PresetCollection = {
  'kerzz-red': kerzzRedPreset,
  'ocean-blue': oceanBluePreset,
  'forest-green': forestGreenPreset,
  'sunset-orange': sunsetOrangePreset,
  'midnight-purple': midnightPurplePreset,
  'anthracite-gray': anthraciteGrayPreset,
};

/**
 * Varsayilan preset ID'si
 */
export const DEFAULT_PRESET_ID = 'kerzz-red';

/**
 * Preset ID'sine gore preset alma
 */
export function getPreset(presetId: string) {
  return presets[presetId] || presets[DEFAULT_PRESET_ID];
}

/**
 * Tum preset ID'lerini alma
 */
export function getPresetIds(): string[] {
  return Object.keys(presets);
}

/**
 * Preset listesi (UI icin)
 */
export function getPresetList() {
  return Object.values(presets);
}

/**
 * Preset ID'sine gore semantic renkleri alma
 * Preset'in kendi semantic renkleri varsa onlari, yoksa varsayilani dondurur
 */
export function getSemanticColors(presetId: string): ThemeSemanticColors {
  const preset = getPreset(presetId);
  return preset.semantic || semanticColors;
}

