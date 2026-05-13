import client from "../utils/apiClient";

const wrap = (res: any) => {
  if (
    res &&
    res.data &&
    typeof res.data === "object" &&
    (res.data.status !== undefined ||
      res.data.message !== undefined ||
      res.data.data !== undefined)
  ) {
    return res.data;
  }
  return { status: res?.status || 200, message: null, data: res?.data ?? null };
};

export const getDepartureDetails = async (id: string | number) => {
  try {
    const res = await client.get(`/core/departures/${id}`);
    const apiData = wrap(res);
    
    if (apiData.status !== 200 || !apiData.data) {
        console.warn("Không lấy được dữ liệu Departure từ backend:", apiData.message);
    }
    
    return apiData;
  } catch (err: any) {
    return { status: 500, message: err.message, data: null };
  }
};

export const getTourSchedules = async (tourId: string | number) => {
    try {
        const res = await client.get(`/core/departures/available?tourId=${tourId}`);
        return wrap(res);
    } catch (err: any) {
        return { status: 500, message: err.message, data: [] };
    }
};

export const getTourDetails = async (tourId: string | number) => {
    try {
        const res = await client.get(`/core/tours/${tourId}`);
        return wrap(res);
    } catch (err: any) {
        return { status: 500, message: err.message, data: null };
    }
};

export const getDestinations = async (page = 0, size = 10) => {
    try {
        const res = await client.get(`/core/destinations?page=${page}&size=${size}`);
        return wrap(res);
    } catch (err: any) {
        return { status: 500, message: err.message, data: null };
    }
};

export const getTours = async (categoryId?: number, isHot?: boolean, page = 0, size = 10) => {
    try {
        let url = `/core/tours?page=${page}&size=${size}`;
        if (categoryId) url += `&categoryId=${categoryId}`;
        if (isHot !== undefined) url += `&isHot=${isHot}`;
        const res = await client.get(url);
        return wrap(res);
    } catch (err: any) {
        return { status: 500, message: err.message, data: null };
    }
};

export default {
    getDepartureDetails,
    getTourSchedules,
    getTourDetails,
    getDestinations,
    getTours
};
