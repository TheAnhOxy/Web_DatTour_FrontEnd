import client from "./client"

const wrap = (res) => {
  if (res && res.data && typeof res.data === "object" &&
    (res.data.status !== undefined || res.data.message !== undefined || res.data.data !== undefined))
    return res.data
  return { status: res?.status || 200, message: null, data: res?.data ?? null }
}

const getDepartures = (tourId) =>
  client.get("/core/departures", { params: { tourId, page: 0, size: 20 } }).then(wrap)

const createDeparture = (payload) =>
  client.post("/core/departures", payload).then(wrap)

const updateDeparture = (id, payload) =>
  client.put(`/core/departures/${id}`, payload).then(wrap)

const deleteDeparture = (id) =>
  client.delete(`/core/departures/${id}`).then(wrap)

const upsertPriceConfig = (departureId, payload) =>
  client.put(`/core/departures/${departureId}/price-config`, payload).then(wrap)

const getPricingRules = (departureId) =>
  client.get(`/core/departures/${departureId}/pricing-rules`).then(wrap)

const createPricingRule = (departureId, payload) =>
  client.post(`/core/departures/${departureId}/pricing-rules`, payload).then(wrap)

const updatePricingRule = (ruleId, payload) =>
  client.put(`/core/pricing-rules/${ruleId}`, payload).then(wrap)

const deletePricingRule = (ruleId) =>
  client.delete(`/core/pricing-rules/${ruleId}`).then(wrap)

const togglePricingRule = (ruleId) =>
  client.patch(`/core/pricing-rules/${ruleId}/toggle`).then(wrap)

const calculatePrice = (departureId, { adultCount = 1, child1014Count = 0, child49Count = 0, babyCount = 0 } = {}) =>
  client.get(`/core/departures/${departureId}/calculate-price`, {
    params: { adultCount, child1014Count, child49Count, babyCount }
  }).then(wrap)

export default {
  getDepartures, createDeparture, updateDeparture, deleteDeparture,
  upsertPriceConfig,
  getPricingRules, createPricingRule, updatePricingRule, deletePricingRule, togglePricingRule,
  calculatePrice,
}
