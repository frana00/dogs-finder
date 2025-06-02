// Test script to understand photo data structure from backend
import apiService from './src/services/apiService.js';

async function testPhotoDataStructure() {
  console.log('🔍 Testing photo data structure...');
  
  try {
    // Try to get alerts to see what photo data structure looks like
    console.log('📱 Step 1: Getting alerts from backend...');
    const alerts = await apiService.getAlerts({ type: 'SEEN', status: 'ACTIVE' });
    
    console.log('✅ Alerts response type:', typeof alerts);
    console.log('✅ Alerts response length:', Array.isArray(alerts) ? alerts.length : 'Not an array');
    
    if (alerts && alerts.content && Array.isArray(alerts.content)) {
      console.log('✅ Found alerts.content with length:', alerts.content.length);
      
      // Look for alerts with photos
      const alertsWithPhotos = alerts.content.filter(alert => 
        alert.photoUrls && Array.isArray(alert.photoUrls) && alert.photoUrls.length > 0
      );
      
      console.log('✅ Alerts with photos:', alertsWithPhotos.length);
      
      if (alertsWithPhotos.length > 0) {
        const firstAlertWithPhotos = alertsWithPhotos[0];
        console.log('\n📸 PHOTO DATA STRUCTURE:');
        console.log('=====================================');
        console.log('Alert ID:', firstAlertWithPhotos.id);
        console.log('Number of photos:', firstAlertWithPhotos.photoUrls.length);
        console.log('\n🔍 First photo object:');
        console.log(JSON.stringify(firstAlertWithPhotos.photoUrls[0], null, 2));
        
        if (firstAlertWithPhotos.photoUrls.length > 1) {
          console.log('\n🔍 Second photo object:');
          console.log(JSON.stringify(firstAlertWithPhotos.photoUrls[1], null, 2));
        }
        
        // Check what properties are available
        const photoKeys = Object.keys(firstAlertWithPhotos.photoUrls[0]);
        console.log('\n🔑 Available photo properties:', photoKeys);
        
        // Check if there's a numeric ID
        const firstPhoto = firstAlertWithPhotos.photoUrls[0];
        console.log('\n🔍 Photo property analysis:');
        photoKeys.forEach(key => {
          const value = firstPhoto[key];
          console.log(`  - ${key}: ${typeof value} = ${value}`);
        });
        
      } else {
        console.log('❌ No alerts with photos found to analyze');
      }
      
    } else if (Array.isArray(alerts)) {
      console.log('✅ Alerts is direct array with length:', alerts.length);
      
      // Look for alerts with photos in direct array
      const alertsWithPhotos = alerts.filter(alert => 
        alert.photoUrls && Array.isArray(alert.photoUrls) && alert.photoUrls.length > 0
      );
      
      console.log('✅ Alerts with photos:', alertsWithPhotos.length);
      
      if (alertsWithPhotos.length > 0) {
        const firstAlertWithPhotos = alertsWithPhotos[0];
        console.log('\n📸 PHOTO DATA STRUCTURE:');
        console.log('=====================================');
        console.log('Alert ID:', firstAlertWithPhotos.id);
        console.log('Number of photos:', firstAlertWithPhotos.photoUrls.length);
        console.log('\n🔍 First photo object:');
        console.log(JSON.stringify(firstAlertWithPhotos.photoUrls[0], null, 2));
      } else {
        console.log('❌ No alerts with photos found to analyze');
      }
    }
    
    // Also try to get a specific alert if we have any
    if (alerts && ((alerts.content && alerts.content.length > 0) || (Array.isArray(alerts) && alerts.length > 0))) {
      const firstAlert = alerts.content ? alerts.content[0] : alerts[0];
      console.log('\n📱 Step 2: Getting specific alert details...');
      console.log('Getting details for alert ID:', firstAlert.id);
      
      try {
        const alertDetails = await apiService.getAlert(firstAlert.id);
        console.log('\n📸 ALERT DETAILS PHOTO STRUCTURE:');
        console.log('=====================================');
        if (alertDetails.photoUrls && Array.isArray(alertDetails.photoUrls) && alertDetails.photoUrls.length > 0) {
          console.log('Number of photos in details:', alertDetails.photoUrls.length);
          console.log('\n🔍 First photo from details:');
          console.log(JSON.stringify(alertDetails.photoUrls[0], null, 2));
        } else {
          console.log('❌ No photos in alert details');
        }
      } catch (detailError) {
        console.error('❌ Error getting alert details:', detailError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

// Only run if this file is executed directly
if (typeof window === 'undefined') {
  testPhotoDataStructure();
}

export { testPhotoDataStructure };
