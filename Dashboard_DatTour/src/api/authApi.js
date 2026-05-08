import client from "./client";

const wrap = (res) => {
  // Expect backend already returns ApiResponse; normalize
  if (res && res.data && typeof res.data === "object") return res.data;
  return { status: res.status || 500, message: res.statusText, data: null };
};

export const login = async ({ email, password }) => {
  try {
    const res = await client.post("/auth/login", { email, password });
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const register = async (payload) => {
  try {
    const res = await client.post("/auth/register", payload);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await client.post(
      `/auth/forgot-password?email=${encodeURIComponent(email)}`,
    );
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const resetPassword = async (payload) => {
  try {
    const res = await client.post("/auth/reset-password", payload);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const res = await client.post(`/auth/verify-otp`, { email, otp });
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const logout = async () => {
  try {
    const res = await client.post("/auth/logout");
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const introspect = async (token) => {
  try {
    const res = await client.post("/auth/introspect", { token });
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

// Admin / User Management
export const getAllUsers = async () => {
  try {
    const res = await client.get("/auth/admin/users");
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const getUserById = async (id) => {
  try {
    const res = await client.get(`/auth/admin/users/${id}`);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const updateProfile = async (id, payload) => {
  try {
    const res = await client.put(`/auth/profile/${id}`, payload);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const updateUserAdmin = async (id, payload) => {
  try {
    // Only send fields that the backend UpdateProfileRequest supports.
    const allowed = [
      "fullName",
      "phone",
      "address",
      "dob",
      "gender",
      "avatarUrl",
      // Uncomment if backend accepts status from admin
      // 'status',
    ];
    const body = {};
    allowed.forEach((k) => {
      if (
        payload &&
        Object.prototype.hasOwnProperty.call(payload, k) &&
        payload[k] !== null &&
        payload[k] !== undefined
      ) {
        body[k] = payload[k];
      }
    });

    const res = await client.put(`/auth/admin/users/${id}`, body);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const assignRoles = async (payload) => {
  try {
    const res = await client.post(`/auth/admin/assign-roles`, payload);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await client.delete(`/auth/admin/users/${id}`);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const getUsersWithBookings = async () => {
  try {
    const res = await client.get(`/auth/admin/users-with-bookings`);
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export default {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyOtp,
  logout,
  introspect,
  getAllUsers,
  updateProfile,
  assignRoles,
  deleteUser,
  getUserById,
  updateUserAdmin,
  getUsersWithBookings,
};
