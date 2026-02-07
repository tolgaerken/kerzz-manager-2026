import React, { memo } from 'react';

interface ToolbarButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
  title?: string;
}

export const ToolbarButton = memo(function ToolbarButton({
  label,
  icon,
  onClick,
  disabled = false,
  variant = 'default',
  title,
}: ToolbarButtonProps) {
  const className = [
    'kz-toolbar__btn',
    variant !== 'default' && `kz-toolbar__btn--${variant}`,
    disabled && 'kz-toolbar__btn--disabled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
    >
      {icon && <span className="kz-toolbar__btn-icon">{icon}</span>}
      <span className="kz-toolbar__btn-label">{label}</span>
    </button>
  );
});
