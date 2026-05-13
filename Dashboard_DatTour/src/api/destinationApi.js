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

export const getAll = (page = 0, size = 100) =>
  client.get(`/core/destinations?page=${page}&size=${size}`).then(wrap);

const toFormData = ({ cityName, region, country, imageUrl, file }) => {
  const formData = new FormData();
  formData.append("cityName", cityName ?? "");
  formData.append("region", region ?? "");
  formData.append("country", country ?? "");
  formData.append("imageUrl", imageUrl ?? "");
  if (file) {
    formData.append("file", file);
  }
  return formData;
};

export const create = (payload) =>
  client.post("/core/destinations", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(wrap);

export const update = (id, payload) =>
  client.put(`/core/destinations/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(wrap);

export const search = (keyword = "", page = 0, size = 6) =>
  client.get(`/core/destinations/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`).then(wrap);

export const remove = (id) => client.delete(`/core/destinations/${id}`).then(wrap);

export default { getAll, search, create, update, remove };