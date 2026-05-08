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

export const createBooking = async (bookingData: any) => {
  try {
    const res = await client.post("/bookings/create", bookingData);
    return wrap(res);
  } catch (err: any) {
    return { status: 500, message: err.message, data: null };
  }
};

export default {
  createBooking,
};
