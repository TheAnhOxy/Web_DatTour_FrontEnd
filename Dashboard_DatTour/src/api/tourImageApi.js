import client from "./client"

const wrap = (res) => {
  if (res && res.data && typeof res.data === "object" &&
    (res.data.status !== undefined || res.data.message !== undefined || res.data.data !== undefined))
    return res.data
  return { status: res?.status || 200, message: null, data: res?.data ?? null }
}

const getTourImages = (tourId) =>
  client.get(`/core/tours/${tourId}/images`).then(wrap)

const addTourImage = (tourId, payload) =>
  client.post(`/core/tours/${tourId}/images`, payload).then(wrap)

const uploadTourImage = (tourId, file) => {
  const form = new FormData()
  form.append("file", file)
  return client.post(`/core/tours/${tourId}/images/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(wrap)
}

const deleteTourImage = (tourId, imageId) =>
  client.delete(`/core/tours/${tourId}/images/${imageId}`).then(wrap)

const setCoverImage = (tourId, imageId) =>
  client.patch(`/core/tours/${tourId}/images/${imageId}/cover`).then(wrap)

export default { getTourImages, addTourImage, uploadTourImage, deleteTourImage, setCoverImage }
