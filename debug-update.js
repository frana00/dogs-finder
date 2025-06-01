// Debug script para probar la actualización de alertas
// Este archivo se puede usar para hacer pruebas específicas

import apiService from './src/services/apiService.js';

async function testUpdateAlert() {
  console.log('🔍 Testing alert update...');
  
  try {
    // Test data similar to what the form would send
    const testData = {
      username: 'test@test.com',
      type: 'SEEN',
      status: 'ACTIVE',
      title: 'Test Updated Alert',
      description: 'This is a test update',
      breed: 'Test Breed',
      sex: 'MALE',
      chipNumber: 'TEST123',
      locationAddress: 'Test Location',
      postalCode: '12345',
      countryCode: 'CL',
      date: new Date().toISOString(),
    };
    
    console.log('📤 Sending update data:', testData);
    
    // Replace '1' with an actual alert ID from your database
    const result = await apiService.updateAlert('1', testData);
    
    console.log('✅ Update successful:', result);
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

// Only run if this file is executed directly
if (typeof window === 'undefined') {
  testUpdateAlert();
}

export { testUpdateAlert };
