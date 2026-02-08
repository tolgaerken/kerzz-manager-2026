/**
 * Kategori Renkleri
 * Payment, status, delivery gibi kategori bazli renkler
 */

import type { CategoryColorMapping, PaymentCategory, StatusCategory, DeliveryStatus } from './types';
import { emerald, blue, amber, cyan, pink, slate, orange, red, green } from './colors';

/**
 * Payment kategorisi renkleri
 */
export const paymentCategoryColors: Record<PaymentCategory, CategoryColorMapping> = {
  cash: {
    light: {
      bg: emerald[50],
      border: emerald[500],
      text: emerald[700],
    },
    dark: {
      bg: `rgba(${parseInt(emerald[500].slice(1, 3), 16)}, ${parseInt(emerald[500].slice(3, 5), 16)}, ${parseInt(emerald[500].slice(5, 7), 16)}, 0.2)`,
      border: emerald[500],
      text: emerald[400],
    },
  },
  credit_card: {
    light: {
      bg: blue[50],
      border: blue[500],
      text: blue[700],
    },
    dark: {
      bg: `rgba(${parseInt(blue[500].slice(1, 3), 16)}, ${parseInt(blue[500].slice(3, 5), 16)}, ${parseInt(blue[500].slice(5, 7), 16)}, 0.2)`,
      border: blue[500],
      text: blue[400],
    },
  },
  debit_card: {
    light: {
      bg: blue[50],
      border: blue[600],
      text: blue[800],
    },
    dark: {
      bg: `rgba(${parseInt(blue[600].slice(1, 3), 16)}, ${parseInt(blue[600].slice(3, 5), 16)}, ${parseInt(blue[600].slice(5, 7), 16)}, 0.2)`,
      border: blue[600],
      text: blue[300],
    },
  },
  meal_voucher: {
    light: {
      bg: amber[50],
      border: amber[500],
      text: amber[700],
    },
    dark: {
      bg: `rgba(${parseInt(amber[500].slice(1, 3), 16)}, ${parseInt(amber[500].slice(3, 5), 16)}, ${parseInt(amber[500].slice(5, 7), 16)}, 0.2)`,
      border: amber[500],
      text: amber[400],
    },
  },
  voucher: {
    light: {
      bg: orange[50],
      border: orange[500],
      text: orange[700],
    },
    dark: {
      bg: `rgba(${parseInt(orange[500].slice(1, 3), 16)}, ${parseInt(orange[500].slice(3, 5), 16)}, ${parseInt(orange[500].slice(5, 7), 16)}, 0.2)`,
      border: orange[500],
      text: orange[400],
    },
  },
  mobile: {
    light: {
      bg: cyan[50],
      border: cyan[500],
      text: cyan[700],
    },
    dark: {
      bg: `rgba(${parseInt(cyan[500].slice(1, 3), 16)}, ${parseInt(cyan[500].slice(3, 5), 16)}, ${parseInt(cyan[500].slice(5, 7), 16)}, 0.2)`,
      border: cyan[500],
      text: cyan[400],
    },
  },
  other: {
    light: {
      bg: pink[50],
      border: pink[500],
      text: pink[700],
    },
    dark: {
      bg: `rgba(${parseInt(pink[500].slice(1, 3), 16)}, ${parseInt(pink[500].slice(3, 5), 16)}, ${parseInt(pink[500].slice(5, 7), 16)}, 0.2)`,
      border: pink[500],
      text: pink[400],
    },
  },
};

/**
 * Status kategorisi renkleri
 */
export const statusCategoryColors: Record<StatusCategory, CategoryColorMapping> = {
  pending: {
    light: {
      bg: amber[50],
      border: amber[500],
      text: amber[700],
    },
    dark: {
      bg: `rgba(${parseInt(amber[500].slice(1, 3), 16)}, ${parseInt(amber[500].slice(3, 5), 16)}, ${parseInt(amber[500].slice(5, 7), 16)}, 0.2)`,
      border: amber[500],
      text: amber[400],
    },
  },
  confirmed: {
    light: {
      bg: green[50],
      border: green[500],
      text: green[700],
    },
    dark: {
      bg: `rgba(${parseInt(green[500].slice(1, 3), 16)}, ${parseInt(green[500].slice(3, 5), 16)}, ${parseInt(green[500].slice(5, 7), 16)}, 0.2)`,
      border: green[500],
      text: green[400],
    },
  },
  cancelled: {
    light: {
      bg: red[50],
      border: red[500],
      text: red[700],
    },
    dark: {
      bg: `rgba(${parseInt(red[500].slice(1, 3), 16)}, ${parseInt(red[500].slice(3, 5), 16)}, ${parseInt(red[500].slice(5, 7), 16)}, 0.2)`,
      border: red[500],
      text: red[400],
    },
  },
  completed: {
    light: {
      bg: blue[50],
      border: blue[500],
      text: blue[700],
    },
    dark: {
      bg: `rgba(${parseInt(blue[500].slice(1, 3), 16)}, ${parseInt(blue[500].slice(3, 5), 16)}, ${parseInt(blue[500].slice(5, 7), 16)}, 0.2)`,
      border: blue[500],
      text: blue[400],
    },
  },
  rejected: {
    light: {
      bg: slate[100],
      border: slate[500],
      text: slate[700],
    },
    dark: {
      bg: slate[800],
      border: slate[600],
      text: slate[300],
    },
  },
};

/**
 * Delivery status renkleri
 */
export const deliveryStatusColors: Record<DeliveryStatus, CategoryColorMapping> = {
  preparing: {
    light: {
      bg: amber[50],
      border: amber[500],
      text: amber[700],
    },
    dark: {
      bg: `rgba(${parseInt(amber[500].slice(1, 3), 16)}, ${parseInt(amber[500].slice(3, 5), 16)}, ${parseInt(amber[500].slice(5, 7), 16)}, 0.2)`,
      border: amber[500],
      text: amber[400],
    },
  },
  ready: {
    light: {
      bg: blue[50],
      border: blue[500],
      text: blue[700],
    },
    dark: {
      bg: `rgba(${parseInt(blue[500].slice(1, 3), 16)}, ${parseInt(blue[500].slice(3, 5), 16)}, ${parseInt(blue[500].slice(5, 7), 16)}, 0.2)`,
      border: blue[500],
      text: blue[400],
    },
  },
  on_delivery: {
    light: {
      bg: orange[50],
      border: orange[500],
      text: orange[700],
    },
    dark: {
      bg: `rgba(${parseInt(orange[500].slice(1, 3), 16)}, ${parseInt(orange[500].slice(3, 5), 16)}, ${parseInt(orange[500].slice(5, 7), 16)}, 0.2)`,
      border: orange[500],
      text: orange[400],
    },
  },
  delivered: {
    light: {
      bg: green[50],
      border: green[500],
      text: green[700],
    },
    dark: {
      bg: `rgba(${parseInt(green[500].slice(1, 3), 16)}, ${parseInt(green[500].slice(3, 5), 16)}, ${parseInt(green[500].slice(5, 7), 16)}, 0.2)`,
      border: green[500],
      text: green[400],
    },
  },
};

/**
 * Tum kategori renkleri
 */
export const categoryColors = {
  payment: paymentCategoryColors,
  status: statusCategoryColors,
  delivery: deliveryStatusColors,
};

