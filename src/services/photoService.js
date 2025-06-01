import { API_CONFIG, buildUrl } from '../config/api';

/**
 * Photo Service - Simplified for backend integration
 * Based on working petsignal-fe example
 */
class PhotoService {
  constructor() {
    // No longer storing static URLs - we'll build them dynamically
  }

  // Simple headers without authentication requirement
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Obtiene URLs presignadas para nuevas fotos
   * @param {string} alertId - ID de la alerta
   * @param {string[]} photoFilenames - Array de nombres de archivos
   * @returns {Promise<Array>} Array de objetos con s3ObjectKey y presignedUrl
   */
  async getPresignedUrlsForNewPhotos(alertId, photoFilenames) {
    const url = await buildUrl(API_CONFIG.ENDPOINTS.UPLOAD_PHOTO_TO_ALERT.replace('{alertId}', alertId));
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ photoFilenames }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting presigned URLs for new photos:', error);
      throw error;
    }
  }

  /**
   * Sube una foto usando presigned URL
   * @param {string} presignedUrl - URL presignada de S3
   * @param {string} photoUri - URI local de la foto
   * @returns {Promise<void>}
   */
  async uploadPhotoToS3(presignedUrl, photoUri) {
    try {
      // Para React Native, crear FormData y subirla directamente
      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Error uploading photo to S3:', error);
      throw error;
    }
  }

  /**
   * Proceso completo: obtener presigned URLs y subir fotos
   * @param {string} alertId - ID de la alerta
   * @param {string[]} photoUris - Array de URIs locales de fotos
   * @returns {Promise<Array>} Array de URLs finales de las fotos
   */
  async uploadPhotosForAlert(alertId, photoUris) {
    if (!photoUris || photoUris.length === 0) {
      return [];
    }

    try {
      // Generar nombres únicos para las fotos
      const photoFilenames = photoUris.map((_, index) => 
        `alert-${alertId}-photo-${index}-${Date.now()}.jpg`
      );

      // Obtener presigned URLs
      const presignedData = await this.getPresignedUrlsForNewPhotos(alertId, photoFilenames);

      // Subir cada foto
      const uploadPromises = presignedData.map(async (data, index) => {
        await this.uploadPhotoToS3(data.presignedUrl, photoUris[index]);
        return data.s3ObjectKey; // Return the S3 key for final URL construction
      });

      const uploadedKeys = await Promise.all(uploadPromises);
      
      // Return the actual photo URLs (based on S3 bucket structure)
      return uploadedKeys.map(key => 
        `https://pet-signal-photos-828.s3.us-east-2.amazonaws.com/${key}`
      );

    } catch (error) {
      console.error('Error uploading photos for alert:', error);
      throw error;
    }
  }
}

// Crear una instancia única del servicio
const photoService = new PhotoService();

export default photoService;
