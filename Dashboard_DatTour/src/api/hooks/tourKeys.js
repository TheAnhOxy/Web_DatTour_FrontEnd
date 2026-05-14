export const TOUR_KEYS = {
  all: ["tours"],
  lists: () => ["tours", "list"],
  list: (filters) => ["tours", "list", filters],
  searches: () => ["tours", "search"],
  search: (filters) => ["tours", "search", filters],
  detail: (id) => ["tours", "detail", String(id)],
  images: (tourId) => ["tours", String(tourId), "images"],
  departures: (tourId) => ["tours", String(tourId), "departures"],
  pricingRules: (departureId) => ["departures", String(departureId), "pricing-rules"],
  categories: ["master", "categories"],
  destinations: ["master", "destinations"],
};

