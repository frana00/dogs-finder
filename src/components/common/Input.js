import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../utils/constants';

/**
 * Componente de entrada de texto reutilizable
 * 
 * Este componente proporciona un campo de entrada personalizado que incluye:
 * - Etiqueta para el campo
 * - Mensajes de error
 * - Soporte para campo de contraseña con toggle de visibilidad
 * - Estilos personalizados basados en estados (error, deshabilitado)
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Texto de la etiqueta que aparece encima del campo
 * @param {string} props.value - Valor actual del campo
 * @param {Function} props.onChangeText - Función que se llama cuando cambia el texto
 * @param {string} props.error - Mensaje de error para mostrar (si existe)
 * @param {string} props.placeholder - Texto de marcador de posición
 * @param {boolean} props.secureTextEntry - Indica si es un campo de contraseña
 * @param {string} props.keyboardType - Tipo de teclado ('default', 'numeric', 'email-address', etc.)
 * @param {string} props.autoCapitalize - Control de capitalización ('none', 'sentences', 'words', 'characters')
 * @param {boolean} props.editable - Indica si el campo es editable
 * @param {Object} props.style - Estilos adicionales para el contenedor principal
 * @param {Object} props.inputStyle - Estilos adicionales para el input
 * @param {boolean} props.showPasswordToggle - Indica si mostrar el botón para alternar visibilidad de contraseña
 */
const Input = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
  style,
  inputStyle,
  showPasswordToggle = false,
  ...props
}) => {
  // Estado para controlar la visibilidad de la contraseña
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  /**
   * Alterna la visibilidad de la contraseña
   */
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  /**
   * Determina los estilos del input en base a su estado
   * - Aplica estilos de error si hay un mensaje de error
   * - Aplica estilos de deshabilitado si el campo no es editable
   * - Aplica estilos personalizados si se proporcionan
   */
  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    if (error) {
      baseStyle.push(styles.inputError);
    }
    
    if (!editable) {
      baseStyle.push(styles.inputDisabled);
    }
    
    if (inputStyle) {
      baseStyle.push(inputStyle);
    }
    
    return baseStyle;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Etiqueta opcional del campo */}
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {/* Campo de entrada principal */}
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          placeholderTextColor={COLORS.gray}
          {...props}
        />
        {/* Botón para mostrar/ocultar contraseña si es campo de contraseña */}
        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={togglePasswordVisibility}
          >
            <Text style={styles.passwordToggleText}>
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Mensaje de error si existe */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

/**
 * Estilos del componente
 * 
 * Organizado en secciones:
 * - container: Contenedor principal del componente
 * - label: Estilo para la etiqueta del campo
 * - inputContainer: Contenedor que envuelve el campo de entrada
 * - input: Estilos base para el campo de texto
 * - Estados específicos (error, deshabilitado)
 * - Elementos del toggle de contraseña
 * - Estilos para el mensaje de error
 */
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative', // Permite posicionamiento absoluto del toggle de contraseña
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error, // Cambia color del borde cuando hay error
  },
  inputDisabled: {
    backgroundColor: COLORS.background,
    color: COLORS.gray, // Estilo visual cuando el campo está deshabilitado
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  passwordToggleText: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginTop: 4,
  },
});

export default Input;
