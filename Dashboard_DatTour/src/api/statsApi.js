import client from "./client";

const wrap = (res) => {
  if (res?.data?.status !== undefined || res?.data?.message !== undefined || res?.data?.data !== undefined)
    return res.data;
  return { status: res?.status || 200, message: null, data: res?.data ?? null };
};

const statsApi = {
  getDashboardSummary: () => client.get("/core/stats/dashboard").then(wrap),
  getTourStats: () => client.get("/core/stats/tours").then(wrap),
  getPromotionStats: () => client.get("/core/stats/promotions").then(wrap),
  getWishlistStats: () => client.get("/core/stats/wishlists").then(wrap),
  getUpcomingDepartures: (limit = 5) => client.get("/core/stats/departures/upcoming", { params: { limit } }).then(wrap),
  getNearlyFullDepartures: () => client.get("/core/stats/departures/nearly-full").then(wrap),
  refreshDashboard: () => client.post("/core/stats/dashboard/refresh").then(wrap),
};

export default statsApi;
