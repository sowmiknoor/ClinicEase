const ForumPost = require('../models/ForumPost');
const User = require('../models/User');

// GET ALL POSTS (excluding hidden posts for non-admins)
exports.getAllPosts = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const user = await User.findById(userId);
    
    // Build query based on user role
    let query = {};
    if (!user || user.role !== 'Admin') {
      query.isHidden = false;
    }

    const posts = await ForumPost.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .populate('authorId', 'name role')
      .lean();

    res.json({ ok: true, posts });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// GET SINGLE POST BY ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    const user = await User.findById(userId);

    const post = await ForumPost.findById(id)
      .populate('authorId', 'name role')
      .lean();

    if (!post) {
      return res.status(404).json({ ok: false, msg: 'Post not found' });
    }

    // Check if post is hidden and user is not admin
    if (post.isHidden && (!user || user.role !== 'Admin')) {
      return res.status(403).json({ ok: false, msg: 'This post is hidden' });
    }

    // Increment view count
    await ForumPost.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({ ok: true, post });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// CREATE NEW POST
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags, attachments } = req.body;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ ok: false, msg: 'User ID required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, msg: 'User not found' });
    }

    const post = await ForumPost.create({
      title,
      content,
      category: category || 'General Health',
      authorId: userId,
      authorName: user.name,
      authorRole: user.role,
      tags: tags || [],
      attachments: attachments || []
    });

    const populatedPost = await ForumPost.findById(post._id)
      .populate('authorId', 'name role');

    res.json({ ok: true, msg: 'Post created successfully', post: populatedPost });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// UPDATE POST (only by author)
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, attachments } = req.body;
    const userId = req.headers['x-user-id'];

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, msg: 'Post not found' });
    }

    // Check if user is the author
    if (post.authorId.toString() !== userId) {
      return res.status(403).json({ ok: false, msg: 'You can only edit your own posts' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    post.attachments = attachments || post.attachments;

    await post.save();

    const updatedPost = await ForumPost.findById(id)
      .populate('authorId', 'name role');

    res.json({ ok: true, msg: 'Post updated successfully', post: updatedPost });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// DELETE POST (by author or admin)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, msg: 'Post not found' });
    }

    const user = await User.findById(userId);
    
    // Check if user is author or admin
    if (post.authorId.toString() !== userId && user.role !== 'Admin') {
      return res.status(403).json({ ok: false, msg: 'You can only delete your own posts' });
    }

    await ForumPost.findByIdAndDelete(id);

    res.json({ ok: true, msg: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// HIDE POST (admin only)
exports.hidePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.headers['x-user-id'];

    const user = await User.findById(userId);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ ok: false, msg: 'Admin access required' });
    }

    const post = await ForumPost.findByIdAndUpdate(
      id,
      {
        isHidden: true,
        hiddenBy: userId,
        hiddenReason: reason || 'Violates community guidelines',
        hiddenAt: new Date()
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ ok: false, msg: 'Post not found' });
    }

    res.json({ ok: true, msg: 'Post hidden successfully', post });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// UNHIDE POST (admin only)
exports.unhidePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    const user = await User.findById(userId);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ ok: false, msg: 'Admin access required' });
    }

    const post = await ForumPost.findByIdAndUpdate(
      id,
      {
        isHidden: false,
        hiddenBy: null,
        hiddenReason: null,
        hiddenAt: null
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ ok: false, msg: 'Post not found' });
    }

    res.json({ ok: true, msg: 'Post unhidden successfully', post });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// PIN POST (admin only)
exports.pinPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    const user = await User.findById(userId);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ ok: false, msg: 'Admin access required' });
    }

    const post = await ForumPost.findByIdAndUpdate(
      id,
      { isPinned: true },
      { new: true }
    );

    res.json({ ok: true, msg: 'Post pinned successfully', post });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// UNPIN POST (admin only)
exports.unpinPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    const user = await User.findById(userId);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ ok: false, msg: 'Admin access required' });
    }

    const post = await ForumPost.findByIdAndUpdate(
      id,
      { isPinned: false },
      { new: true }
    );

    res.json({ ok: true, msg: 'Post unpinned successfully', post });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// LIKE/UNLIKE POST
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ ok: false, msg: 'User ID required' });
    }

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, msg: 'Post not found' });
    }

    // Check if user already liked
    const likeIndex = post.likes.findIndex(
      like => like.userId.toString() === userId
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ userId, timestamp: new Date() });
    }

    await post.save();

    res.json({ 
      ok: true, 
      msg: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ ok: false, msg: 'User ID required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, msg: 'User not found' });
    }

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, msg: 'Post not found' });
    }

    post.comments.push({
      userId,
      userName: user.name,
      userRole: user.role,
      content,
      timestamp: new Date()
    });

    await post.save();

    res.json({ ok: true, msg: 'Comment added', comments: post.comments });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// DELETE COMMENT (by author or admin)
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.headers['x-user-id'];

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, msg: 'Post not found' });
    }

    const user = await User.findById(userId);
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ ok: false, msg: 'Comment not found' });
    }

    // Check if user is comment author or admin
    if (comment.userId.toString() !== userId && user.role !== 'Admin') {
      return res.status(403).json({ ok: false, msg: 'Not authorized' });
    }

    comment.remove();
    await post.save();

    res.json({ ok: true, msg: 'Comment deleted', comments: post.comments });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// GET USER'S POSTS
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ ok: false, msg: 'User ID required' });
    }

    const posts = await ForumPost.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .populate('authorId', 'name role');

    res.json({ ok: true, posts });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};
