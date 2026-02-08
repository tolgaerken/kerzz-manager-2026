declare module 'react-hot-toast' {
  import { ComponentProps } from 'react';

  export interface ToasterProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    toastOptions?: Record<string, unknown>;
    gutter?: number;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
    children?: (toast: unknown) => React.ReactNode;
  }

  export function Toaster(props: ToasterProps): React.ReactElement;
}
