import React from 'react';

export const AddTourCard = ({ onClick, spanFull }) => {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50 ${spanFull ? 'col-span-full' : ''}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600 transition group-hover:bg-blue-200">+</div>
      <div>
        <p className="text-sm font-bold text-slate-900">Thêm Tour Mới</p>
        <p className="text-xs text-slate-500">Bắt đầu tạo lịch tour từ đây</p>
      </div>
    </button>
  );
};
