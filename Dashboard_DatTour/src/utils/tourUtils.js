export const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400";

export const formatPrice = (value) => {
  const num = Number(String(value || "").replace(/\D/g, ""));
  if (!num) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
};

export default { inputCls, formatPrice };
