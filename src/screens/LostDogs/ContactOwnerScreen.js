import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const ContactOwnerScreen = ({ navigation, route }) => {
  const dog = route.params?.dog;
  const contact = dog?.contact || {};

  // Funciones para las acciones
  const handleEmail = () => {
    if (contact.email) {
      Linking.openURL(`mailto:${contact.email}`);
    } else {
      Alert.alert('No hay email disponible');
    }
  };
  const handlePhone = () => {
    if (contact.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    } else {
      Alert.alert('No hay teléfono disponible');
    }
  };
  const handleWhatsapp = () => {
    if (contact.phone) {
      const msg = encodeURIComponent('Hola, vi tu alerta de perro perdido en la app.');
      const phone = contact.phone.replace(/[^\d]/g, '');
      Linking.openURL(`https://wa.me/${phone}?text=${msg}`);
    } else {
      Alert.alert('No hay teléfono disponible para WhatsApp');
    }
  };
  const handleChat = () => {
    navigation.navigate('ContactChat', { userId: contact.id, userName: contact.name });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contactar al Dueño</Text>
      <View style={styles.card}>
        <Ionicons name="person-circle" size={60} color="#FF9800" style={{ marginBottom: 8 }} />
        <Text style={styles.ownerName}>{contact.name || 'Dueño desconocido'}</Text>
        {contact.email && <Text style={styles.info}>Email: {contact.email}</Text>}
        {contact.phone && <Text style={styles.info}>Teléfono: {contact.phone}</Text>}
      </View>
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleChat}>
          <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
          <Ionicons name="mail-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleWhatsapp}>
          <Ionicons name="logo-whatsapp" size={24} color="#fff" />
          <Text style={styles.buttonText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handlePhone}>
          <Ionicons name="call-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Llamar</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 18, color: '#FF9800' },
  card: { alignItems: 'center', backgroundColor: '#FFF3E0', borderRadius: 12, padding: 18, marginBottom: 28, width: '100%' },
  ownerName: { fontSize: 20, fontWeight: 'bold', marginBottom: 6, color: '#333' },
  info: { fontSize: 16, color: '#444', marginBottom: 2 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 28 },
  actionButton: { flex: 1, flexDirection: 'column', alignItems: 'center', backgroundColor: '#FF9800', borderRadius: 8, paddingVertical: 12, marginHorizontal: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginTop: 5 },
  backButton: { backgroundColor: '#ccc', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 },
  backButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
});

export default ContactOwnerScreen;
