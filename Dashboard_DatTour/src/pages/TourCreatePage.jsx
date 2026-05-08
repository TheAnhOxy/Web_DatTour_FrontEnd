import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCamera, FiPlus } from "react-icons/fi";

export const TourCreatePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Du lịch biển");
  const [transport, setTransport] = useState("Máy bay");
  const [price, setPrice] = useState("");
  const [isHot, setIsHot] = useState(false);
  const [destinations, setDestinations] = useState(["Đà Nẵng"]);
  const [images, setImages] = useState([]);
  const [schedules, setSchedules] = useState([{ id: 1, date: "", seats: 30, pickup: "" }]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-slate-600">← Quay lại</button>
        <h1 className="text-2xl font-bold">Thêm Tour Mới</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-lg font-bold">Thông Tin Cơ Bản</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Tên Tour *</label>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Nhập tên tour du lịch..." className="w-full rounded-xl border border-slate-200 px-4 py-3" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Mô Tả Tour</label>
                <textarea rows={4} value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Viết mô tả chi tiết về hành trình, các điểm tham quan..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Danh Mục</label>
                  <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3">
                    <option>Du lịch biển</option>
                    <option>Nghỉ dưỡng</option>
                    <option>Du lịch khám phá</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Phương Tiện</label>
                  <select value={transport} onChange={(e)=>setTransport(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3">
                    <option>Máy bay</option>
                    <option>Xe du lịch</option>
                    <option>Thuyền</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-lg font-bold">Thư Viện Hình Ảnh</h3>
            <div className="grid grid-cols-4 gap-3">
              <label className="flex h-28 cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                <FiCamera className="text-xl" />
                <input type="file" accept="image/*" className="hidden" />
              </label>
              {images.map((img, idx)=> (
                <div key={idx} className="h-28 overflow-hidden rounded-xl border">
                  <img src={img} className="h-full w-full object-cover" alt="img" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-lg font-bold">Lịch Khởi Hành</h3>
            <div className="space-y-3">
              {schedules.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <input type="date" value={s.date} onChange={(e)=>{
                    const next = [...schedules]; next[i].date = e.target.value; setSchedules(next);
                  }} className="rounded-xl border border-slate-200 px-3 py-2" />
                  <input type="number" value={s.seats} onChange={(e)=>{
                    const next = [...schedules]; next[i].seats = e.target.value; setSchedules(next);
                  }} className="w-28 rounded-xl border border-slate-200 px-3 py-2" />
                  <input placeholder="Điểm đón" value={s.pickup} onChange={(e)=>{
                    const next = [...schedules]; next[i].pickup = e.target.value; setSchedules(next);
                  }} className="rounded-xl border border-slate-200 px-3 py-2" />
                  <button onClick={()=> setSchedules(prev=> prev.filter(x=> x.id !== s.id))} className="ml-auto text-rose-600">Xóa</button>
                </div>
              ))}
              <button onClick={()=> setSchedules(prev=> [...prev, { id: Date.now(), date: "", seats: 30, pickup: "" }])} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white"><FiPlus /> Thêm Ngày</button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-lg font-bold">Giá & Trạng Thái</h3>
            <div className="space-y-3">
              <input value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Ví dụ: 2.500.000" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
              <div className="flex items-center justify-between">
                <span>Tour Nổi Bật (Hot)</span>
                <button onClick={()=>setIsHot(v=>!v)} className={`h-6 w-11 rounded-full p-0.5 ${isHot ? 'bg-blue-600' : 'bg-slate-300'}`}><span className={`block h-5 w-5 rounded-full bg-white transition-transform ${isHot ? 'translate-x-5' : 'translate-x-0'}`} /></button>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 rounded-xl bg-black px-4 py-2 text-white">Lưu Tour</button>
                <button onClick={()=> navigate(-1)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2">Hủy bỏ</button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-lg font-bold">Điểm Đến</h3>
            <div className="space-y-2">
              <input placeholder="Tìm thành phố, điểm đến..." className="w-full rounded-xl border border-slate-200 px-4 py-2" />
              <div className="flex flex-wrap gap-2">
                {destinations.map(d=> (<span key={d} className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{d} <button onClick={()=> setDestinations(prev=> prev.filter(x=> x!==d))} className="text-rose-600">×</button></span>))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-[#071126] p-4 text-white">
            <h4 className="mb-2 font-bold">Mẹo Quản Lý</h4>
            <p className="text-sm text-slate-200">Cung cấp mô tả chi tiết và ít nhất một lịch khởi hành để tăng tỷ lệ chuyển đổi.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};
