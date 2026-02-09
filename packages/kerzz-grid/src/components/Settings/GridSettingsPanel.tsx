import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { GridSettings, FooterAggregationSetting } from '../../types/settings.types';
import type { SelectionMode } from '../../types/selection.types';
import type { AggregateType } from '../../types/footer.types';
import { useLocale } from '../../i18n/useLocale';

interface GridSettingsPanelProps {
  columns: GridColumnDef[];
  settings: GridSettings;
  onSelectionModeChange: (mode: SelectionMode) => void;
  onHeaderFilterChange: (columnId: string, enabled: boolean) => void;
  onFooterAggregationChange: (columnId: string, aggregation: FooterAggregationSetting) => void;
  onResetSorting: () => void;
  onResetAll: () => void;
  onClose: () => void;
}

type SectionId = 'selection' | 'filters' | 'footer' | 'actions';

const AGGREGATION_OPTIONS: Array<{ value: FooterAggregationSetting; labelKey: keyof ReturnType<typeof useLocale> }> = [
  { value: 'none', labelKey: 'aggregationNone' },
  { value: 'sum', labelKey: 'footerSum' },
  { value: 'avg', labelKey: 'footerAvg' },
  { value: 'count', labelKey: 'footerCount' },
  { value: 'min', labelKey: 'footerMin' },
  { value: 'max', labelKey: 'footerMax' },
];

export const GridSettingsPanel = React.memo(function GridSettingsPanel({
  columns,
  settings,
  onSelectionModeChange,
  onHeaderFilterChange,
  onFooterAggregationChange,
  onResetSorting,
  onResetAll,
  onClose,
}: GridSettingsPanelProps) {
  const locale = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(['selection', 'filters', 'footer', 'actions'])
  );

  // Columns that have filter config
  const filterableColumns = columns.filter((c) => c.filter != null);

  // Columns that are numeric (can have footer aggregation)
  const numericColumns = columns.filter((c) => {
    // Check if column has numeric filter or accessor suggests numeric
    if (c.filter?.type === 'numeric') return true;
    // Check footer config
    if (c.footer) return true;
    return false;
  });

  const toggleSection = useCallback((sectionId: SectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const getHeaderFilterEnabled = (columnId: string): boolean => {
    // Default to true if not explicitly set
    return settings.headerFilters[columnId] !== false;
  };

  const getFooterAggregation = (columnId: string): FooterAggregationSetting => {
    return settings.footerAggregation[columnId] ?? 'none';
  };

  return (
    <div className="kz-settings-panel" ref={panelRef}>
      <div className="kz-settings-panel__header">
        <span>{locale.settingsTitle}</span>
        <button
          type="button"
          className="kz-settings-panel__close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="kz-settings-panel__content">
        {/* Selection Mode Section */}
        <div className="kz-settings-panel__section">
          <button
            type="button"
            className="kz-settings-panel__section-header"
            onClick={() => toggleSection('selection')}
          >
            <span>{locale.settingsSelectionMode}</span>
            <ChevronIcon expanded={expandedSections.has('selection')} />
          </button>
          {expandedSections.has('selection') && (
            <div className="kz-settings-panel__section-content">
              <div className="kz-settings-panel__radio-group">
                <label className="kz-settings-panel__radio">
                  <input
                    type="radio"
                    name="selectionMode"
                    checked={settings.selectionMode === 'none'}
                    onChange={() => onSelectionModeChange('none')}
                  />
                  <span>{locale.selectionNone}</span>
                </label>
                <label className="kz-settings-panel__radio">
                  <input
                    type="radio"
                    name="selectionMode"
                    checked={settings.selectionMode === 'single'}
                    onChange={() => onSelectionModeChange('single')}
                  />
                  <span>{locale.selectionSingle}</span>
                </label>
                <label className="kz-settings-panel__radio">
                  <input
                    type="radio"
                    name="selectionMode"
                    checked={settings.selectionMode === 'multiple'}
                    onChange={() => onSelectionModeChange('multiple')}
                  />
                  <span>{locale.selectionMultiple}</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Header Filters Section */}
        {filterableColumns.length > 0 && (
          <div className="kz-settings-panel__section">
            <button
              type="button"
              className="kz-settings-panel__section-header"
              onClick={() => toggleSection('filters')}
            >
              <span>{locale.settingsHeaderFilters}</span>
              <ChevronIcon expanded={expandedSections.has('filters')} />
            </button>
            {expandedSections.has('filters') && (
              <div className="kz-settings-panel__section-content">
                <div className="kz-settings-panel__list">
                  {filterableColumns.map((col) => (
                    <label key={col.id} className="kz-settings-panel__toggle-item">
                      <span>{col.header}</span>
                      <input
                        type="checkbox"
                        checked={getHeaderFilterEnabled(col.id)}
                        onChange={(e) => onHeaderFilterChange(col.id, e.target.checked)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Aggregation Section */}
        {numericColumns.length > 0 && (
          <div className="kz-settings-panel__section">
            <button
              type="button"
              className="kz-settings-panel__section-header"
              onClick={() => toggleSection('footer')}
            >
              <span>{locale.settingsFooterAggregation}</span>
              <ChevronIcon expanded={expandedSections.has('footer')} />
            </button>
            {expandedSections.has('footer') && (
              <div className="kz-settings-panel__section-content">
                <div className="kz-settings-panel__list">
                  {numericColumns.map((col) => (
                    <div key={col.id} className="kz-settings-panel__select-item">
                      <span>{col.header}</span>
                      <select
                        value={getFooterAggregation(col.id)}
                        onChange={(e) =>
                          onFooterAggregationChange(col.id, e.target.value as FooterAggregationSetting)
                        }
                      >
                        {AGGREGATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {locale[opt.labelKey]}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions Section */}
        <div className="kz-settings-panel__section">
          <button
            type="button"
            className="kz-settings-panel__section-header"
            onClick={() => toggleSection('actions')}
          >
            <span>Actions</span>
            <ChevronIcon expanded={expandedSections.has('actions')} />
          </button>
          {expandedSections.has('actions') && (
            <div className="kz-settings-panel__section-content">
              <div className="kz-settings-panel__actions">
                <button
                  type="button"
                  className="kz-settings-panel__action-btn"
                  onClick={onResetSorting}
                >
                  {locale.settingsResetSorting}
                </button>
                <button
                  type="button"
                  className="kz-settings-panel__action-btn kz-settings-panel__action-btn--danger"
                  onClick={onResetAll}
                >
                  {locale.settingsResetAll}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      style={{
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.15s ease',
      }}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
