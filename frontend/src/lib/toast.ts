import { toast as sonner } from "sonner";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export const TOAST_TYPE: Record<"SUCCESS" | "ERROR" | "INFO" | "WARNING", ToastType> = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

export const TOAST_POSITION: Record<
  "TOP_RIGHT" | "TOP_LEFT" | "BOTTOM_RIGHT" | "BOTTOM_LEFT" | "TOP_CENTER" | "BOTTOM_CENTER",
  ToastPosition
> = {
  TOP_RIGHT: "top-right",
  TOP_LEFT: "top-left",
  BOTTOM_RIGHT: "bottom-right",
  BOTTOM_LEFT: "bottom-left",
  TOP_CENTER: "top-center",
  BOTTOM_CENTER: "bottom-center",
};

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
}

const show = (message: string, options: ToastOptions = {}) => {
  const { type = TOAST_TYPE.INFO, duration = 3000, position = TOAST_POSITION.TOP_RIGHT } = options;
  const payload = { duration, position };
  switch (type) {
    case TOAST_TYPE.SUCCESS:
      sonner.success(message, payload);
      break;
    case TOAST_TYPE.ERROR:
      sonner.error(message, payload);
      break;
    case TOAST_TYPE.WARNING:
      sonner.warning(message, payload);
      break;
    default:
      sonner.info(message, payload);
  }
};

/**
 * Pengganti modern dari Toast.jsx lama (berbasis DOM) menggunakan sonner.
 * API sengaja dibuat identik agar seluruh pemanggilan existing tetap bekerja.
 */
export const toast = {
  show,
  success: (message: string, options: ToastOptions = {}) =>
    show(message, { ...options, type: TOAST_TYPE.SUCCESS }),
  error: (message: string, options: ToastOptions = {}) =>
    show(message, { ...options, type: TOAST_TYPE.ERROR }),
  info: (message: string, options: ToastOptions = {}) =>
    show(message, { ...options, type: TOAST_TYPE.INFO }),
  warning: (message: string, options: ToastOptions = {}) =>
    show(message, { ...options, type: TOAST_TYPE.WARNING }),
};

export default toast;