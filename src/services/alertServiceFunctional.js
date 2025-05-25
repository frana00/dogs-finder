import { API_CONFIG } from '../config/api';
import { ALERT_STATUS } from '../constants/index';
import photoService from './photoService';

/**
 * Simplified Alert Service - Functional approach
 */
const BASE_URL = 'http://localhost:8080/api/v1';
const ALERTS_ENDPOINT = `${BASE_URL}/alerts`;

const request = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    console.error(`API Error for ${url}:`, error);
    throw error;
  }
};

const transformToBackendFormat = (alertData) => {
  let postalCode = '12345'; // Default postal code that exists in DB
  
  if (alertData.lastSeenLocation) {
    const postalMatch = alertData.lastSeenLocation.match(/\b\d{5}\b/);
    if (postalMatch) {
      postalCode = postalMatch[0];
    }
  }
  
  return {
    title: alertData.petName ? `Perro perdido: ${alertData.petName}` : alertData.title,
    description: alertData.description,
    username: 'testuser',
    type: alertData.type || 'LOST',
    chipNumber: alertData.chipNumber || alertData.chip || '',
    sex: alertData.sex || 'UNKNOWN',
    date: alertData.lastSeenDate || alertData.date || new Date().toISOString().split('T')[0] + 'T00:00:00',
    breed: alertData.breed || 'Mixed',
    postalCode: postalCode,
    countryCode: alertData.countryCode || 'CL',
    status: ALERT_STATUS.ACTIVE,
  };
};

export const getAlerts = async (params = {}) => {
  try {
    const defaultParams = { status: ALERT_STATUS.ACTIVE, ...params };
    const queryString = new URLSearchParams(defaultParams).toString();
    const url = queryString ? `${ALERTS_ENDPOINT}?${queryString}` : ALERTS_ENDPOINT;
    
    const response = await request(url);
    return response;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const getAlertById = async (id) => {
  try {
    const url = `${ALERTS_ENDPOINT}/${id}`;
    const response = await request(url);
    return response;
  } catch (error) {
    console.error(`Error fetching alert with id ${id}:`, error);
    throw error;
  }
};

export const createAlert = async (alertData, photoFiles = []) => {
  try {
    const backendData = transformToBackendFormat(alertData);
    
    console.log('Creating alert with data:', backendData);
    
    const response = await request(ALERTS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(backendData),
    });

    if (response && response.id && photoFiles.length > 0) {
      try {
        console.log('Uploading photos for alert:', response.id);
        const photoUrls = await photoService.uploadPhotosForAlert(response.id, photoFiles);
        console.log('Photos uploaded successfully:', photoUrls);
        
        response.photoUrls = photoUrls;
      } catch (photoError) {
        console.warn('Alert created but photo upload failed:', photoError);
      }
    }

    return response;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export const updateAlert = async (alertId, alertData, photoFiles = []) => {
  try {
    const backendData = transformToBackendFormat(alertData);
    const url = `${ALERTS_ENDPOINT}/${alertId}`;
    
    const response = await request(url, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });

    return response;
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
};

export const deleteAlert = async (alertId) => {
  try {
    const url = `${ALERTS_ENDPOINT}/${alertId}`;
    await request(url, { method: 'DELETE' });
    return alertId;
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
};

// Default export object with all methods
const alertService = {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert
};

export default alertService;
