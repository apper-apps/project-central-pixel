import commentsData from '@/services/mockData/comments.json';

let comments = [...commentsData];

const commentService = {
  // Get all comments for a specific task or project
  getByTaskId: (taskId) => {
    if (!taskId || typeof taskId !== 'number') {
      throw new Error('Valid task ID is required');
    }
    return Promise.resolve(
      comments
        .filter(comment => comment.taskId === taskId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    );
  },

  getByProjectId: (projectId) => {
    if (!projectId || typeof projectId !== 'number') {
      throw new Error('Valid project ID is required');
    }
    return Promise.resolve(
      comments
        .filter(comment => comment.projectId === projectId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    );
  },

  // Get all comments (for admin/moderation purposes)
  getAll: () => {
    return Promise.resolve([...comments]);
  },

  // Get a specific comment by ID
  getById: (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid comment ID is required');
    }
    const comment = comments.find(c => c.Id === id);
    if (!comment) {
      throw new Error('Comment not found');
    }
    return Promise.resolve({ ...comment });
  },

  // Create a new comment
  create: (commentData) => {
    if (!commentData || typeof commentData !== 'object') {
      throw new Error('Valid comment data is required');
    }

    const { taskId, projectId, authorId, content, parentId } = commentData;

    if (!authorId || typeof authorId !== 'number') {
      throw new Error('Author ID is required');
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Comment content is required');
    }
    if (!taskId && !projectId) {
      throw new Error('Either task ID or project ID is required');
    }
    if (taskId && projectId) {
      throw new Error('Comment cannot be associated with both task and project');
    }

    // Extract mentions from content
    const mentions = [];
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      // In a real app, you'd resolve usernames to user IDs
      // For mock data, we'll use placeholder logic
      const username = match[1];
      if (username === 'john.doe') mentions.push(1);
      else if (username === 'sarah.wilson') mentions.push(2);
      else if (username === 'mike.chen') mentions.push(3);
    }

    const newComment = {
      Id: Math.max(...comments.map(c => c.Id), 0) + 1,
      taskId: taskId || null,
      projectId: projectId || null,
      authorId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: parentId || null,
      mentions: [...new Set(mentions)], // Remove duplicates
      isEdited: false
    };

    comments.push(newComment);
    return Promise.resolve({ ...newComment });
  },

  // Update an existing comment
  update: (id, updateData) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid comment ID is required');
    }
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Valid update data is required');
    }

    const commentIndex = comments.findIndex(c => c.Id === id);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const existingComment = comments[commentIndex];
    const { content } = updateData;

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        throw new Error('Comment content must be a non-empty string');
      }

      // Extract mentions from updated content
      const mentions = [];
      const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
      let match;
      while ((match = mentionRegex.exec(content)) !== null) {
        const username = match[1];
        if (username === 'john.doe') mentions.push(1);
        else if (username === 'sarah.wilson') mentions.push(2);
        else if (username === 'mike.chen') mentions.push(3);
      }

      comments[commentIndex] = {
        ...existingComment,
        content: content.trim(),
        updatedAt: new Date().toISOString(),
        mentions: [...new Set(mentions)],
        isEdited: true
      };
    }

    return Promise.resolve({ ...comments[commentIndex] });
  },

  // Delete a comment
  delete: (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid comment ID is required');
    }

    const commentIndex = comments.findIndex(c => c.Id === id);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    // Also delete all replies to this comment
    const commentToDelete = comments[commentIndex];
    comments = comments.filter(c => c.Id !== id && c.parentId !== id);

    return Promise.resolve({ success: true });
  },

  // Get comment thread (parent + all replies)
  getThread: (parentId) => {
    if (!parentId || typeof parentId !== 'number') {
      throw new Error('Valid parent comment ID is required');
    }

    const parentComment = comments.find(c => c.Id === parentId);
    if (!parentComment) {
      throw new Error('Parent comment not found');
    }

    const replies = comments
      .filter(c => c.parentId === parentId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return Promise.resolve({
      parent: { ...parentComment },
      replies: replies.map(r => ({ ...r }))
    });
  }
};

export default commentService;