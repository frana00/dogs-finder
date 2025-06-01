import { API_CONFIG, buildUrl } from '../config/api';
import { ALERT_STATUS } from '../constants/index';
import photoService from './photoService';

/**
 * Simplified Alert Service - Based on working petsignal-fe example
 */
class AlertService {
  constructor() {
    // No longer storing static URLs - we'll build them dynamically
  }

  async getAlertsEndpoint() {
    return await buildUrl(API_CONFIG.ENDPOINTS.ALERTS);
  }

  async request(url, options = {}) {
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
  }

  transformToBackendFormat(alertData) {
    // Use default postal code that exists in database
    let postalCode = '12345'; // Default postal code that exists in DB
    
    // Try to extract postal code from location string if needed
    if (alertData.lastSeenLocation) {
      const postalMatch = alertData.lastSeenLocation.match(/\b\d{5}\b/);
      if (postalMatch) {
        postalCode = postalMatch[0];
      }
    }
    
    return {
      title: alertData.petName ? `Perro perdido: ${alertData.petName}` : alertData.title,
      description: alertData.description,
      username: 'testuser', // Use the test user we created
      type: alertData.type || 'LOST',
      chipNumber: alertData.chipNumber || alertData.chip || '',
      sex: alertData.sex || 'UNKNOWN',
      date: alertData.lastSeenDate || alertData.date || new Date().toISOString().split('T')[0] + 'T00:00:00',
      breed: alertData.breed || 'Mixed',
      postalCode: postalCode,
      countryCode: alertData.countryCode || 'CL',
      status: ALERT_STATUS.ACTIVE,
    };
  }

  async getAlerts(params = {}) {
    try {
      const defaultParams = { status: ALERT_STATUS.ACTIVE, ...params };
      const queryString = new URLSearchParams(defaultParams).toString();
      const alertsEndpoint = await this.getAlertsEndpoint();
      const url = queryString ? `${alertsEndpoint}?${queryString}` : alertsEndpoint;
      
      const response = await this.request(url);
      return response;
    } catch (error) {
      console.error('Error fetching alerts:', error);        // If filtering by type fails, try without type filter
        if (params.type && error.message.includes('An unexpected error occurred')) {
          console.log(`Type filter for ${params.type} failed, trying without type filter`);
          try {
            const fallbackParams = { status: ALERT_STATUS.ACTIVE };
            const queryString = new URLSearchParams(fallbackParams).toString();
            const alertsEndpoint = await this.getAlertsEndpoint();
            const url = queryString ? `${alertsEndpoint}?${queryString}` : alertsEndpoint;
          
          const response = await this.request(url);
          
          // Filter locally by type if needed
          if (response && response.content && Array.isArray(response.content)) {
            response.content = response.content.filter(alert => alert.type === params.type);
          } else if (Array.isArray(response)) {
            return response.filter(alert => alert.type === params.type);
          }
          
          return response;
        } catch (fallbackError) {
          console.error('Fallback request also failed:', fallbackError);
          throw error; // Throw original error
        }
      }
      
      throw error;
    }
  }

  async getAlertById(id) {
    try {
      const url = await buildUrl(API_CONFIG.ENDPOINTS.GET_ALERT.replace('{id}', id));
      const response = await this.request(url);
      return response;
    } catch (error) {
      console.error(`Error fetching alert with id ${id}:`, error);
      throw error;
    }
  }

  async createAlert(alertData, photoFiles = []) {
    try {
      const backendData = this.transformToBackendFormat(alertData);
      
      console.log('Creating alert with data:', backendData);
      
      const url = await buildUrl(API_CONFIG.ENDPOINTS.CREATE_ALERT);
      const response = await this.request(url, {
        method: 'POST',
        body: JSON.stringify(backendData),
      });

      // If we have photos and the alert was created successfully, upload them
      if (response && response.id && photoFiles.length > 0) {
        try {
          console.log('Uploading photos for alert:', response.id);
          const photoUrls = await photoService.uploadPhotosForAlert(response.id, photoFiles);
          console.log('Photos uploaded successfully:', photoUrls);
          
          // Update response to include photo URLs
          response.photoUrls = photoUrls;
        } catch (photoError) {
          console.warn('Alert created but photo upload failed:', photoError);
          // Don't fail the entire operation if photos fail
        }
      }

      return response;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  async updateAlert(alertId, alertData, photoFiles = []) {
    try {
      const backendData = this.transformToBackendFormat(alertData);
      const url = await buildUrl(API_CONFIG.ENDPOINTS.UPDATE_ALERT.replace('{id}', alertId));
      
      console.log('Updating alert with data:', backendData);
      
      const response = await this.request(url, {
        method: 'PUT',
        body: JSON.stringify(backendData),
      });

      // Handle photo updates if provided
      if (photoFiles && photoFiles.length > 0) {
        try {
          console.log('Uploading photos for updated alert:', alertId);
          const photoUrls = await photoService.uploadPhotosForAlert(alertId, photoFiles);
          console.log('Photos uploaded successfully:', photoUrls);
          
          // Update response to include photo URLs
          if (response) {
            response.photoUrls = photoUrls;
          }
        } catch (photoError) {
          console.warn('Alert updated but photo upload failed:', photoError);
          // Don't fail the entire operation if photos fail
        }
      }

      return response;
    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    }
  }

  async deleteAlert(alertId) {
    try {
      const url = await buildUrl(API_CONFIG.ENDPOINTS.DELETE_ALERT.replace('{id}', alertId));
      await this.request(url, { method: 'DELETE' });
      return alertId;
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }
}

// Create and export service instance
const alertServiceInstance = new AlertService();

// Export both named and default
export { alertServiceInstance };
export default alertServiceInstance;
