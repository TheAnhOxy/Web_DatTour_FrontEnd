import client from "./client";

const wrap = (res) => {
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

export const getToursAdmin = ({ status, categoryId, isHot, page = 0, size = 9 } = {}) => {
  const params = Object.fromEntries(
    Object.entries({ status, categoryId, isHot, page, size }).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  return client.get("/core/tours/admin", { params }).then(wrap);
};

/**
 * Search tours for admin with keyword + filters.
 */
export const searchToursAdmin = ({ keyword, status, categoryId, isHot, page = 0, size = 9 } = {}) => {
  const params = Object.fromEntries(
    Object.entries({ keyword, status, categoryId, isHot, page, size }).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  return client.get("/core/tours/admin/search", { params }).then(wrap);
};

export const getTourById = (id) => client.get(`/core/tours/${id}`).then(wrap);

/**
 * Create tour with optional images in a single multipart request.
 * @param {Object} payload - Tour data (JSON)
 * @param {File[]} imageFiles - Array of File objects to upload (optional)
 */
export const createTour = (payload, imageFiles = []) => {
  const formData = new FormData();
  formData.append(
    "tour",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );
  imageFiles.forEach((file) => {
    formData.append("images", file);
  });
  return client
    .post("/core/tours", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(wrap);
};

export const updateTour = (id, payload) => client.put(`/core/tours/${id}`, payload).then(wrap);

export const deleteTour = (id) => client.delete(`/core/tours/${id}`).then(wrap);

export const toggleHot = (id) => client.patch(`/core/tours/${id}/hot`).then(wrap);

// Keep for backward compatibility with older hooks/pages.
export const getCategories = () => client.get("/core/categories").then(wrap);

export default {
  getToursAdmin,
  searchToursAdmin,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  toggleHot,
  getCategories,
};
