import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '123-456-7890',
    address: 'Calle Principal 123, Ciudad',
  });
  
  const [editableData, setEditableData] = useState({...userData});
  const { logout } = useContext(AuthContext);

  const handleSave = () => {
    // Validación básica
    if (!editableData.name || !editableData.email || !editableData.phone) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }
    
    // Guardar cambios
    setUserData(editableData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Usar la función de logout del contexto
    logout();
  };

  // Componente para mostrar información
  const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={22} color="#666" style={styles.infoIcon} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  // Componente para editar información
  const EditableInfoItem = ({ label, value, onChangeText, keyboardType = 'default' }) => (
    <View style={styles.editableItem}>
      <Text style={styles.editableLabel}>{label}</Text>
      <TextInput
        style={styles.editableInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Ionicons name="create-outline" size={24} color="#FF9800" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSave}>
            <Ionicons name="checkmark" size={24} color="#FF9800" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color="#FF9800" />
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          {!isEditing ? (
            <>
              <InfoItem icon="person" label="Nombre" value={userData.name} />
              <InfoItem icon="mail" label="Correo" value={userData.email} />
              <InfoItem icon="call" label="Teléfono" value={userData.phone} />
              <InfoItem icon="location" label="Dirección" value={userData.address} />
            </>
          ) : (
            <>
              <EditableInfoItem 
                label="Nombre" 
                value={editableData.name} 
                onChangeText={(text) => setEditableData({...editableData, name: text})} 
              />
              <EditableInfoItem 
                label="Correo" 
                value={editableData.email} 
                onChangeText={(text) => setEditableData({...editableData, email: text})} 
                keyboardType="email-address"
              />
              <EditableInfoItem 
                label="Teléfono" 
                value={editableData.phone} 
                onChangeText={(text) => setEditableData({...editableData, phone: text})} 
                keyboardType="phone-pad"
              />
              <EditableInfoItem 
                label="Dirección" 
                value={editableData.address} 
                onChangeText={(text) => setEditableData({...editableData, address: text})} 
              />
            </>
          )}
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileContainer: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  changePhotoButton: {
    marginTop: 5,
  },
  changePhotoText: {
    color: '#FF9800',
    fontSize: 14,
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  editableItem: {
    marginBottom: 15,
  },
  editableLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  editableInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  logoutButton: {
    backgroundColor: '#FF5722',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen;
