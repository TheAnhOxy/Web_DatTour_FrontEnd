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

export const getAll = ({ isActive, page = 0, size = 10 } = {}) => {
  const params = {};

  if (isActive !== undefined && isActive !== null && isActive !== "") {
    params.isActive = isActive;
  }

  if (page !== undefined && page !== null) {
    params.page = page;
  }

  if (size !== undefined && size !== null) {
    params.size = size;
  }

  return client.get("/core/promotions", { params }).then(wrap);
};

export const getById = (id) => client.get(`/core/promotions/${id}`).then(wrap);

export const validate = (code) => client.get("/core/promotions/validate", { params: { code } }).then(wrap);

export const create = (payload) => client.post("/core/promotions", payload).then(wrap);

export const update = (id, payload) => client.put(`/core/promotions/${id}`, payload).then(wrap);

export const remove = (id) => client.delete(`/core/promotions/${id}`).then(wrap);

export const toggle = (id) => client.patch(`/core/promotions/${id}/toggle`).then(wrap);

export default { getAll, getById, validate, create, update, remove, toggle };