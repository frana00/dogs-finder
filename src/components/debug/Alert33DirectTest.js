import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getAlertById, getAlerts } from '../../services/alerts';

const Alert33DirectTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runDirectTest = async () => {
    setLoading(true);
    const results = [];
    
    try {
      results.push('🔍 STARTING DIRECT TEST FOR ALERT 33...');
      
      // Test 1: Direct fetch by ID
      results.push('\n📞 TEST 1: Direct fetch by ID...');
      try {
        const directFetch = await getAlertById(33);
        results.push('✅ SUCCESS: Direct fetch worked!');
        results.push(`📋 Data: ${JSON.stringify(directFetch, null, 2)}`);
      } catch (error) {
        results.push('❌ FAILED: Direct fetch failed');
        results.push(`💥 Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }

      // Test 2: Get all alerts (no filters)
      results.push('\n📞 TEST 2: Get all alerts (no filters)...');
      try {
        const allAlerts = await getAlerts({});
        results.push(`✅ Got ${allAlerts.length} total alerts`);
        const alert33InAll = allAlerts.find(a => a.id === 33);
        if (alert33InAll) {
          results.push('✅ Alert 33 FOUND in all alerts');
          results.push(`📋 Status: ${alert33InAll.status}`);
          results.push(`📋 Title: ${alert33InAll.title}`);
        } else {
          results.push('❌ Alert 33 NOT FOUND in all alerts');
          results.push(`🆔 IDs found: ${allAlerts.map(a => a.id).join(', ')}`);
        }
      } catch (error) {
        results.push('❌ FAILED: Get all alerts failed');
        results.push(`💥 Error: ${error.message}`);
      }

      // Test 3: Get ACTIVE alerts only
      results.push('\n📞 TEST 3: Get ACTIVE alerts only...');
      try {
        const activeAlerts = await getAlerts({ status: 'ACTIVE' });
        results.push(`✅ Got ${activeAlerts.length} active alerts`);
        const alert33InActive = activeAlerts.find(a => a.id === 33);
        if (alert33InActive) {
          results.push('✅ Alert 33 FOUND in active alerts');
        } else {
          results.push('❌ Alert 33 NOT FOUND in active alerts');
          results.push(`🆔 Active IDs: ${activeAlerts.map(a => a.id).join(', ')}`);
        }
      } catch (error) {
        results.push('❌ FAILED: Get active alerts failed');
        results.push(`💥 Error: ${error.message}`);
      }

      // Test 4: Get RESOLVED alerts
      results.push('\n📞 TEST 4: Get RESOLVED alerts...');
      try {
        const resolvedAlerts = await getAlerts({ status: 'RESOLVED' });
        results.push(`✅ Got ${resolvedAlerts.length} resolved alerts`);
        const alert33InResolved = resolvedAlerts.find(a => a.id === 33);
        if (alert33InResolved) {
          results.push('🚨🚨🚨 PROBLEM FOUND! Alert 33 is RESOLVED! 🚨🚨🚨');
          results.push('📋 This explains why it disappeared from the frontend!');
          results.push(`� Alert 33 resolved data: ${JSON.stringify(alert33InResolved, null, 2)}`);
        } else {
          results.push('❌ Alert 33 NOT FOUND in resolved alerts');
        }
      } catch (error) {
        results.push('❌ FAILED: Get resolved alerts failed');
        results.push(`💥 Error: ${error.message}`);
      }

      // Test 5: Check current context filters
      results.push('\n📞 TEST 5: Frontend is filtering by status=ACTIVE by default!');
      results.push('🔍 This means if alert 33 status changed, it won\'t show up');
      results.push('💡 RECOMMENDATION: Check if alert 33 status changed during editing');

    } catch (error) {
      results.push(`💥 General error: ${error.message}`);
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 ALERT 33 DIRECT TEST</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={runDirectTest}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '🔄 Testing...' : ' Run Direct Test'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    margin: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#d63031',
  },
  button: {
    backgroundColor: '#0984e3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#b2bec3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    maxHeight: 400,
    backgroundColor: '#2d3436',
    padding: 10,
    borderRadius: 5,
  },
  resultText: {
    color: '#ddd',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
});

export default Alert33DirectTest;
