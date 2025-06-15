// Test script to verify expo-maps import
try {
  const ExpoMaps = require('expo-maps');
  console.log('✅ expo-maps imported successfully');
  console.log('MapView available:', !!ExpoMaps.MapView);
  console.log('Marker available:', !!ExpoMaps.Marker);
  console.log('PROVIDER_GOOGLE available:', !!ExpoMaps.PROVIDER_GOOGLE);
} catch (error) {
  console.error('❌ Error importing expo-maps:', error.message);
}

// Test that react-native-maps is not available (should fail)
try {
  const RNMaps = require('react-native-maps');
  console.error('❌ react-native-maps is still available (should be removed)');
} catch (error) {
  console.log('✅ react-native-maps correctly removed:', error.message);
}
