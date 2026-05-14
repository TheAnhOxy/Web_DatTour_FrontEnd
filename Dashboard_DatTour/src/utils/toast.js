import { toast as baseToast } from "react-toastify";

const shortToastOptions = { autoClose: 1000 };

const wrap = (method) => (message, options = {}) => {
  const toastId = method(message, { ...shortToastOptions, ...options });
  window.setTimeout(() => baseToast.dismiss(toastId), shortToastOptions.autoClose);
  return toastId;
};

export const toast = {
  success: wrap(baseToast.success),
  error: wrap(baseToast.error),
  warn: wrap(baseToast.warn),
  warning: wrap(baseToast.warn),
  info: wrap(baseToast.info),
  loading: baseToast.loading,
  dismiss: baseToast.dismiss,
  update: baseToast.update,
  promise: (promise, messages, options = {}) => {
    const wrappedOptions = { ...shortToastOptions, ...options };
    const toastId = baseToast.promise(promise, messages, wrappedOptions);
    window.setTimeout(() => baseToast.dismiss(toastId), shortToastOptions.autoClose);
    return toastId;
  },
  isActive: baseToast.isActive,
  done: baseToast.done,
};

export default toast;