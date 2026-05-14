import client from "./client"

const wrap = (res) => {
  if (res && res.data && typeof res.data === "object" &&
    (res.data.status !== undefined || res.data.message !== undefined || res.data.data !== undefined))
    return res.data
  return { status: res?.status || 200, message: null, data: res?.data ?? null }
}

const addDestination = (tourId, destinationId) =>
  client.post(`/core/tours/${tourId}/destinations/add`, { destinationId }).then(wrap)

const removeDestination = (tourId, destinationId) =>
  client.delete(`/core/tours/${tourId}/destinations/${destinationId}`).then(wrap)

export default { addDestination, removeDestination }
