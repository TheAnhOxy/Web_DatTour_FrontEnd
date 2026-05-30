/* eslint-disable @typescript-eslint/no-explicit-any */
import client from "../utils/apiClient";

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY || "http://localhost:8080";

const wrap = (res: any) => {
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

const optionalGet = async (endpoint: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_GATEWAY}${endpoint}`, { method: "GET", headers });
    const text = await res.text();
    let body: any = {};
    try {
        body = text ? JSON.parse(text) : {};
    } catch {
        body = text;
    }

    if (!res.ok) {
        return {
            status: res.status,
            message: body?.message || res.statusText,
            data: [],
        };
    }

    return wrap({ status: res.status, data: body });
};

const optionalPost = async (endpoint: string, payload: unknown) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_GATEWAY}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });
    const text = await res.text();
    let body: any = {};
    try {
        body = text ? JSON.parse(text) : {};
    } catch {
        body = text;
    }

    if (!res.ok) {
        return {
            status: res.status,
            message: body?.message || res.statusText,
            data: null,
        };
    }

    return wrap({ status: res.status, data: body });
};

export const getDepartureDetails = async (id: string | number) => {
    try {
        const res = await client.get(`/core/departures/${id}`);
        const apiData = wrap(res);

        if (apiData.status !== 200 || !apiData.data) {
            console.warn("Không lấy được dữ liệu Departure từ backend:", apiData.message);
        }

        return apiData;
    } catch (err: any) {
        return { status: 500, message: err.message, data: null };
    }
};

export const getTourSchedules = async (tourId: string | number) => {
    try {
        const res = await client.get(`/core/departures/available?tourId=${tourId}`);
        return wrap(res);
    } catch (err: any) {
        return { status: 500, message: err.message, data: [] };
    }
};

export const getTourReviews = async (tourId: string | number) => {
    try {
        return await optionalGet(`/core/tour-reviews?tourId=${tourId}`);
    } catch (err: any) {
        return { status: 500, message: err.message, data: [] };
    }
};

export const getTourQuestions = async (tourId: string | number) => {
    try {
        return await optionalGet(`/core/questions?tourId=${tourId}`);
    } catch (err: any) {
        return { status: 500, message: err.message, data: [] };
    }
};

export const createTourQuestion = async (tourId: string | number, question: string) => {
    try {
        return await optionalPost(`/core/questions`, {
            tourId: Number(tourId),
            question,
        });
    } catch (err: any) {
        return { status: 500, message: err.message, data: null };
    }
};

export const getTourDetails = async (tourId: string | number) => {
    try {
        const res = await client.get(`/core/tours/${tourId}`);
        return wrap(res);
    } catch (err: any) {
        return { status: 500, message: err.message, data: null };
    }
};

export const getDestinations = async (page = 0, size = 10) => {
    try {
        const res = await client.get(`/core/destinations?page=${page}&size=${size}`);
        return wrap(res);
    } catch (err: any) {
        return { status: 500, message: err.message, data: null };
    }
};

export const getCategories = async () => {
    try {
        const res = await client.get(`/core/categories`);
        return wrap(res);
    } catch (err: any) {
        return { status: 500, message: err.message, data: [] };
    }
};

export const getTours = async (categoryId?: number, isHot?: boolean, destinationId?: number, page = 0, size = 10, keyword?: string) => {
    try {
        let url = `/core/tours?page=${page}&size=${size}`;
        if (categoryId) url += `&categoryId=${categoryId}`;
        if (isHot !== undefined) url += `&isHot=${isHot}`;
        if (destinationId) url += `&destinationId=${destinationId}`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
        const res = await client.get(url);
        return wrap(res);
    } catch (err: any) {
        return { status: 500, message: err.message, data: null };
    }
};

export const getDestinationById = async (id: number) => {
    try {
        const res = await client.get(`/core/destinations/${id}`);
        return wrap(res);
    } catch (err: any) {
        return { status: 500, message: err.message, data: null };
    }
};

export const searchTours = async (payload: any, page = 0, size = 100) => {
    try {
        const res = await client.post(`/search?page=${page}&size=${size}`, payload);
        return wrap(res);
    } catch (err: any) {
        return { status: 500, message: err.message, data: [] };
    }
};

export default {
    getDepartureDetails,
    getTourSchedules,
    getTourReviews,
    getTourQuestions,
    createTourQuestion,
    getTourDetails,
    getDestinations,
    getDestinationById,
    getCategories,
    getTours,
    searchTours
};