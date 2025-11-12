// src/api/analyticsAPI.js
import axios from "axios";
const API_BASE_URL = "http://localhost:5000/api/analytics";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getCourseAnalytics = async () =>
  (await axios.get(`${API_BASE_URL}/course`, authHeader())).data;

export const getInstructorAnalytics = async () =>
  (await axios.get(`${API_BASE_URL}/instructor`, authHeader())).data;

export const getComparisonAnalytics = async () =>
  (await axios.get(`${API_BASE_URL}/compare`, authHeader())).data;

export const getDepartmentAnalytics = async () =>
  (await axios.get(`${API_BASE_URL}/department`, authHeader())).data;

export const getTrendAnalytics = async () =>
  (await axios.get(`${API_BASE_URL}/trend`, authHeader())).data;
