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

  console.log('🌐 ALERT 33 DEBUG - Making API request to /alerts with params:', params);
  const response = await apiClient.get('/alerts', { params });
  console.log('📡 ALERT 33 DEBUG - Full API response:', response.data);
  
  // Handle paginated response - extract content array
  if (response.data && response.data.content && Array.isArray(response.data.content)) {
    console.log('📋 ALERT 33 DEBUG - Extracted alerts from paginated response:', response.data.content.length, 'alerts');
    
    // CHECK FOR ALERT 33 SPECIFICALLY
    const alertIds = response.data.content.map(alert => alert.id);
    console.log('🆔 ALERT 33 DEBUG - All alert IDs:', alertIds);
    console.log('🔍 ALERT 33 DEBUG - Is alert 33 present?', alertIds.includes(33));
    
    const alert33 = response.data.content.find(alert => alert.id === 33);
    if (alert33) {
      console.log('✅ ALERT 33 DEBUG - Found alert 33:', alert33);
    } else {
      console.log('❌ ALERT 33 DEBUG - Alert 33 NOT found in response');
      console.log('📊 ALERT 33 DEBUG - Total alerts in response:', response.data.totalElements);
      console.log('📄 ALERT 33 DEBUG - Current page:', response.data.number);
      console.log('📄 ALERT 33 DEBUG - Total pages:', response.data.totalPages);
    }
    
    return response.data.content;
  }
  
  // Fallback for non-paginated response
  if (Array.isArray(response.data)) {
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
  console.log(`🔍 ALERT 33 DEBUG - Requesting alert by ID: ${alertId}`);
  try {
    const response = await apiClient.get(`/alerts/${alertId}`);
    console.log(`✅ ALERT 33 DEBUG - Alert ${alertId} found:`, response.data);
    return response.data;
  } catch (error) {
    console.log(`❌ ALERT 33 DEBUG - Error fetching alert ${alertId}:`, error.response?.status, error.response?.data);
    throw error;
  }
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
  
  const response = await apiClient.post('/alerts', cleanData);
  
  return response.data;
};

/**
 * Updates an alert
 * @param {number} alertId - The alert ID
 * @param {Object} alertData - Updated alert data
 * @returns {Promise<Object>} - Updated alert data
 */
export const updateAlert = async (alertId, alertData) => {
  console.log('🔄 ALERT 33 DEBUG - updateAlert called with:');
  console.log('🆔 Alert ID:', alertId);
  console.log('📋 Original data:', alertData);
  
  // Log each field before filtering
  console.log('🔍 FIELD BY FIELD ANALYSIS:');
  Object.entries(alertData).forEach(([key, value]) => {
    const valueType = typeof value;
    const willBeFiltered = value === undefined || value === null || value === '';
    console.log(`  ${key}: ${value} (${valueType}) - ${willBeFiltered ? '❌ WILL BE FILTERED OUT' : '✅ WILL BE KEPT'}`);
  });
  
  // Clean up undefined values to avoid sending them as null
  const cleanData = Object.fromEntries(
    Object.entries(alertData).filter(([key, value]) => {
      const shouldKeep = value !== undefined && value !== null && value !== '';
      if (!shouldKeep) {
        console.log(`�️ FILTERING OUT: ${key} = ${value}`);
      }
      return shouldKeep;
    })
  );
  
  console.log('🧹 Cleaned data:', cleanData);
  console.log('� Original fields count:', Object.keys(alertData).length);
  console.log('📊 Cleaned fields count:', Object.keys(cleanData).length);
  
  try {
    console.log('📞 ALERT 33 DEBUG - Making PUT request to backend...');
    const response = await apiClient.put(`/alerts/${alertId}`, cleanData);
    
    console.log('✅ ALERT 33 DEBUG - Backend response received:');
    console.log('📡 Status:', response.status);
    console.log('📋 Response data:', response.data);
    
    // If this is alert 33, let's verify it immediately
    if (alertId === 33 || alertId === '33') {
      console.log('🔍 ALERT 33 DEBUG - This is alert 33! Verifying update...');
      setTimeout(async () => {
        try {
          console.log('🔍 ALERT 33 DEBUG - Fetching alert 33 to verify update...');
          const verifyResponse = await apiClient.get(`/alerts/${alertId}`);
          console.log('✅ ALERT 33 DEBUG - Verification successful:', verifyResponse.data);
          
          // Also check if it appears in the alerts list
          console.log('🔍 ALERT 33 DEBUG - Checking if alert 33 appears in alerts list...');
          const listResponse = await apiClient.get('/alerts', { params: { status: 'ACTIVE' } });
          const alertsInList = listResponse.data.content || listResponse.data;
          const found33 = alertsInList.find(alert => alert.id === 33);
          console.log('📋 ALERT 33 DEBUG - Is alert 33 in list after update?', found33 ? 'YES' : 'NO');
          if (found33) {
            console.log('✅ ALERT 33 DEBUG - Found in list:', found33);
          } else {
            console.log('❌ ALERT 33 DEBUG - NOT found in list');
            console.log('📊 ALERT 33 DEBUG - Total alerts in list:', alertsInList.length);
          }
        } catch (verifyError) {
          console.log('❌ ALERT 33 DEBUG - Verification failed:', verifyError);
        }
      }, 1000); // Wait 1 second then verify
    }
    
    return response.data;
  } catch (error) {
    console.log('❌ ALERT 33 DEBUG - updateAlert failed:');
    console.log('❌ Error:', error.response?.status, error.response?.data);
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
