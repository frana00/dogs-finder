import apiClient from './api';

/**
 * Gets all posts for a specific alert
 * @param {number} alertId - The alert ID
 * @returns {Promise<Array>} - Array of posts
 */
export const getPostsForAlert = async (alertId) => {
  try {
    console.log('📝 Getting posts for alert:', alertId);
    const response = await apiClient.get(`/alerts/${alertId}/posts`);
    console.log('📝 Posts loaded:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('❌ Error loading posts:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar comentarios');
  }
};

/**
 * Creates a new post for an alert
 * @param {number} alertId - The alert ID
 * @param {Object} postData - Post data
 * @param {string} postData.username - Username of the author
 * @param {string} postData.content - Content of the post
 * @returns {Promise<Object>} - Created post data
 */
export const createPost = async (alertId, postData) => {
  try {
    console.log('📝 Creating post for alert:', alertId, postData);
    
    // Validate required fields
    if (!postData.username) {
      throw new Error('Username es requerido');
    }
    if (!postData.content || !postData.content.trim()) {
      throw new Error('El contenido del comentario es requerido');
    }

    const response = await apiClient.post(`/alerts/${alertId}/posts`, {
      username: postData.username,
      content: postData.content.trim(),
    });

    console.log('📝 Post created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating post:', error);
    throw new Error(error.response?.data?.message || 'Error al crear comentario');
  }
};

/**
 * Updates an existing post
 * @param {number} postId - The post ID
 * @param {Object} postData - Updated post data
 * @param {string} postData.content - New content of the post
 * @returns {Promise<Object>} - Updated post data
 */
export const updatePost = async (postId, postData) => {
  try {
    console.log('📝 Updating post:', postId, postData);
    
    // Validate required fields
    if (!postData.content || !postData.content.trim()) {
      throw new Error('El contenido del comentario es requerido');
    }

    const response = await apiClient.put(`/posts/${postId}`, {
      content: postData.content.trim(),
    });

    console.log('📝 Post updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating post:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar comentario');
  }
};

/**
 * Deletes a post
 * @param {number} postId - The post ID
 * @returns {Promise<void>}
 */
export const deletePost = async (postId) => {
  try {
    console.log('📝 Deleting post:', postId);
    
    await apiClient.delete(`/posts/${postId}`);
    
    console.log('📝 Post deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar comentario');
  }
};
