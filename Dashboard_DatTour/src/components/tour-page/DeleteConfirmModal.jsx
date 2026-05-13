import React from "react";

export const DeleteConfirmModal = ({
  tourToDelete,
  deleteConfirmInput,
  setDeleteConfirmInput,
  onCancel,
  onConfirm,
  deletePending,
}) => {
  if (!tourToDelete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Xóa tour này?</h3>
        <p className="mb-4 text-sm text-slate-600">
          Để xác nhận, vui lòng nhập tên tour: <span className="font-semibold">{tourToDelete.title}</span>
        </p>
        <input
          type="text"
          placeholder="Nhập tên tour..."
          value={deleteConfirmInput}
          onChange={(e) => setDeleteConfirmInput(e.target.value)}
          className="mb-4 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-red-400 focus:outline-none"
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={deleteConfirmInput.trim() !== tourToDelete.title || deletePending}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
