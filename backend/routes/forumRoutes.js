const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  hidePost,
  unhidePost,
  pinPost,
  unpinPost,
  toggleLike,
  addComment,
  deleteComment,
  getUserPosts
} = require('../controllers/forumController');

// Post routes
router.get('/', getAllPosts);
router.get('/my-posts', getUserPosts);
router.get('/:id', getPostById);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

// Moderation routes (admin)
router.post('/:id/hide', hidePost);
router.post('/:id/unhide', unhidePost);
router.post('/:id/pin', pinPost);
router.post('/:id/unpin', unpinPost);

// Interaction routes
router.post('/:id/like', toggleLike);
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

module.exports = router;
