import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { COLORS, ALERT_TYPES, PET_SEX, LOCATION_SOURCE } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { PhotoPicker } from '../photos';
import { LocationPicker, LocationAutocomplete } from '../location';
import { coordinatesToAddress } from '../../utils/location';

// Note: Temporarily removed react-native-date-picker due to NativeEventEmitter issues
// Will use platform-specific date picker implementations

const AlertForm = ({ 
  initialData = null, 
  onSubmit, 
  loading = false,
  style 
}) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    type: ALERT_TYPES.LOST,
    title: '',
    breed: '',
    color: '',
    sex: PET_SEX.UNKNOWN,
    age: '',
    size: 'MEDIUM',
    description: '',
    location: '',
    latitude: null,
    longitude: null,
    locationSource: LOCATION_SOURCE.MANUAL,
    postalCode: '',
    countryCode: 'ES',
    contactPhone: '',
    contactEmail: user?.email || '', // Auto-complete with user email
    date: new Date(),
    reward: '',
    chipNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [convertedAddress, setConvertedAddress] = useState('');

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      // Parse description to extract additional fields that might be embedded
      const parseDescriptionFields = (description) => {
        const fields = {};
        if (description) {
          const lines = description.split('\n');
          lines.forEach(line => {
            if (line.includes('Color:')) {
              fields.color = line.replace('Color:', '').trim();
            }
            if (line.includes('Edad:')) {
              const ageMatch = line.match(/Edad:\s*(\d+)/);
              if (ageMatch) fields.age = ageMatch[1];
            }
            if (line.includes('Ubicación específica:')) {
              fields.location = line.replace('Ubicación específica:', '').trim();
            }
            if (line.includes('Contacto:')) {
              fields.contactPhone = line.replace('Contacto:', '').trim();
            }
            if (line.includes('Email:')) {
              fields.contactEmail = line.replace('Email:', '').trim();
            }
            if (line.includes('Recompensa:')) {
              const rewardMatch = line.match(/Recompensa:\s*\$?(\d+)/);
              if (rewardMatch) fields.reward = rewardMatch[1];
            }
          });
        }
        return fields;
      };

      // Extract clean description (remove auto-generated metadata)
      const getCleanDescription = (description) => {
        if (!description) return '';
        
        // Split description into lines
        const lines = description.split('\n');
        const cleanLines = [];
        let foundMetadataSection = false;
        
        // Process each line
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Check if we've hit the metadata section (empty line followed by metadata)
          if (
            trimmedLine.startsWith('Nombre:') ||
            trimmedLine.startsWith('Color:') ||
            trimmedLine.startsWith('Edad:') ||
            trimmedLine.startsWith('Tamaño:') ||
            trimmedLine.startsWith('Ubicación específica:') ||
            trimmedLine.startsWith('Contacto:') ||
            trimmedLine.startsWith('Email:') ||
            trimmedLine.startsWith('Recompensa:') ||
            trimmedLine.startsWith('Código Postal proporcionado:')
          ) {
            foundMetadataSection = true;
            continue; // Skip this line and all subsequent lines
          }
          
          // If we haven't found metadata section yet, keep the line
          if (!foundMetadataSection) {
            cleanLines.push(line);
          }
        }
        
        // Remove trailing empty lines
        while (cleanLines.length > 0 && cleanLines[cleanLines.length - 1].trim() === '') {
          cleanLines.pop();
        }
        
        return cleanLines.join('\n').trim();
      };

      const parsedFields = parseDescriptionFields(initialData.description);
      const cleanDescription = getCleanDescription(initialData.description);
      
      // Use default form structure instead of current formData to avoid loops
      const defaultFormData = {
        type: ALERT_TYPES.LOST,
        title: '',
        breed: '',
        color: '',
        sex: PET_SEX.UNKNOWN,
        age: '',
        size: 'MEDIUM',
        description: '',
        location: '',
        latitude: null,
        longitude: null,
        locationSource: LOCATION_SOURCE.MANUAL,
        postalCode: '',
        countryCode: 'ES',
        contactPhone: '',
        contactEmail: user?.email || '',
        date: new Date(),
        reward: '',
        chipNumber: '',
      };
      
      const newFormDataState = {
        ...defaultFormData, 
        ...initialData,     
        ...parsedFields,    
      };

      newFormDataState.title = initialData.title || defaultFormData.title;
      newFormDataState.description = cleanDescription;
      newFormDataState.date = initialData.date ? new Date(initialData.date) : new Date();
      newFormDataState.contactEmail = parsedFields.contactEmail || initialData.contactEmail || user?.email || defaultFormData.contactEmail;

      setFormData(newFormDataState);
      
      console.log('🔄 LOADING INITIAL DATA FOR EDIT:', {
        initialDataExists: !!initialData,
        rawInitialData: initialData,
        parsedFields,
        cleanDescription,
        finalFormDataApplied: newFormDataState
      });
    }
  }, [initialData, user?.email]);

  // Continuously validate form to update button state
  useEffect(() => {
    const checkFormValidity = () => {
      const newErrors = {};

      if (!formData.title.trim()) {
        newErrors.title = 'El título de la alerta es requerido';
      }

      if (!formData.breed.trim()) {
        newErrors.breed = 'La raza es requerida';
      }

      if (!formData.color.trim()) {
        newErrors.color = 'El color es requerido';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'La descripción es requerida';
      }

      if (!formData.location.trim()) {
        newErrors.location = 'La ubicación es requerida';
      }

      if (!formData.countryCode.trim()) {
        newErrors.countryCode = 'El código del país es requerido';
      }

      if (!formData.contactPhone.trim()) {
        newErrors.contactPhone = 'El teléfono de contacto es requerido';
      }

      // POSTAL CODE IS NOT MANDATORY - only validate format if provided
      if (formData.postalCode && formData.postalCode.trim() && !/^\d{4,6}$/.test(formData.postalCode.trim())) {
        newErrors.postalCode = 'Si proporcionas código postal, debe tener entre 4 y 6 dígitos';
      }

      // Optional field validations
      if (formData.age && (isNaN(formData.age) || formData.age < 0)) {
        newErrors.age = 'La edad debe ser un número válido';
      }

      if (formData.reward && (isNaN(formData.reward) || formData.reward < 0)) {
        newErrors.reward = 'La recompensa debe ser un número válido';
      }

      setErrors(newErrors);
      const isValid = Object.keys(newErrors).length === 0;
      setIsFormValid(isValid);
      
      // DEBUG: Log validation state
      console.log('🔍 FORM VALIDATION:', {
        isValid,
        errorsCount: Object.keys(newErrors).length,
        errors: newErrors,
        formData: {
          title: formData.title,
          breed: formData.breed,
          color: formData.color,
          description: formData.description,
          location: formData.location,
          contactPhone: formData.contactPhone,
          countryCode: formData.countryCode,
          type: formData.type
        }
      });
     };
    
    checkFormValidity();
  }, [formData]);

  // Convert coordinates to address when they change
  useEffect(() => {
    const convertCoordinatesToAddress = async () => {
      if (formData.latitude && formData.longitude) {
        try {
          const address = await coordinatesToAddress(formData.latitude, formData.longitude);
          setConvertedAddress(address);
        } catch (error) {
          console.error('Error converting coordinates to address:', error);
          setConvertedAddress('');
        }
      } else {
        setConvertedAddress('');
      }
    };

    convertCoordinatesToAddress();
  }, [formData.latitude, formData.longitude]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle location selection from LocationAutocomplete
  const handleLocationSelect = (locationData) => {
    console.log('🏠 AlertForm: Received locationData in handleLocationSelect:', JSON.stringify(locationData));
    
    const newFormData = {
      ...formData,
      location: locationData.location,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      locationSource: locationData.source,
    };
    console.log('🏠 AlertForm: Attempting to set new formData:', JSON.stringify(newFormData));
    setFormData(newFormData);
    
    if (errors.location) {
      console.log('🏠 AlertForm: Clearing location error.');
      setErrors(prev => ({ ...prev, location: null }));
    }
  };

  // Add a new useEffect to monitor changes to location fields specifically
  useEffect(() => {
    if (formData.location !== undefined || formData.latitude !== undefined || formData.longitude !== undefined) { // Log even if they become undefined/null
      console.log(
        '🏠 AlertForm: formData changed. Location:', formData.location, 
        'Lat:', formData.latitude, 
        'Lng:', formData.longitude,
        'Source:', formData.locationSource
      );
    }
  }, [formData.location, formData.latitude, formData.longitude, formData.locationSource]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título de la alerta es requerido';
    }

    if (!formData.breed.trim()) {
      newErrors.breed = 'La raza es requerida';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'El color es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.location.trim()) {
      console.log('🚨 Validation: location is empty:', JSON.stringify(formData.location));
      newErrors.location = 'La ubicación es requerida';
    } else {
      console.log('✅ Validation: location is valid:', JSON.stringify(formData.location));
    }

    // POSTAL CODE IS NOT MANDATORY - only validate format if provided
    if (formData.postalCode && formData.postalCode.trim() && !/^\d{4,6}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Si proporcionas código postal, debe tener entre 4 y 6 dígitos';
    }

    if (!formData.countryCode.trim()) {
      newErrors.countryCode = 'El código del país es requerido';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'El teléfono de contacto es requerido';
    }

    // Solo validar edad si se proporciona
    if (formData.age && (isNaN(formData.age) || formData.age < 0)) {
      newErrors.age = 'La edad debe ser un número válido';
    }

    if (formData.reward && (isNaN(formData.reward) || formData.reward < 0)) {
      newErrors.reward = 'La recompensa debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Construir descripción extendida que incluya información adicional
      let extendedDescription = formData.description;
      
      // Agregar información adicional a la descripción para campos no soportados por el backend
      const additionalInfo = [];
      
      // Updated Note: petName is now a separate field. It should not be manually added to description.
      
      if (formData.color && formData.color.trim()) {
        additionalInfo.push(`Color: ${formData.color}`);
      }
      
      if (formData.age && formData.age.trim()) {
        additionalInfo.push(`Edad: ${formData.age} años`);
      }
      
      if (formData.size) {
        const sizeMap = { SMALL: 'Pequeño', MEDIUM: 'Mediano', LARGE: 'Grande' };
        additionalInfo.push(`Tamaño: ${sizeMap[formData.size]}`);
      }
      
      if (formData.location && formData.location.trim()) {
        additionalInfo.push(`Ubicación específica: ${formData.location}`);
      }
      
      if (formData.contactPhone && formData.contactPhone.trim()) {
        additionalInfo.push(`Contacto: ${formData.contactPhone}`);
      }
      
      if (formData.contactEmail && formData.contactEmail.trim()) {
        additionalInfo.push(`Email: ${formData.contactEmail}`);
      }
      
      if (formData.reward && formData.reward.trim() && formData.type === ALERT_TYPES.LOST) {
        additionalInfo.push(`Recompensa: $${formData.reward}`);
      }
      
      if (additionalInfo.length > 0) {
        extendedDescription += '\n\n' + additionalInfo.join('\n');
      }

      const submitData = {
        // Campos requeridos por el backend
        title: formData.title, // Use formData.title as the alert's title
        type: formData.type, // LOST o SEEN
        description: extendedDescription, // Send the potentially augmented description
        breed: formData.breed || '',
        sex: formData.sex,
        countryCode: formData.countryCode,
        date: formData.date.toISOString(),
        status: 'ACTIVE', // Default status
        
        // Location data - NEW GEOLOCATION FEATURE
        location: formData.location, // Human-readable location string
        ...(formData.latitude && formData.longitude && {
          latitude: formData.latitude,
          longitude: formData.longitude,
          locationSource: formData.locationSource
        }),
        
        // Campos opcionales del backend
        chipNumber: formData.chipNumber || undefined,
        
        // Fotos - incluir solo si hay fotos seleccionadas
        ...(selectedPhotos.length > 0 && {
          photoFilenames: selectedPhotos.map(photo => photo.filename || `photo_${Date.now()}.jpg`),
          photos: selectedPhotos, // Para el procesamiento posterior
        }),
        
        // Usar postal code válido del backend - según documentación del backend, "04001" es un código válido
        // Si el usuario proporcionó un código postal, lo agregamos a la descripción
        postalCode: "04001", // Código postal de ejemplo válido según backend.txt
      };
      
      // Agregar código postal del usuario a la descripción si se proporcionó uno diferente
      if (formData.postalCode && formData.postalCode.trim() && formData.postalCode.trim() !== "04001") {
        submitData.description += `\nCódigo Postal proporcionado: ${formData.postalCode.trim()}`;
      }

      console.log('📤 SUBMIT DATA DEBUG:', {
        titleInFormData: formData.title,
        titleInSubmitData: submitData.title,
        typeInSubmitData: submitData.type,
        // NEW: Geolocation debug info
        locationInfo: {
          location: submitData.location,
          hasCoordinates: !!(submitData.latitude && submitData.longitude),
          latitude: submitData.latitude,
          longitude: submitData.longitude,
          locationSource: submitData.locationSource
        },
        fullSubmitDataKeys: Object.keys(submitData),
        fullSubmitData: submitData
      });

      onSubmit?.(submitData);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle photo selection from PhotoPicker
  const handlePhotosSelected = ({ images, descriptions }) => {
    const photosWithDescriptions = images.map((image, index) => ({
      ...image,
      description: descriptions[index] || '',
      filename: image.filename || `photo_${Date.now()}_${index}.jpg`,
    }));
    setSelectedPhotos(photosWithDescriptions);
  };

  return (
    <ScrollView 
      style={[styles.container, style]} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
    >
      {/* Alert Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo de Alerta</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              formData.type === ALERT_TYPES.LOST && styles.typeButtonActive,
              { backgroundColor: ALERT_TYPES.LOST === formData.type ? COLORS.primary : COLORS.lightGray }
            ]}
            onPress={() => updateField('type', ALERT_TYPES.LOST)}
          >
            <Text style={[
              styles.typeButtonText,
              formData.type === ALERT_TYPES.LOST && styles.typeButtonTextActive
            ]}>
              🔍 PERDIDO
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              formData.type === ALERT_TYPES.SEEN && styles.typeButtonActive,
              { backgroundColor: ALERT_TYPES.SEEN === formData.type ? COLORS.secondary : COLORS.lightGray }
            ]}
            onPress={() => updateField('type', ALERT_TYPES.SEEN)}
          >
            <Text style={[
              styles.typeButtonText,
              formData.type === ALERT_TYPES.SEEN && styles.typeButtonTextActive
            ]}>
              👀 ENCONTRADO
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title Field */}
        <Input
          label="Título de la alerta *"
          value={formData.title}
          onChangeText={(value) => updateField('title', value)}
          placeholder={formData.type === ALERT_TYPES.LOST ? "Ej: Perro perdido en el centro" : "Ej: Gato encontrado en el parque"}
          error={errors.title}
        />
      </View>

      {/* Pet Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la Mascota</Text>
        
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Input
              label="Raza *"
              value={formData.breed}
              onChangeText={(value) => updateField('breed', value)}
              placeholder="Ej: Golden Retriever"
              error={errors.breed}
            />
          </View>
          
          <View style={styles.halfWidth}>
            <Input
              label="Color *"
              value={formData.color}
              onChangeText={(value) => updateField('color', value)}
              placeholder="Ej: Dorado"
              error={errors.color}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Sexo</Text>
            <View style={styles.sexSelector}>
              {Object.values(PET_SEX).map((sex) => (
                <TouchableOpacity
                  key={sex}
                  style={[
                    styles.sexButton,
                    formData.sex === sex && styles.sexButtonActive
                  ]}
                  onPress={() => updateField('sex', sex)}
                >
                  <Text style={[
                    styles.sexButtonText,
                    formData.sex === sex && styles.sexButtonTextActive
                  ]}>
                    {sex === PET_SEX.MALE ? 'Macho' : sex === PET_SEX.FEMALE ? 'Hembra' : 'No sé'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.halfWidth}>
            <Input
              label={formData.type === ALERT_TYPES.LOST ? "Edad (años)" : "Edad (si se conoce)"}
              value={formData.age}
              onChangeText={(value) => updateField('age', value)}
              placeholder={formData.type === ALERT_TYPES.LOST ? "Ej: 2" : "Solo si es estimable"}
              keyboardType="numeric"
              error={errors.age}
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Tamaño</Text>
        <View style={styles.sizeSelector}>
          {['SMALL', 'MEDIUM', 'LARGE'].map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeButton,
                formData.size === size && styles.sizeButtonActive
              ]}
              onPress={() => updateField('size', size)}
            >
              <Text style={[
                styles.sizeButtonText,
                formData.size === size && styles.sizeButtonTextActive
              ]}>
                {size === 'SMALL' ? 'Pequeño' : size === 'MEDIUM' ? 'Mediano' : 'Grande'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Input
          label="Descripción *"
          value={formData.description}
          onChangeText={(value) => updateField('description', value)}
          placeholder="Describe características distintivas, comportamiento, etc."
          multiline
          numberOfLines={4}
          error={errors.description}
        />

        <Input
          label="Número de Chip (opcional)"
          value={formData.chipNumber}
          onChangeText={(value) => updateField('chipNumber', value)}
          placeholder="Ej: 999934234321432"
          keyboardType="numeric"
        />
      </View>

      {/* Location and Date */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ubicación y Fecha</Text>
        
        {/* Usar LocationAutocomplete para autocompletado */}
        <LocationAutocomplete
          onLocationSelect={handleLocationSelect}
          initialValue={formData.location}
          placeholder="Escribe la ubicación donde se perdió/encontró..."
          disabled={loading}
        />
        
        {errors.location && (
          <ErrorMessage message={errors.location} />
        )}

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Input
              label="Código Postal (informativo)"
              value={formData.postalCode}
              onChangeText={(value) => updateField('postalCode', value)}
              placeholder="Tu código postal (para referencia)"
              error={errors.postalCode}
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>
              ℹ️ Se incluirá en la descripción de la alerta
            </Text>
          </View>
          
          <View style={styles.halfWidth}>
            <Input
              label="País *"
              value={formData.countryCode}
              onChangeText={(value) => updateField('countryCode', value)}
              placeholder="Ej: ES"
              error={errors.countryCode}
              autoCapitalize="characters"
              maxLength={2}
            />
          </View>
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.inputLabel}>
            Fecha del {formData.type === ALERT_TYPES.LOST ? 'extravío' : 'avistamiento'}
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              📅 {formatDate(formData.date)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Contacto</Text>
        
        <Input
          label="Teléfono *"
          value={formData.contactPhone}
          onChangeText={(value) => updateField('contactPhone', value)}
          placeholder="Ej: +1234567890"
          keyboardType="phone-pad"
          error={errors.contactPhone}
        />

        <Input
          label="Email"
          value={formData.contactEmail}
          onChangeText={(value) => updateField('contactEmail', value)}
          placeholder="email@ejemplo.com"
          keyboardType="email-address"
          error={errors.contactEmail}
        />

        {formData.type === ALERT_TYPES.LOST && (
          <Input
            label="Recompensa ($)"
            value={formData.reward}
            onChangeText={(value) => updateField('reward', value)}
            placeholder="Opcional"
            keyboardType="numeric"
            error={errors.reward}
          />
        )}
      </View>

      {/* Photos Section - Solo disponible al crear alertas nuevas */}
      {!initialData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotos (opcional)</Text>
          <Text style={styles.helperText}>
            Agrega fotos para que sea más fácil identificar a la mascota
          </Text>
          
          <PhotoPicker
            onPhotosSelected={handlePhotosSelected}
            maxPhotos={5}
            uploadImmediately={false} // For new alerts, don't upload immediately
            style={styles.photoPickerContainer}
          />
        </View>
      )}

      {/* Mensaje informativo para edición */}
      {initialData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotos</Text>
          <Text style={styles.helperText}>
            Para agregar más fotos a esta alerta, ve a la pantalla de detalles de la alerta donde podrás subir fotos adicionales.
          </Text>
        </View>
      )}

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        {/* DEBUG INFO - GEOLOCATION ADDED */}
        <View style={{ backgroundColor: '#f0f0f0', padding: 10, marginBottom: 10, borderRadius: 5 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>DEBUG:</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>MODE: {initialData ? 'EDIT' : 'CREATE'}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>isFormValid: {isFormValid ? 'TRUE' : 'FALSE'}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>loading: {loading ? 'TRUE' : 'FALSE'}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>disabled: {(!isFormValid || loading) ? 'TRUE' : 'FALSE'}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>errors: {Object.keys(errors).length}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>initialData: {initialData ? 'EXISTS' : 'NULL'}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>hasRequiredFields: {
            formData.title && formData.breed && formData.color && formData.description && 
            formData.location && formData.contactPhone && formData.countryCode ? 'TRUE' : 'FALSE'
          }</Text>
          {/* NEW: Geolocation Debug */}
          <Text style={{ fontSize: 12, color: '#008000', fontWeight: 'bold' }}>📍 GEOLOCATION:</Text>
          <Text style={{ fontSize: 12, color: '#008000' }}>Location: {formData.location || 'Not set'}</Text>
          <Text style={{ fontSize: 12, color: '#008000' }}>GPS Address: {convertedAddress || 'Converting...'}</Text>
          <Text style={{ fontSize: 12, color: '#008000' }}>Raw Coords: {formData.latitude && formData.longitude ? 
            `${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}` : 'Not available'}</Text>
          <Text style={{ fontSize: 12, color: '#008000' }}>Source: {formData.locationSource}</Text>
        </View>
        
        <Button
          title={initialData ? 'Actualizar Alerta' : 'Crear Alerta'}
          onPress={handleSubmit}
          loading={loading}
          disabled={!isFormValid || loading}
          style={styles.submitButton}
        />
        
        {/* Show errors if any */}
        {!isFormValid && Object.keys(errors).length > 0 && (
          <View style={styles.errorSummary}>
            <Text style={styles.errorSummaryTitle}>Completa los siguientes campos:</Text>
            {Object.entries(errors).map(([field, error]) => (
              <Text key={field} style={styles.errorSummaryItem}>• {error}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerModal}>
            <Text style={styles.datePickerTitle}>Seleccionar fecha</Text>
            
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={formData.date.toISOString().split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  updateField('date', selectedDate);
                }}
                style={{
                  padding: 10,
                  fontSize: 16,
                  border: '1px solid #ccc',
                  borderRadius: 5,
                  marginVertical: 10,
                  width: '100%',
                }}
              />
            ) : (
              <View style={styles.mobileDateContainer}>
                <Text style={styles.mobileDateText}>
                  {formatDate(formData.date)}
                </Text>
                <Text style={styles.mobileDateHint}>
                  Use los botones de abajo para cambiar la fecha
                </Text>
                <View style={styles.mobileDateButtons}>
                  <TouchableOpacity
                    style={styles.mobileDateButton}
                    onPress={() => {
                      const yesterday = new Date(formData.date);
                      yesterday.setDate(yesterday.getDate() - 1);
                      updateField('date', yesterday);
                    }}
                  >
                    <Text style={styles.mobileDateButtonText}>← Ayer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mobileDateButton}
                    onPress={() => {
                      updateField('date', new Date());
                    }}
                  >
                    <Text style={styles.mobileDateButtonText}>Hoy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mobileDateButton}
                    onPress={() => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      updateField('date', weekAgo);
                    }}
                  >
                    <Text style={styles.mobileDateButtonText}>Hace 1 semana</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            <View style={styles.datePickerButtons}>
              <TouchableOpacity
                style={[styles.datePickerButton, styles.cancelButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.datePickerButton, styles.confirmButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 150, // Increased for submit button visibility
  },
  scrollContent: {
    paddingBottom: 80, // Additional padding for scroll content
    flexGrow: 1, // Ensure scroll content can expand
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    // backgroundColor set dynamically
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  typeButtonTextActive: {
    color: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  sexSelector: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between', // Distribute buttons evenly
  },
  sexButton: {
    // width: 40, // Remove fixed width
    // height: 40, // Remove fixed height
    flex: 1, // Allow buttons to take available space
    paddingVertical: 10, // Add padding for better touch area
    paddingHorizontal: 5, // Add horizontal padding
    borderRadius: 8, // Make it consistent with other buttons
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sexButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sexButtonText: {
    // fontSize: 18, // Adjust font size if needed
    fontSize: 14, // Reduced font size for better fit
    color: COLORS.text,
    textAlign: 'center', // Center text
  },
  sexButtonTextActive: {
    color: COLORS.white,
  },
  sizeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    alignItems: 'center',
  },
  sizeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  sizeButtonTextActive: {
    color: COLORS.white,
  },
  dateContainer: {
    marginTop: 16,
  },
  dateButton: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  submitContainer: {
    marginTop: 32,
    marginBottom: 100, // Increased for better visibility
    paddingHorizontal: 8,
    paddingBottom: 20, // Added extra padding
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 12,
    minHeight: 56, // Ensure minimum touch target
  },
  
  // Date picker styles
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  datePickerModal: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    minWidth: 300,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: COLORS.text,
  },
  mobileDateContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  mobileDateText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  mobileDateHint: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 15,
  },
  mobileDateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  mobileDateButton: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  mobileDateButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  datePickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 80,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: COLORS.text,
    fontWeight: '500',
  },
  confirmButtonText: {
    textAlign: 'center',
    color: COLORS.white,
    fontWeight: '500',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoRemoveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    fontStyle: 'italic',
  },
  photoPickerContainer: {
    marginTop: 12,
  },
  errorSummary: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.error + '10',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 8,
  },
  errorSummaryItem: {
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 4,
  },
});

export default AlertForm;
