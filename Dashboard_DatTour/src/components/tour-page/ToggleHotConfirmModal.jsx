import React from "react";
import { FiZap, FiToggleLeft, FiToggleRight } from "react-icons/fi";

export const ToggleHotConfirmModal = ({ tour, onCancel, onConfirm, isPending }) => {
  if (!tour) return null;

  const isActive = tour.status === "ACTIVE";
  const actionLabel = isActive ? "Tạm dừng" : "Kích hoạt";
  const accentClass = isActive ? "from-orange-50 to-white" : "from-emerald-50 to-white";
  const actionClass = isActive ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-600 hover:bg-emerald-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className={`border-b border-slate-100 bg-gradient-to-r ${accentClass} px-5 py-4`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full ${isActive ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"}`}>
              {isActive ? <FiToggleLeft className="h-5 w-5" /> : <FiToggleRight className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">{actionLabel} tour</h4>
              <p className="text-sm text-slate-500">Xác nhận trạng thái hiển thị của tour này.</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{tour.title}</p>
            <p className="mt-1 text-sm text-slate-600">
              Bạn có chắc muốn <span className="font-semibold text-slate-900">{actionLabel.toLowerCase()}</span> tour này không?
            </p>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white ${actionClass} disabled:opacity-60`}
            >
              <FiZap className="h-4 w-4" />
              {isPending ? "Đang xử lý..." : actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToggleHotConfirmModal;