import api from "./api";

export const getFinancialSummary = async (params = {}) => (await api.get("/reports/financial-summary", { params })).data;
export const getCollectionPerformance = async (params = {}) => (await api.get("/reports/collection-performance", { params })).data;
export const getLenderCollection = async (params = {}) => (await api.get("/reports/lender-collection", { params })).data;
export const getMonthlyCollection = async (params = {}) => (await api.get("/reports/monthly-collection", { params })).data;
export const getTelecallerCollection = async (params = {}) => (await api.get("/reports/telecaller-collection", { params })).data;
export const getDashboard = async () => (await api.get("/dashboard")).data;
