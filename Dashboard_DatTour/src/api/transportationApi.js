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

export const getAll = () => client.get("/core/transportations").then(wrap);

export const getById = (id) => client.get(`/core/transportations/${id}`).then(wrap);

export default { getAll, getById };
