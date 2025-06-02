import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Keyboard,
  Platform,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import { useAlerts } from '../../context/AlertContext';

// --- Colores Verde para Encontrados ---
const FOUND_DOG_COLOR = '#4CAF50';
const FOUND_DOG_COLOR_LIGHT = '#E8F5E9';
const FOUND_DOG_COLOR_BORDER = '#C8E6C9';
const FOUND_DOG_COLOR_DARK = '#388E3C';
// -------------------------------------

const FoundDogDetailScreen = ({ navigation }) => {
  const route = useRoute();
  const { dog } = route.params; // Obtener el objeto dog completo
  const { getAlert, deleteAlert } = useAlerts();
  
  // Estados para los datos de la alerta
  const [dogData, setDogData] = useState(dog);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log(' FoundDogDetailScreen: Initial dogData from route.params:', JSON.stringify(dogData));

  // Estados para imágenes y modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const images = Array.isArray(dogData?.photoUrls) && dogData.photoUrls.length > 0 
    ? dogData.photoUrls.map(photo => ({ uri: photo.presignedUrl })) 
    : [];
  console.log(' FoundDogDetailScreen: Calculated images:', JSON.stringify(images));

  const screenWidth = Dimensions.get('window').width;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Estados y Ref para Comentarios
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const scrollRef = useRef(null);

  // Cargar datos completos de la alerta si es necesario
  useEffect(() => {
    if (dogData && dogData.id && !dogData.fullDataLoaded) {
      loadFullAlertData();
    }
  }, [dogData]);

  const loadFullAlertData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fullAlert = await getAlert(dogData.id);
      console.log('🔍 FULL ALERT DATA STRUCTURE:', JSON.stringify(fullAlert, null, 2));
      
      if (fullAlert.photoUrls && Array.isArray(fullAlert.photoUrls) && fullAlert.photoUrls.length > 0) {
        console.log('🔍 PHOTO DATA STRUCTURE ANALYSIS:');
        console.log('Number of photos:', fullAlert.photoUrls.length);
        fullAlert.photoUrls.forEach((photo, index) => {
          console.log(`Photo ${index + 1}:`, JSON.stringify(photo, null, 2));
          console.log(`Photo ${index + 1} keys:`, Object.keys(photo));
        });
      }
      
      setDogData({ ...fullAlert, fullDataLoaded: true });
    } catch (err) {
      console.error('Error loading full alert data:', err);
      setError('No se pudieron cargar los detalles completos de la alerta');
    } finally {
      setLoading(false);
    }
  };

  // Manejador de error si no hay dogData
  if (!dogData) {
    return (
      <View style={styles.containerCenter}>
        <Text>No se encontraron datos del perro.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonError}>
            <Text style={styles.backButtonTextError}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }
    // Handlers para scroll e imágenes de comentarios
  const handleImageScroll = (event) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      if (screenWidth > 0) {
         const newIndex = Math.round(offsetX / screenWidth);
         if (newIndex !== activeImageIndex) {
             setActiveImageIndex(newIndex);
         }
      }
  };
  const handlePickPostImage = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos para acceder a la galería.');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaType.Images,
          allowsEditing: true, aspect: [4, 3], quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
          setNewPostImage(result.assets[0].uri);
      }
  };
  const handleRemovePostImage = () => { setNewPostImage(null); };
  const handleAddPost = () => {
    if (newPost.trim().length === 0 && !newPostImage) return;
    const now = new Date();
    const fecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newPostEntry = { id: `f${posts.length + 1}-${Date.now()}`, user: 'Tú', text: newPost.trim(), date: fecha, image: newPostImage || null };
    setPosts([...posts, newPostEntry]);
    setNewPost(''); setNewPostImage(null); Keyboard.dismiss();
    setTimeout(() => { scrollRef.current?.scrollToEnd({ animated: true }); }, 150);
  };

  const handleEditAlert = (alertToEdit) => {
    // Navegar a la pantalla de creación/edición, pasando los datos de la alerta
    // Asumimos que CreateFoundAlertScreen se adaptará para modo edición
    navigation.navigate('CreateFoundAlertScreen', { existingAlert: alertToEdit }); 
    console.log('Editar alerta:', alertToEdit.id);
    // TODO: Implementar la lógica de edición completa en CreateFoundAlertScreen
  };

  const handleDeleteAlert = async (alertId) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar esta alerta? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`🗑️ Eliminando alerta ${alertId}`);
              setLoading(true);
              
              // Usar el método deleteAlert del contexto
              await deleteAlert(alertId);
              
              console.log(`✅ Alerta ${alertId} eliminada exitosamente`);
              setLoading(false);
              
              Alert.alert(
                'Alerta Eliminada', 
                'La alerta ha sido eliminada exitosamente.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('❌ Error al eliminar la alerta:', error);
              setLoading(false);
              Alert.alert(
                'Error', 
                `No se pudo eliminar la alerta: ${error.message}`
              );
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAwareScrollView
      ref={scrollRef}
      style={styles.keyboardAwareContainer}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
      enableOnAndroid={true}
      enableAutomaticScroll={Platform.OS === 'ios'}
    >
      {/* --- Carrusel de Imágenes --- */}
      <View style={styles.header}>
        {images.length > 0 ? (
          <>
            <ScrollView
                horizontal
                pagingEnabled
                onScroll={handleImageScroll}
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
                style={{ width: screenWidth, height: 280 }}
                contentContainerStyle={{ alignItems: 'center' }}
            >
              {images.map((img, index) => (
                 <TouchableOpacity
                    key={index}
                    onPress={() => { setSelectedImageIndex(index); setModalVisible(true); }}
                  >
                    <Image source={img} style={[styles.dogImage, { width: screenWidth }]} resizeMode="cover"/>
                 </TouchableOpacity>
              ))}
            </ScrollView>
             {images.length > 1 && (
                 <View style={styles.dotsContainer}>
                    {images.map((_, idx) => ( <View key={idx} style={[ styles.dot, activeImageIndex === idx && styles.dotActiveFound ]}/> ))}
                 </View>
             )}
          </>
        ) : ( <View style={styles.noImageContainer}><Ionicons name="paw-outline" size={80} color="#ccc" /><Text style={styles.noImageText}>Sin fotos</Text></View> )}
      </View>

      {/* --- Visor de Imágenes --- */}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseArea} 
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalImageContainer}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
              
              {images.length > 0 && (
                <>
                  <Image
                    source={{ uri: images[selectedImageIndex]?.uri || images[selectedImageIndex] }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                  <View style={styles.imageCounter}>
                    <Text style={styles.imageCounterText}>
                      {selectedImageIndex + 1} / {images.length}
                    </Text>
                  </View>
                  
                  {images.length > 1 && (
                    <>
                      <TouchableOpacity
                        style={[styles.navButton, styles.prevButton]}
                        onPress={() => setSelectedImageIndex((prev) => 
                          prev > 0 ? prev - 1 : images.length - 1
                        )}
                      >
                        <Ionicons name="chevron-back" size={30} color="white" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.navButton, styles.nextButton]}
                        onPress={() => setSelectedImageIndex((prev) => 
                          prev < images.length - 1 ? prev + 1 : 0
                        )}
                      >
                        <Ionicons name="chevron-forward" size={30} color="white" />
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* --- Detalles del Perro --- */}
      <View style={styles.detailsContainer}>
        <Text style={styles.dogName}>{dogData.title}</Text>
        <Text style={styles.dogBreed}>{dogData.breed || 'Raza no especificada'}</Text>

        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={20} color={FOUND_DOG_COLOR} style={styles.icon} />
          <Text style={styles.detailText}>{dogData.location || 'Ubicación no especificada'}</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={20} color={FOUND_DOG_COLOR} style={styles.icon} />
          <Text style={styles.detailText}>Encontrado el: {new Date(dogData.date).toLocaleDateString()}</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="information-circle-outline" size={20} color={FOUND_DOG_COLOR} style={styles.icon} />
          <Text style={styles.detailText}>{dogData.description || 'Sin descripción adicional.'}</Text>
        </View>

         {dogData.chipNumber && (
             <View style={styles.detailItem}>
                 <Ionicons name="hardware-chip-outline" size={20} color={FOUND_DOG_COLOR} style={styles.icon} />
                 <Text style={styles.detailText}>Chip: {dogData.chipNumber}</Text>
             </View>
         )}

         {dogData.username && (
             <View style={styles.detailItem}>
                 <Ionicons name="person-outline" size={20} color={FOUND_DOG_COLOR} style={styles.icon} />
                 <Text style={styles.detailText}>Reportado por: {dogData.username}</Text>
             </View>
         )}
      </View>

      {/* --- Botón Contactar --- */}
      <TouchableOpacity style={styles.contactButton} onPress={() => navigation.navigate('Chat', { alertId: dogData.id, alertTitle: dogData.title })}>
        <Text style={styles.contactButtonText}>Contactar al Rescatista</Text>
      </TouchableOpacity>

      {/* --- Botones de Edición y Eliminación --- */}
      <TouchableOpacity 
        style={styles.editButton} 
        onPress={() => handleEditAlert(dogData)}
      >
        <Text style={styles.editButtonText}>Editar Alerta</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => handleDeleteAlert(dogData.id)}
      >
        <Text style={styles.deleteButtonText}>Eliminar Alerta</Text>
      </TouchableOpacity>

      {/* --- Sección de Comentarios --- */}
      <View style={styles.postsSection}>
          <Text style={styles.sectionTitleFound}>Comentarios y Avistamientos</Text>
          <Text style={styles.commentsNote}>
            Los comentarios y el sistema de chat estarán disponibles próximamente.
          </Text>
          <View style={styles.postsList}>
            {posts.length === 0 && ( <Text style={styles.noPostsText}>Aún no hay comentarios.</Text> )}
            {posts.map(post => (
              <View key={post.id} style={styles.postItemFound}>
                 <View style={styles.postHeader}>
                     <Ionicons name="person-circle" size={22} color={FOUND_DOG_COLOR} style={{ marginRight: 4 }} />
                     <Text style={styles.postUserFound}>{post.user}</Text>
                     <Text style={styles.postDate}>{post.date}</Text>
                 </View>
                 {post.image && ( <TouchableOpacity><Image source={{ uri: post.image }} style={styles.postImage} /></TouchableOpacity> )}
                 <Text style={styles.postText}>{post.text}</Text>
              </View>
            ))}
          </View>
      </View>

      {/* --- Barra de Input --- */}
       <View style={styles.addPostContainer}>
          {newPostImage && (
            <View style={styles.addPostPreviewRow}>
              <Image source={{ uri: newPostImage }} style={styles.addPostPreviewImg} />
              <TouchableOpacity onPress={handleRemovePostImage} style={styles.addPostRemoveImgBtn}>
                <Ionicons name="close-circle" size={22} color={FOUND_DOG_COLOR} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.addPostBar}>
            <TouchableOpacity style={styles.addPostImageBtn} onPress={handlePickPostImage}>
              <Ionicons name={newPostImage ? "image" : "image-outline"} size={22} color={newPostImage ? FOUND_DOG_COLOR : "#888"} />
            </TouchableOpacity>
            <TextInput
              style={styles.addPostInput} value={newPost} onChangeText={setNewPost}
              placeholder="Añade un comentario o avistamiento..." placeholderTextColor="#999"
              multiline maxLength={250} />
            <TouchableOpacity style={[styles.addPostButtonFound, !newPost.trim() && !newPostImage && styles.addPostButtonDisabled]} onPress={handleAddPost} disabled={!newPost.trim() && !newPostImage}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

    </KeyboardAwareScrollView>
  );
};

// --- Estilos (COMPLETOS) ---
const styles = StyleSheet.create({
    keyboardAwareContainer: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingBottom: 10, flexGrow: 1 },
    container: { flex: 1, backgroundColor: '#fff' },
    containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { alignItems: 'center', marginBottom: 0, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#eee' },
    dogImage: { height: 280, backgroundColor: '#e0e0e0' },
    noImageContainer: { height: 280, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
    noImageText: { marginTop: 10, color: '#aaa', fontSize: 16 },
    dotsContainer: { flexDirection: 'row', position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(0, 0, 0, 0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ccc', marginHorizontal: 4 },
    dotActiveFound: { backgroundColor: FOUND_DOG_COLOR },
    imageViewerFooter: { height: 80, backgroundColor: "rgba(0, 0, 0, 0.7)", alignItems: "center", justifyContent: "center" },
    imageViewerFooterText: { color: "white", fontSize: 16, fontWeight: "bold" },
    detailsContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
    dogName: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    dogBreed: { fontSize: 18, color: '#555', marginBottom: 20 },
    detailItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
    icon: { marginRight: 12, marginTop: 2 },
    detailText: { fontSize: 16, color: '#444', flex: 1, lineHeight: 22 },
    contactButton: { backgroundColor: FOUND_DOG_COLOR, borderRadius: 8, paddingVertical: 16, marginHorizontal: 20, marginTop: 0, marginBottom: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
    contactButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    postsSection: { marginTop: 0, paddingHorizontal: 20, marginBottom: 10 },
    sectionTitleFound: { fontSize: 18, fontWeight: '600', color: FOUND_DOG_COLOR, marginBottom: 12, paddingBottom: 5 },
    commentsNote: { fontSize: 14, color: '#666', fontStyle: 'italic', marginBottom: 15, paddingHorizontal: 10, textAlign: 'center' },
    postsList: { marginTop: 10, gap: 15 },
    noPostsText: { color: '#999', textAlign: 'center', paddingVertical: 20, fontStyle: 'italic' },
    postItemFound: { backgroundColor: FOUND_DOG_COLOR_LIGHT, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: FOUND_DOG_COLOR_BORDER },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    postUserFound: { fontWeight: 'bold', color: FOUND_DOG_COLOR_DARK, marginRight: 8, fontSize: 15 },
    postDate: { color: '#757575', fontSize: 12 },
    postText: { fontSize: 15, color: '#333', lineHeight: 21, marginTop: 4, marginBottom: 6 },
    postImage: { width: '80%', aspectRatio: 16 / 9, borderRadius: 8, marginTop: 8, marginBottom: 8, alignSelf: 'flex-start', maxHeight: 200, resizeMode: 'cover', borderWidth: 1, borderColor: '#ddd' },
    addPostContainer: { marginTop: 5, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 15 : 10, borderTopWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#f8f8f8' },
    addPostPreviewRow: { paddingHorizontal: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
    addPostPreviewImg: { width: 45, height: 45, borderRadius: 4, borderWidth: 1, borderColor: '#ccc' },
    addPostRemoveImgBtn: { padding: 4, marginLeft: 5 },
    addPostBar: { flexDirection: 'row', alignItems: 'flex-end', paddingVertical: 5, paddingHorizontal: 12, gap: 10 },
    addPostImageBtn: { paddingBottom: 8, paddingHorizontal: 6 },
    addPostInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, paddingTop: Platform.OS === 'ios' ? 10 : 8, paddingBottom: Platform.OS === 'ios' ? 10 : 8, fontSize: 15, backgroundColor: '#fff', maxHeight: 100 },
    addPostButtonFound: { backgroundColor: FOUND_DOG_COLOR, borderRadius: 20, padding: 10, marginBottom: Platform.OS === 'ios' ? 0 : 2 },
    addPostButtonDisabled: { backgroundColor: '#A5D6A7' },
    backButtonError: { marginTop: 20, backgroundColor: '#ccc', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
    backButtonTextError: { color: '#333', fontWeight: 'bold' },
    
    // Estilos para el Modal personalizado
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseArea: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalImageContainer: {
      width: '90%',
      height: '80%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    modalImage: {
      width: '100%',
      height: '100%',
    },
    closeButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 20,
      padding: 8,
    },
    imageCounter: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
    },
    imageCounterText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    navButton: {
      position: 'absolute',
      top: '50%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 25,
      padding: 10,
      zIndex: 10,
    },
    prevButton: {
      left: 20,
    },
    nextButton: {
      right: 20,
    },
    editButton: {
      paddingVertical: 10,
      marginTop: 15,
      alignItems: 'center',
    },
    deleteButton: {
      paddingVertical: 10,
      marginTop: 5,
      marginBottom: 15,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    editButtonText: {
      color: '#007AFF',
      fontSize: 15,
      fontWeight: '600',
    },
    deleteButtonText: {
      color: '#FF3B30',
      fontSize: 15,
      fontWeight: '600',
    }
});

export default FoundDogDetailScreen;