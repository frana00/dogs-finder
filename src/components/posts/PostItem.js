import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../../utils/constants';
import PostEditModal from './PostEditModal';

const PostItem = ({ 
  post, 
  currentUsername,
  alertCreatorUsername,
  onEdit,
  onDelete,
  loading = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if user can edit this post (owner of the post)
  const canEdit = currentUsername === post.username;
  
  // Check if user can delete this post (owner of the post OR owner of the alert)
  const canDelete = currentUsername === post.username || currentUsername === alertCreatorUsername;

  const handleEdit = async (newContent) => {
    try {
      setIsUpdating(true);
      await onEdit(post.id, newContent);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo editar el comentario');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar comentario',
      '¿Estás seguro de que quieres eliminar este comentario?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(post.id),
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
          </View>
          
          {(canEdit || canDelete) && (
            <View style={styles.actions}>
              {canEdit && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setIsEditing(true)}
                  disabled={loading}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
              )}
              {canDelete && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleDelete}
                  disabled={loading}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        
        <Text style={styles.content}>{post.content}</Text>
      </View>
      
      <PostEditModal
        visible={isEditing}
        post={post}
        onSave={handleEdit}
        onCancel={() => setIsEditing(false)}
        loading={isUpdating}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: COLORS.gray,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: COLORS.background,
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  content: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 20,
  },
});

export default PostItem;
