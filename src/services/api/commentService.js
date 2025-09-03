import activityService from "@/services/api/activityService";

// Comment service with ApperClient integration
const { ApperClient } = window.ApperSDK;

// Initialize ApperClient
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

// Table name from database schema
const TABLE_NAME = 'comment_c';

// Field configuration based on comment_c table schema
const COMMENT_FIELDS = [
  { field: { Name: "Name" } },
  { field: { Name: "Tags" } },
  { field: { Name: "Owner" } },
  { field: { Name: "CreatedOn" } },
  { field: { Name: "CreatedBy" } },
  { field: { Name: "ModifiedOn" } },
  { field: { Name: "ModifiedBy" } },
  { field: { Name: "content_c" } },
  { field: { Name: "created_at_c" } },
  { field: { Name: "updated_at_c" } },
  { field: { Name: "mentions_c" } },
  { field: { Name: "is_edited_c" } },
  { field: { Name: "task_id_c" } },
  { field: { Name: "author_id_c" } },
  { field: { Name: "parent_id_c" } }
];

// Updateable fields only (excluding System fields)
const UPDATEABLE_FIELDS = [
  'Name',
  'content_c', 
  'created_at_c',
  'updated_at_c',
  'mentions_c',
  'is_edited_c',
  'task_id_c',
  'author_id_c',
  'parent_id_c'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock comments data for development/testing
let comments = [
  {
    Id: 1,
    taskId: 1,
    authorId: 1,
    content: "This looks great! Let's move forward with this approach.",
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-15T10:30:00.000Z",
    parentId: null,
    mentions: [],
    isEdited: false
  },
  {
    Id: 2,
    taskId: 1,
    authorId: 2,
    content: "I agree with @john.doe. Should we add some unit tests?",
    createdAt: "2024-01-15T11:15:00.000Z",
    updatedAt: "2024-01-15T11:15:00.000Z",
    parentId: 1,
    mentions: [1],
    isEdited: false
  },
  {
    Id: 3,
    taskId: 2,
    authorId: 3,
    content: "Working on the implementation now. Will update soon.",
    createdAt: "2024-01-15T14:20:00.000Z",
    updatedAt: "2024-01-15T14:20:00.000Z",
    parentId: null,
    mentions: [],
    isEdited: false
  }
];

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

const { taskId, authorId, content, parentId } = commentData;

    if (!authorId || typeof authorId !== 'number') {
      throw new Error('Author ID is required');
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Comment content is required');
    }
    if (!taskId || typeof taskId !== 'number') {
      throw new Error('Task ID is required');
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
      taskId,
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
// Import activity service to track comment activities

// Override create method to track activity
const originalCreate = commentService.create;
commentService.create = async (commentData) => {
  const newComment = await originalCreate(commentData);
  
  // Track comment creation activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.COMMENT_CREATED,
    userId: newComment.authorId,
    taskId: newComment.taskId,
    commentId: newComment.Id,
    description: 'added a comment to a task'
  });
  
  return newComment;
};

// Override update method to track activity
const originalCommentUpdate = commentService.update;
commentService.update = async (id, updateData) => {
  const updatedComment = await originalCommentUpdate(id, updateData);
  
  // Track comment update activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.COMMENT_UPDATED,
    userId: updatedComment.authorId,
    taskId: updatedComment.taskId,
    commentId: updatedComment.Id,
    description: 'updated a comment on a task'
  });
  
  return updatedComment;
};

// Override delete method to track activity
const originalCommentDelete = commentService.delete;
commentService.delete = async (id) => {
  const comment = await commentService.getById(id);
  await originalCommentDelete(id);
  
  // Track comment deletion activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.COMMENT_DELETED,
    userId: comment.authorId,
    taskId: comment.taskId,
    commentId: comment.Id,
    description: 'deleted a comment from a task'
  });
};

export default commentService;