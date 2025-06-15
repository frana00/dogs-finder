import apiClient from './api';
import { PAGINATION, ALERT_TYPES, ALERT_STATUS } from '../utils/constants';

/**
 * Gets alerts with pagination and filters
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 0)
 * @param {number} options.size - Page size (default: 20)
 * @param {string} options.type - Alert type (LOST|SEEN)
 * @param {string} options.status - Alert status (ACTIVE|RESOLVED)
 * @returns {Promise<Array>} - Array of alerts
 */
export const getAlerts = async (options = {}) => {
  const params = {
    page: options.page ?? PAGINATION.DEFAULT_PAGE,
    size: options.size ?? PAGINATION.DEFAULT_SIZE,
  };

  // Add optional filters
  if (options.type && Object.values(ALERT_TYPES).includes(options.type)) {
    params.type = options.type;
  }

  if (options.status && Object.values(ALERT_STATUS).includes(options.status)) {
    params.status = options.status;
  }

  console.log('🌐 Making API request to /alerts with params:', params);
  const response = await apiClient.get('/alerts', { params });
  console.log('📡 API response for /alerts:', response.data);
  
  // Handle paginated response - extract content array
  if (response.data && response.data.content && Array.isArray(response.data.content)) {
    console.log('📋 Extracted alerts from paginated response:', response.data.content.length, 'alerts');
    
    // DEBUG: Log photo data in API response
    console.log('🔍 Photo data in API response:');
    response.data.content.forEach((alert, index) => {
      console.log(`API Alert ${index + 1} (ID: ${alert.id}):`);
      console.log(`  - photoUrl:`, alert.photoUrl || 'not present');
      console.log(`  - photoUrls:`, alert.photoUrls || 'not present');
      console.log(`  - photoUrls type:`, typeof alert.photoUrls);
      console.log(`  - photoUrls isArray:`, Array.isArray(alert.photoUrls));
      if (alert.photoUrls && Array.isArray(alert.photoUrls)) {
        console.log(`  - photoUrls length:`, alert.photoUrls.length);
        alert.photoUrls.forEach((photo, photoIndex) => {
          console.log(`    Photo ${photoIndex + 1}:`, photo);
        });
      }
    });
    
    return response.data.content;
  }
  
  // Fallback for non-paginated response
  if (Array.isArray(response.data)) {
    console.log('📋 Using direct array response:', response.data.length, 'alerts');
    return response.data;
  }
  
  console.warn('⚠️ Unexpected response format, returning empty array');
  return [];
};

/**
 * Gets alert by ID
 * @param {number} alertId - The alert ID
 * @returns {Promise<Object>} - Alert data
 */
export const getAlertById = async (alertId) => {
  const response = await apiClient.get(`/alerts/${alertId}`);
  return response.data;
};

/**
 * Creates a new alert
 * @param {Object} alertData - Alert data
 * @param {Array<string>} alertData.photoFilenames - Optional array of photo filenames to associate
 * @returns {Promise<Object>} - Created alert data with photoUrls if photos were included
 */
export const createAlert = async (alertData) => {
  // Clean up undefined values to avoid sending them as null
  // Special handling for username - it should never be filtered out if present
  const cleanData = Object.fromEntries(
    Object.entries(alertData).filter(([key, value]) => {
      // Username is required - never filter it out unless it's null/undefined
      if (key === 'username') {
        return value !== undefined && value !== null;
      }
      // For other fields, filter out undefined, null, and empty strings
      return value !== undefined && value !== null && value !== '';
    })
  );
  
  // Final validation before sending
  if (!cleanData.username) {
    throw new Error('Username is required but missing from alert data');
  }
  
  console.log('🚀 CREATE ALERT DEBUG:', {
    originalAlertData: alertData,
    cleanData: cleanData,
    petNameInOriginal: alertData.petName,
    petNameInClean: cleanData.petName,
    hasPetNameInClean: !!cleanData.petName,
    titleInClean: cleanData.title
  });
  
  const response = await apiClient.post('/alerts', cleanData);
  
  console.log('📥 CREATE ALERT RESPONSE:', response.data);
  console.log('📥 Response petName:', response.data.petName);
  console.log('📥 Response photoUrls:', response.data.photoUrls);
  
  return response.data;
};

/**
 * Updates an alert
 * @param {number} alertId - The alert ID
 * @param {Object} alertData - Updated alert data
 * @returns {Promise<Object>} - Updated alert data
 */
export const updateAlert = async (alertId, alertData) => {
  // Clean up undefined values to avoid sending them as null
  const cleanData = Object.fromEntries(
    Object.entries(alertData).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );
  
  console.log('📤 Updating alert with ID:', alertId);
  console.log('📤 Original alert data:', alertData);
  console.log('📤 Clean alert data:', cleanData);
  console.log('🔍 LocationSource analysis:');
  console.log('  - locationSource value:', cleanData.locationSource);
  console.log('  - locationSource type:', typeof cleanData.locationSource);
  console.log('  - locationSource length:', cleanData.locationSource ? cleanData.locationSource.length : 'N/A');
  console.log('  - locationSource JSON:', JSON.stringify(cleanData.locationSource));
  
  console.log('🔍 UPDATE ALERT DEBUG:', {
    originalAlertData: alertData,
    cleanData: cleanData,
    petNameInOriginal: alertData.petName,
    petNameInClean: cleanData.petName,
    hasPetNameInClean: !!cleanData.petName,
    locationInOriginal: alertData.location,
    locationInClean: cleanData.location,
    latitudeInClean: cleanData.latitude,
    longitudeInClean: cleanData.longitude
  });
  
  try {
    const response = await apiClient.put(`/alerts/${alertId}`, cleanData);
    
    console.log('📥 UPDATE ALERT RESPONSE SUCCESS:', response.data);
    
    return response.data;
  } catch (error) {
    console.log('❌ UPDATE ALERT ERROR:', error);
    console.log('❌ Error response data:', error.response?.data);
    console.log('❌ Error response status:', error.response?.status);
    console.log('❌ Error response headers:', error.response?.headers);
    console.log('❌ Error request data sent:', cleanData);
    
    throw error;
  }
};

/**
 * Deletes an alert
 * @param {number} alertId - The alert ID
 * @returns {Promise<void>}
 */
export const deleteAlert = async (alertId) => {
  await apiClient.delete(`/alerts/${alertId}`);
};
