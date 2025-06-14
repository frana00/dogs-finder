import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS, ALERT_TYPES } from '../../utils/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

const AlertCard = ({ alert, onPress, style }) => {
  const [imageError, setImageError] = useState(false);

  const getTypeColor = () => {
    return alert.type === ALERT_TYPES.LOST ? COLORS.primary : COLORS.secondary;
  };

  const getTypeText = () => {
    return alert.type === ALERT_TYPES.LOST ? 'PERDIDO' : 'ENCONTRADO';
  };

  const getStatusColor = () => {
    return alert.status === 'ACTIVE' ? getTypeColor() : COLORS.gray;
  };

  const getPhotoUrl = () => {
    // DEBUG: Log the alert data to understand what's coming from API
    console.log(`📸 AlertCard getPhotoUrl - Alert ${alert.id}:`, {
      id: alert.id,
      title: alert.title,
      hasPhotoUrl: !!alert.photoUrl,
      photoUrl: alert.photoUrl,
      hasPhotoUrls: !!alert.photoUrls,
      photoUrlsLength: alert.photoUrls ? alert.photoUrls.length : 0,
      photoUrls: alert.photoUrls,
      status: alert.status,
      createdRecently: alert.createdAt ? (Date.now() - new Date(alert.createdAt).getTime()) < 60000 : false
    });
    
    // First check if there's a single photoUrl (legacy support)
    if (alert.photoUrl) {
      console.log(`📸 Using legacy photoUrl for alert ${alert.id}:`, alert.photoUrl);
      return alert.photoUrl;
    }
    
    // Then check if there are multiple photos and take the first one
    if (alert.photoUrls && alert.photoUrls.length > 0) {
      const firstPhoto = alert.photoUrls[0];
      console.log(`📸 First photo data for alert ${alert.id}:`, firstPhoto);
      
      // Handle both presigned URL format and direct URL
      const url = firstPhoto.presignedUrl || firstPhoto.url || firstPhoto;
      console.log(`📸 Extracted URL for alert ${alert.id}:`, url);
      
      // Additional check for URL validity
      if (url && typeof url === 'string' && url.length > 0) {
        console.log(`📸 ✅ Valid URL found for alert ${alert.id}`);
        return url;
      } else {
        console.log(`📸 ❌ Invalid URL for alert ${alert.id}:`, typeof url, url);
        return null;
      }
    }
    
    console.log(`📸 ❌ No photo data found for alert ${alert.id} - will show placeholder`);
    return null;
  };

  const handleImageError = (error) => {
    console.warn('Failed to load image for alert:', alert.id);
    console.warn('Image error details:', error?.nativeEvent);
    console.warn('Attempted URL:', getPhotoUrl());
    setImageError(true);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formatLocation = (location) => {
    if (!location) return 'Sin ubicación';
    if (location.length > 25) {
      return location.substring(0, 25) + '...';
    }
    return location;
  };

  const getDisplayTitle = () => {
    // DEBUG: Log alert data to see what we have
    console.log(`🏷️ AlertCard getDisplayTitle for alert ${alert.id}:`, {
      type: alert.type,
      title: alert.title,
      petName: alert.petName,
      hasPetName: !!alert.petName,
      willShowPetName: alert.type === ALERT_TYPES.LOST && !!alert.petName,
      allKeys: Object.keys(alert)
    });
    
    // Para alertas de tipo PERDIDO, mostrar el nombre de la mascota
    if (alert.type === ALERT_TYPES.LOST) {
      const displayName = alert.petName || alert.title || 'Sin nombre';
      console.log(`🐕 LOST alert ${alert.id} displaying:`, displayName, `(petName: "${alert.petName}", title: "${alert.title}")`);
      return displayName;
    }
    
    // Para alertas de tipo ENCONTRADO, mostrar el título de la alerta
    if (alert.type === ALERT_TYPES.SEEN) {
      const displayName = alert.title || 'Sin nombre';
      console.log(`👀 SEEN alert ${alert.id} displaying:`, displayName);
      return displayName;
    }
    
    // Fallback para otros tipos
    return alert.title || 'Sin nombre';
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(alert)}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {getPhotoUrl() && !imageError ? (
          <Image
            source={{ uri: getPhotoUrl() }}
            style={styles.image}
            resizeMode="cover"
            onError={handleImageError}
            onLoad={() => console.log(`✅ Image loaded successfully for alert ${alert.id}`)}
            onLoadStart={() => console.log(`🔄 Started loading image for alert ${alert.id}:`, getPhotoUrl())}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: getTypeColor() + '20' }]}>
            <Text style={[styles.imagePlaceholderText, { color: getTypeColor() }]}>
              {alert.type === ALERT_TYPES.LOST ? '🐕' : '👀'}
            </Text>
          </View>
        )}
        
        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
          <Text style={styles.typeBadgeText}>{getTypeText()}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {getDisplayTitle()}
        </Text>
        
        <Text style={styles.breed} numberOfLines={1}>
          {alert.breed || 'Raza no especificada'}
        </Text>
        
        <Text style={styles.location} numberOfLines={1}>
          📍 {formatLocation(alert.location)}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.date}>
            {formatDate(alert.date || alert.createdAt)}
          </Text>
          
          {alert.status !== 'ACTIVE' && (
            <View style={[styles.statusBadge, { backgroundColor: COLORS.gray }]}>
              <Text style={styles.statusBadgeText}>RESUELTO</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 32,
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  breed: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 11,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '600',
  },
});

export default AlertCard;
