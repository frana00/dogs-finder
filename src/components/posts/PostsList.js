import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { COLORS } from '../../utils/constants';
import PostItem from './PostItem';

const PostsList = ({ 
  posts, 
  loading, 
  onRefresh, 
  onEditPost,
  onDeletePost,
  currentUsername,
  alertCreatorUsername,
  style 
}) => {
  const renderPost = ({ item }) => (
    <PostItem
      post={item}
      currentUsername={currentUsername}
      alertCreatorUsername={alertCreatorUsername}
      onEdit={onEditPost}
      onDelete={onDeletePost}
      loading={loading}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        💬 Aún no hay comentarios en esta alerta
      </Text>
      <Text style={styles.emptySubtext}>
        ¡Sé el primero en comentar si tienes información!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        refreshing={loading}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PostsList;
