import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { getAlertById, getAlerts } from '../../services/alerts';

const DebugAlert33 = () => {
  const [alert33Direct, setAlert33Direct] = useState(null);
  const [alert33InList, setAlert33InList] = useState(null);
  const [allAlerts, setAllAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const debugAlert33 = async () => {
    setLoading(true);
    setError(null);
    setAlert33Direct(null);
    setAlert33InList(null);
    setAllAlerts([]);
    
    try {
      console.log('🔍 DEBUGGING ALERT 33 - Starting investigation...');
      
      // 1. Try to get alert 33 directly by ID
      console.log('📞 Attempting to get alert 33 directly by ID...');
      try {
        const directAlert = await getAlertById(33);
        setAlert33Direct(directAlert);
        console.log('✅ Got alert 33 directly:', directAlert);
      } catch (error) {
        console.log('❌ Failed to get alert 33 directly:', error.response?.status, error.response?.data);
        setError(`Direct fetch error: ${error.response?.status} - ${error.response?.data?.message || 'Unknown error'}`);
      }

      // 2. Get all alerts and check if 33 is in the list
      console.log('📞 Getting all alerts to check if 33 is in the list...');
      const alerts = await getAlerts({ status: 'ACTIVE' });
      setAllAlerts(alerts);
      
      const found33 = alerts.find(alert => alert.id === 33);
      setAlert33InList(found33);
      
      if (found33) {
        console.log('✅ Found alert 33 in alerts list:', found33);
      } else {
        console.log('❌ Alert 33 NOT found in alerts list');
        console.log('📊 Total alerts in list:', alerts.length);
        console.log('🆔 Alert IDs in list:', alerts.map(a => a.id));
      }

      // 3. Try with different filters
      console.log('📞 Trying different filters...');
      
      // Try without status filter
      const alertsNoFilter = await getAlerts({});
      const found33NoFilter = alertsNoFilter.find(alert => alert.id === 33);
      console.log('🔍 Alert 33 with no filters:', found33NoFilter ? 'FOUND' : 'NOT FOUND');
      
      // Try with RESOLVED status
      const alertsResolved = await getAlerts({ status: 'RESOLVED' });
      const found33Resolved = alertsResolved.find(alert => alert.id === 33);
      console.log('🔍 Alert 33 with RESOLVED status:', found33Resolved ? 'FOUND' : 'NOT FOUND');
      
    } catch (error) {
      console.log('💥 Error in debug investigation:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    debugAlert33();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 DEBUG ALERT 33 INVESTIGATION</Text>
      
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={debugAlert33}
        disabled={loading}
      >
        <Text style={styles.refreshButtonText}>
          {loading ? '🔄 Investigando...' : '🔄 Refrescar Investigación'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Direct Fetch by ID:</Text>
        {alert33Direct ? (
          <View>
            <Text style={styles.success}>✅ SUCCESS</Text>
            <Text style={styles.data}>ID: {alert33Direct.id}</Text>
            <Text style={styles.data}>Title: {alert33Direct.title}</Text>
            <Text style={styles.data}>Status: {alert33Direct.status}</Text>
            <Text style={styles.data}>Created: {alert33Direct.createdAt}</Text>
            <Text style={styles.data}>Updated: {alert33Direct.updatedAt}</Text>
          </View>
        ) : (
          <Text style={styles.error}>❌ NOT FOUND OR ERROR</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 In Alerts List (ACTIVE filter):</Text>
        {alert33InList ? (
          <View>
            <Text style={styles.success}>✅ FOUND IN LIST</Text>
            <Text style={styles.data}>ID: {alert33InList.id}</Text>
            <Text style={styles.data}>Title: {alert33InList.title}</Text>
            <Text style={styles.data}>Status: {alert33InList.status}</Text>
          </View>
        ) : (
          <Text style={styles.error}>❌ NOT FOUND IN LIST</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 All Alerts Summary:</Text>
        <Text style={styles.data}>Total alerts: {allAlerts.length}</Text>
        <Text style={styles.data}>IDs: {allAlerts.map(a => a.id).join(', ')}</Text>
      </View>

      {error && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💥 Error:</Text>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
  data: {
    marginVertical: 2,
    fontFamily: 'monospace',
  },
});

export default DebugAlert33;
