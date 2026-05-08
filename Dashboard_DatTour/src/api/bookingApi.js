import client from './client';

const wrap = (res) => {
  // If backend already returns ApiResponse {status,message,data}, forward it.
  if (res && res.data && typeof res.data === 'object' && (res.data.status !== undefined || res.data.message !== undefined || res.data.data !== undefined)) {
    return res.data;
  }
  // Otherwise normalize to ApiResponse shape
  return { status: res?.status || 200, message: null, data: res?.data ?? null };
};

export const getAllBookings = async () => {
  try {
    const res = await client.get('/bookings/all');
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const getBookingsByUser = async (userId) => {
  try {
    const res = await client.get(`/bookings/user/${userId}`);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const getBookingByCode = async (code) => {
  try {
    const res = await client.get(`/bookings/${encodeURIComponent(code)}`);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const getPassengerById = async (id) => {
  try {
    const res = await client.get(`/bookings/passenger/${id}`);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const getPassengerHistoryByIdCard = async (idCardNumber) => {
  try {
    const res = await client.get(`/bookings/passenger/history/${encodeURIComponent(idCardNumber)}`);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const getAllPassengers = async () => {
  try {
    const res = await client.get(`/bookings/passenger/all`);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const getBookingsByUsers = async (userIds) => {
  try {
    const q = Array.isArray(userIds) ? userIds.join(',') : String(userIds);
    const res = await client.get(`/bookings/by-users?userIds=${encodeURIComponent(q)}`);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export default {
  getAllBookings,
  getBookingsByUser,
  getBookingByCode,
  getPassengerById,
  getPassengerHistoryByIdCard,
  getAllPassengers,
  getBookingsByUsers,
};
