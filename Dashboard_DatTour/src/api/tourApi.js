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

export const getToursAdmin = ({ status, categoryId, isHot, page = 0, size = 9 }) => {
  const params = Object.fromEntries(
    Object.entries({ status, categoryId, isHot, page, size }).filter(
      ([_, v]) => v !== undefined && v !== null && v !== ""
    )
  );
  return client.get("/core/tours/admin", { params }).then(wrap);
};

export const getCategories = () => client.get("/core/categories").then(wrap);

export const deleteTour = (id) => client.delete(`/core/tours/${id}`).then(wrap);

export const toggleHot = (id) => client.patch(`/core/tours/${id}/hot`).then(wrap);

export default { getToursAdmin, getCategories, deleteTour, toggleHot };
