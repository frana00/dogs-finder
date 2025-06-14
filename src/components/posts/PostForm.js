import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../utils/constants';
import Button from '../common/Button';

const PostForm = ({ 
  onSubmit, 
  onCancel,
  loading = false, 
  style,
  editMode = false,
  initialContent = ''
}) => {
  const [content, setContent] = useState(initialContent);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    setIsValid(initialContent.trim().length > 0);
  }, [initialContent]);

  const handleContentChange = (text) => {
    setContent(text);
    setIsValid(text.trim().length > 0);
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Por favor escribe un comentario');
      return;
    }

    if (content.trim().length < 5) {
      Alert.alert('Error', 'El comentario debe tener al menos 5 caracteres');
      return;
    }

    onSubmit?.(content.trim());
    
    if (!editMode) {
      setContent(''); // Clear form after submit only in create mode
      setIsValid(false);
    }
  };

  const handleCancel = () => {
    if (editMode) {
      setContent(initialContent); // Reset to original content
      setIsValid(initialContent.trim().length > 0);
    }
    onCancel?.();
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>
        {editMode ? '✏️ Editar comentario' : '💬 Agregar comentario'}
      </Text>
      {!editMode && (
        <Text style={styles.subtitle}>
          ¿Viste a esta mascota? ¿Tienes información que pueda ayudar?
        </Text>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={handleContentChange}
          placeholder="Escribe tu comentario aquí... Por ejemplo: 'Vi a un perro similar en el parque ayer por la tarde'"
          multiline
          numberOfLines={4}
          maxLength={500}
          textAlignVertical="top"
          editable={!loading}
          returnKeyType="done"
          blurOnSubmit={true}
        />
        <Text style={styles.characterCount}>
          {content.length}/500 caracteres
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {editMode && (
          <Button
            title="Cancelar"
            onPress={handleCancel}
            variant="outline"
            disabled={loading}
            style={[styles.button, styles.cancelButton]}
          />
        )}
        <Button
          title={loading ? 
            (editMode ? 'Guardando...' : 'Enviando...') : 
            (editMode ? 'Guardar cambios' : 'Enviar comentario')
          }
          onPress={handleSubmit}
          loading={loading}
          disabled={!isValid || loading}
          style={[styles.button, styles.submitButton]}
          textStyle={styles.submitButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    // Ensure container takes minimum space needed
    flex: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 80,
    maxHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  cancelButton: {
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8, // Extra space above button
    marginBottom: Platform.OS === 'ios' ? 8 : 0, // Extra space for iOS
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PostForm;
