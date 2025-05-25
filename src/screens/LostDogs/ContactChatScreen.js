import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const ContactChatScreen = ({ navigation, route }) => {
  const ownerName = route.params?.userName || 'Dueño';
  const [messages, setMessages] = useState([
    { id: '1', text: '¡Hola! ¿Encontraste a mi perro?', fromOwner: true },
    { id: '2', text: 'Hola, vi tu alerta en la app.', fromOwner: false }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim().length === 0) return;
    setMessages([...messages, { id: Date.now().toString(), text: input, fromOwner: false }]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#FF9800" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat con {ownerName}</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.message, item.fromOwner ? styles.ownerMsg : styles.userMsg]}>
            <Text style={styles.msgText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
        style={{ flex: 1 }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF3E0', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FF9800', marginLeft: 14 },
  message: { padding: 10, borderRadius: 10, marginBottom: 10, maxWidth: '75%' },
  ownerMsg: { backgroundColor: '#FFF3E0', alignSelf: 'flex-start' },
  userMsg: { backgroundColor: '#FF9800', alignSelf: 'flex-end' },
  msgText: { color: '#333', fontSize: 15 },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 14, fontSize: 15, backgroundColor: '#fff' },
  sendBtn: { backgroundColor: '#FF9800', borderRadius: 20, padding: 10, marginLeft: 8, alignItems: 'center', justifyContent: 'center' },
});

export default ContactChatScreen;
