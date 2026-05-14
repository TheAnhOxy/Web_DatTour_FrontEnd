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

export const getAll = () => client.get("/core/categories").then(wrap);

export const create = ({ name }) => client.post("/core/categories", { name }).then(wrap);

export const update = (id, { name }) => client.put(`/core/categories/${id}`, { name }).then(wrap);

export const remove = (id) => client.delete(`/core/categories/${id}`).then(wrap);

export default { getAll, create, update, remove };
