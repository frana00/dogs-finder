import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const SimpleDebugAlert33 = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 SIMPLE DEBUG - ALERT 33 STATUS</Text>
      <Text style={styles.text}>Check console logs for detailed debugging information</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => console.log('🔍 Manual debug trigger - check logs for alert 33 information')}
      >
        <Text style={styles.buttonText}>📋 Trigger Debug Log</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2196f3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SimpleDebugAlert33;
