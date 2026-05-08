import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  bookingStatusSeries,
  kpiCards,
  liveOperations,
  popularTours,
  recentBookings,
  revenueSeries,
} from "../data/adminMockData";

const statusToneClass = {
  Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  Completed: "bg-sky-50 text-sky-700 border-sky-200",
};

const formatMoney = (value) => `${value}M`;

export const Dashboard = () => {
  return (
    <div className="space-y-4 text-slate-700">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 right-24 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-blue-100">
              Enterprise tour control center
            </p>
            <h1 className="max-w-2xl text-4xl leading-[1.05] tracking-tight text-white md:text-[52px]">
              Dashboard điều hành tour booking
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-[15px]">
              Fake data mô phỏng identity, core, booking, payment, notification
              và support review. Khi backend Spring microservice sẵn sàng, chỉ
              cần đổi nguồn dữ liệu.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-110">
            {liveOperations.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200">
                  {item.label}
                </p>
                <p className="mt-2 text-base font-bold text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <article
            key={card.label}
            className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br ${card.gradient} p-5 shadow-[0_16px_40px_rgba(37,99,235,0.12)] transition-transform duration-300 hover:-translate-y-1`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/85">{card.label}</p>
                <p className="mt-2 text-3xl font-black text-white">
                  {card.value}
                </p>
                <p className="mt-2 text-xs text-white/80">{card.delta}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/18 p-3 text-2xl shadow-inner shadow-black/10">
                {card.icon}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(37,99,235,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Doanh thu theo tháng
              </h2>
              <p className="text-sm text-slate-500">
                Area chart có animation, data từ core + payment
              </p>
            </div>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
              Live preview
            </span>
          </div>

          <div className="h-70">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueSeries}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.18)"
                />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatMoney}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #dbeafe",
                    borderRadius: "16px",
                    color: "#0f172a",
                  }}
                  formatter={(value) => [`${value}M`, "Doanh thu"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  fill="url(#revenueGradient)"
                  strokeWidth={3}
                  activeDot={{ r: 5 }}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-5 grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(37,99,235,0.08)]">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Tour phổ biến
              </h2>
              <p className="text-sm text-slate-500">
                Bar chart theo số booking
              </p>
            </div>
            <div className="h-55">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={popularTours}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.16)"
                  />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      borderRadius: "16px",
                      border: "1px solid #dbeafe",
                    }}
                  />
                  <Bar
                    dataKey="booking"
                    radius={[0, 12, 12, 0]}
                    isAnimationActive
                  >
                    {popularTours.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(37,99,235,0.08)]">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Trạng thái booking
              </h2>
              <p className="text-sm text-slate-500">
                Phân bố từ booking service
              </p>
            </div>
            <div className="h-55">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingStatusSeries}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={4}
                    isAnimationActive
                  >
                    {bookingStatusSeries.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      borderRadius: "16px",
                      border: "1px solid #dbeafe",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(37,99,235,0.08)]">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Booking gần đây
              </h2>
              <p className="text-sm text-slate-500">Fake data từ booking_db</p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
              Realtime UI
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-190">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-5 py-3">Mã</th>
                  <th className="px-5 py-3">Khách hàng</th>
                  <th className="px-5 py-3">Tour</th>
                  <th className="px-5 py-3">Ngày</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Giá trị</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-slate-100 text-sm text-slate-700 transition-colors hover:bg-sky-50/60"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {booking.id}
                    </td>
                    <td className="px-5 py-4">{booking.customer}</td>
                    <td className="px-5 py-4 text-slate-600">{booking.tour}</td>
                    <td className="px-5 py-4 text-slate-500">{booking.date}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusToneClass[booking.status] || "bg-slate-50 text-slate-700 border-slate-200"}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900">
                      {booking.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(37,99,235,0.08)]">
          <h2 className="text-lg font-bold text-slate-900">Quick actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Điều hướng nhanh đến các module
          </p>

          <div className="mt-5 grid gap-3">
            {[
              {
                title: "Tạo tour mới",
                desc: "Quản lý category, transport, images",
                accent: "from-cyan-500 to-blue-600",
              },
              {
                title: "Duyệt booking",
                desc: "Xem booking tour, payment, cancellation",
                accent: "from-fuchsia-500 to-violet-600",
              },
              {
                title: "Tin nhắn support",
                desc: "Nhận ticket, chat và review",
                accent: "from-emerald-500 to-teal-600",
              },
              {
                title: "Ưu đãi & promotion",
                desc: "Code giảm giá, apply tour, expiry",
                accent: "from-amber-500 to-orange-600",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl border border-slate-200 bg-gradient-to-r ${item.accent} p-px`}
              >
                <div className="rounded-2xl bg-white p-4">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
