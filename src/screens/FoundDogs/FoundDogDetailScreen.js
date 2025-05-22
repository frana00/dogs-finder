import React, { useState, useRef } from 'react';
import {
  Dimensions,
  Platform,
  Keyboard,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView, // Para scroll horizontal de imágenes
  TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import ImageViewing from 'react-native-image-viewing';
import { useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Importar datos de perros encontrados
import { dummyFoundDogs } from '../../data/dummyData';

// Datos por defecto (sin cambios)
const defaultDogData = { /* ... */ };
const chipStatusLabel = { si: 'Sí', no: 'No', no_sabe: 'No sabe' };
const dogSafeLabel = { si: 'Sí, lo tengo en casa/refugio', no: 'No, sigue en la calle' };

// --- Definir colores del tema ---
const FOUND_DOG_COLOR = '#4CAF50'; // Verde principal
const FOUND_DOG_COLOR_DARK = '#388E3C'; // Verde oscuro para textos/énfasis
const FOUND_DOG_COLOR_LIGHT = '#E8F5E9'; // Verde muy pálido para fondos
const FOUND_DOG_COLOR_BORDER = '#C8E6C9'; // Verde pálido para bordes
// -----------------------------

const FoundDogDetailScreen = ({ navigation }) => {
  const route = useRoute();
  const { dogId } = route.params; // Obtener dogId
  const dogData = dummyFoundDogs.find(dog => dog.id === dogId) || defaultDogData; // Buscar el perro por ID

  const images = Array.isArray(dogData.images) ? dogData.images : [];
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  // Estado y Refs para comentarios (sin cambios funcionales)
  const [posts, setPosts] = useState([
      { id: 'f1', user: 'Elena', text: '¿Alguien lo reconoce? Está bien cuidado.', date: '2025-04-20 11:00' },
  ]);
  const [newPost, setNewPost] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const scrollRef = useRef(null);

  // Handlers para comentarios (sin cambios funcionales)
  const handlePickPostImage = async () => { /* ... */
        let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.7 });
        if (!result.canceled && result.assets && result.assets.length > 0) { setNewPostImage(result.assets[0].uri); }
   };
  const handleRemovePostImage = () => { setNewPostImage(null); };
  const handleAddPost = () => { /* ... */
    if (newPost.trim().length === 0 && !newPostImage) return;
    const now = new Date();
    const fecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setPosts([...posts, { id: `f${posts.length + 1}`, user: 'Tú', text: newPost, date: fecha, image: newPostImage || null }]);
    setNewPost(''); setNewPostImage(null); Keyboard.dismiss();
    setTimeout(() => { scrollRef.current?.scrollToEnd({ animated: true }); }, 100);
  };
  const handleImageScroll = (event) => { /* Sin cambios funcionales */
    const offsetX = event.nativeEvent.contentOffset.x;
    const viewWidth = event.nativeEvent.layoutMeasurement.width;
    if (viewWidth > 0) {
       const idx = Math.round(offsetX / viewWidth);
       if (idx !== activeImageIdx) { setActiveImageIdx(idx); }
    }
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
        {/* Carrusel de imágenes */}
        <View style={styles.header}>
          {images.length > 0 ? (
            <>
              <View style={styles.imageScrollViewContainer}>
                <ScrollView /* ... */ horizontal pagingEnabled onScroll={handleImageScroll} scrollEventThrottle={16} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 0 }}>
                  {images.slice(0, 5).map((img, idx) => (
                    <TouchableOpacity key={idx} onPress={() => { setSelectedImageIdx(idx); setModalVisible(true); }}>
                      <Image source={{ uri: img }} style={[styles.dogImage, { width: screenWidth - (styles.scrollContent.paddingHorizontal * 2) }]} resizeMode="cover"/>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {images.length > 1 && (
                <View style={styles.dotsContainer}>
                  {images.slice(0, 5).map((_, idx) => ( <View key={idx} style={[styles.dot, activeImageIdx === idx && styles.dotActiveFound]}/> ))}
                </View>
              )}
            </>
          ) : ( <Ionicons name="image-outline" size={60} color="#cccccc" style={styles.iconPlaceholder} /> )}
        </View>

        {/* ImageViewing (sin cambios) */}
        <ImageViewing /* ... */ />

        {/* Detalles del perro encontrado */}
        <View style={styles.detailsSection}>
             {/* ... Bloques de datos sin cambios ... */}
             <View style={styles.section}>
               <Text style={styles.sectionTitleFound}>Notas adicionales</Text>
               <Text style={styles.sectionText}>{dogData.notes || 'No especificado'}</Text>
             </View>
        </View>

        {/* Sección de comentarios */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitleFound}>Comentarios y Contacto</Text>
          <View style={styles.postsList}>
            {posts.length === 0 && ( <Text style={styles.noPostsText}>Aún no hay comentarios.</Text> )}
            {posts.map(post => (
              // --- Aplicar estilo verde a los comentarios ---
              <View key={post.id} style={styles.postItemFound}>
                 <View style={styles.postHeader}>
                     {/* Icono de persona ahora verde */}
                     <Ionicons name="person-circle" size={22} color={FOUND_DOG_COLOR} style={{ marginRight: 4 }} />
                     {/* Nombre de usuario ahora verde oscuro */}
                     <Text style={styles.postUserFound}>{post.user}</Text>
                     <Text style={styles.postDate}>{post.date}</Text>
                 </View>
                 {post.image && ( <Image source={{ uri: post.image }} style={styles.postImage} /> )}
                 <Text style={styles.postText}>{post.text}</Text>
              </View>
              // --------------------------------------------
            ))}
          </View>
        </View>

        {/* Barra de input */}
        <View style={styles.addPostContainer}>
          {newPostImage && (
            <View style={styles.addPostPreviewRow}>
              <Image source={{ uri: newPostImage }} style={styles.addPostPreviewImg} />
              {/* Botón quitar imagen ahora verde */}
              <TouchableOpacity onPress={handleRemovePostImage} style={styles.addPostRemoveImgBtn}>
                <Ionicons name="close-circle" size={22} color={FOUND_DOG_COLOR} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.addPostBar}>
            {/* Icono de imagen ahora verde cuando hay imagen */}
            <TouchableOpacity style={styles.addPostImageBtn} onPress={handlePickPostImage}>
              <Ionicons name={newPostImage ? "image" : "image-outline"} size={22} color={newPostImage ? FOUND_DOG_COLOR : "#888"} />
            </TouchableOpacity>
            <TextInput
              style={styles.addPostInput}
              value={newPost}
              onChangeText={setNewPost}
              placeholder="Escribe un comentario..."
              multiline
              maxLength={200}
            />
            {/* Botón de enviar ahora verde */}
            <TouchableOpacity style={styles.addPostButtonFound} onPress={handleAddPost} disabled={newPost.trim().length === 0 && !newPostImage}>
              <Ionicons name="send" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón Volver (sin cambios) */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

    </KeyboardAwareScrollView>
  );
};

// --- ESTILOS CON COLORES VERDES AJUSTADOS ---
const styles = StyleSheet.create({
    // Contenedores principales (sin cambios)
    keyboardAwareContainer: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, flexGrow: 1 },

    // Carrusel (sin cambios visuales importantes, excepto dot activo)
    header: { alignItems: 'center', marginBottom: 20 },
    imageScrollViewContainer: { width: '100%', marginBottom: 10 },
    dogImage: { height: 280, borderRadius: 12, backgroundColor: '#e0e0e0' },
    iconPlaceholder: { color: '#cccccc', marginVertical: 60 },
    dotsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d1d1d1' },
    dotActiveFound: { backgroundColor: FOUND_DOG_COLOR, width: 10, height: 10, borderRadius: 5 }, // Verde
    modalCloseBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 4 },

    // Detalles (sin cambios visuales importantes)
    detailsSection: { marginBottom: 20 },
    dataBlock: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
    label: { fontSize: 15, fontWeight: '600', color: '#444', width: 110, marginRight: 8 },
    value: { fontSize: 15, color: '#111', flex: 1, lineHeight: 21 },
    section: { marginTop: 15, marginBottom: 10, paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#f0f0f0', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: FOUND_DOG_COLOR_BORDER /* Verde pálido */ },
    sectionText: { fontSize: 15, color: '#333', lineHeight: 22 },
    sectionTitleFound: { fontSize: 16, fontWeight: 'bold', color: FOUND_DOG_COLOR /* Verde */, marginBottom: 8 },

    // --- Comentarios con tema verde ---
    postsSection: { marginTop: 15 },
    postsList: { marginTop: 10, gap: 15 },
    noPostsText: { color: '#888', textAlign: 'center', paddingVertical: 20, fontStyle: 'italic' },
    postItemFound: { // Nuevo estilo para comentarios verdes
        backgroundColor: FOUND_DOG_COLOR_LIGHT, // Verde muy pálido
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: FOUND_DOG_COLOR_BORDER, // Borde verde pálido
    },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    postUserFound: { // Nuevo estilo para usuario verde
        fontWeight: 'bold',
        color: FOUND_DOG_COLOR_DARK, // Verde oscuro
        marginRight: 8,
        fontSize: 15,
    },
    postDate: { color: '#757575', fontSize: 12 }, // Gris neutro para fecha
    postText: { fontSize: 15, color: '#212121', lineHeight: 21, marginBottom: 6 }, // Texto oscuro
    postImage: { width: '80%', aspectRatio: 4 / 3, borderRadius: 8, marginBottom: 8, alignSelf: 'flex-start', maxHeight: 200, resizeMode: 'cover' },
    // ---------------------------------

    // --- Barra de Input con tema verde ---
    addPostContainer: { marginTop: 30, paddingTop: 10, borderTopWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#f5f5f5' },
    addPostPreviewRow: { paddingHorizontal: 12, paddingBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f8f8' },
    addPostPreviewImg: { width: 40, height: 40, borderRadius: 4 },
    addPostRemoveImgBtn: { padding: 4 }, // El icono dentro ya tiene color verde
    addPostBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, gap: 10 },
    addPostImageBtn: { padding: 6 }, // El icono dentro ya tiene color verde condicional
    addPostInput: { flex: 1, borderWidth: 1, borderColor: '#bdbdbd', borderRadius: 20, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 10 : 8, fontSize: 15, backgroundColor: '#fff', minHeight: 40, maxHeight: 100 },
    addPostButtonFound: { // Nuevo estilo para botón verde
        backgroundColor: FOUND_DOG_COLOR, // Verde
        borderRadius: 20,
        padding: 10,
    },
    // -----------------------------------

    // Botón Volver (sin cambios)
    backButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: FOUND_DOG_COLOR, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 28, alignSelf: 'center', marginTop: 32, marginBottom: 20 },
    backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 6 },
});

export default FoundDogDetailScreen;