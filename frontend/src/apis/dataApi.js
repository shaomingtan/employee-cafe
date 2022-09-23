import axios from 'axios';

// TODO pass this as an env variable to support different environments
const BACKEND_ENDPOINT = "http://localhost:8000"

export const getCafes = async (location='') => {
  try {
    const result = await axios.get(`${BACKEND_ENDPOINT}/cafes?location=${location}`);
    return result.data
  } catch (e) {
    console.log("getCafes error", e)
  }
}

export const createCafe = async (data) => {
  try {
    return await axios.post(`${BACKEND_ENDPOINT}/cafe`, data);
  } catch (e) {
    console.log("createCafe error", e)
  }
}

export const updateCafe = async (cafeId, data) => {
  try {
    return await axios.put(`${BACKEND_ENDPOINT}/cafe/${cafeId}`, data);
  } catch (e) {
    console.log("updateCafe error", e)
  }
}

export const deleteCafe = async (cafeId) => {
  try {
    return axios.delete(`${BACKEND_ENDPOINT}/cafe/${cafeId}`);
  } catch (e) {
    console.log("deleteCafe error", e)
  }
}

export const getEmployees = async (location='') => {
  try {
    const result = await axios.get(`${BACKEND_ENDPOINT}/employees?location=${location}`);
    return result.data
  } catch (e) {
    console.log("getEmployees error", e)
  }
}

export const createEmployee = async (data) => {
  try {
    return await axios.post(`${BACKEND_ENDPOINT}/employee`, data);
  } catch (e) {
    console.log("createEmployee error", e)
  }
}

export const updateEmployee = async (employeeId, data) => {
  try {
    return await axios.put(`${BACKEND_ENDPOINT}/employee/${employeeId}`, data);
  } catch (e) {
    console.log("updateEmployee error", e)
  }
}

export const deleteEmployee = async (employeeId) => {
  try {
    return axios.delete(`${BACKEND_ENDPOINT}/employee/${employeeId}`);
  } catch (e) {
    console.log("deleteEmployee error", e)
  }
}

