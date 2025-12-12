import { useState, useEffect } from 'react';
import './PostDetailModal.css';
import CreatePostModal from './CreatePostModal';

export default function PostDetailModal({ post, onClose, onDelete, onHide, onUnhide, onPin, onUpdate }) {
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [hideReason, setHideReason] = useState('');
  const [showHideDialog, setShowHideDialog] = useState(false);

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  const isAuthor = post.authorId?._id === userId || post.authorId === userId;
  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    // Check if current user liked the post
    const liked = post.likes?.some(like =>
      (like.userId?._id || like.userId) === userId
    );
    setIsLiked(liked);
  }, [post, userId]);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/forum/${post._id}/like`, {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/forum/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ content: newComment.trim() })
      });
      const data = await res.json();
      if (data.ok) {
        setComments(data.comments);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const res = await fetch(`/api/forum/${post._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleHidePost = async () => {
    if (!hideReason.trim()) {
      alert('Please provide a reason for hiding this post');
      return;
    }
    await onHide(post._id, hideReason);
    setShowHideDialog(false);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-section">
              <h2>Post Details</h2>
              <span className="category-badge">{post.category}</span>
            </div>
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>

          {/* Post Content */}
          <div className="post-detail-content">
            {/* Author Info */}
            <div className="post-author-section">
              <div className="author-avatar-large">
                {getInitials(post.authorName)}
              </div>
              <div className="author-details">
                <h3>{post.authorName}</h3>
                <div className="author-meta">
                  <span className={`role-badge ${post.authorRole.toLowerCase()}`}>
                    {post.authorRole}
                  </span>
                  <span className="post-date">
                    Posted on {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="post-badges">
              {post.isPinned && (
                <div className="badge pinned-badge">📌 Pinned by Admin</div>
              )}
              {post.isHidden && isAdmin && (
                <div className="badge hidden-badge">
                  🚫 Hidden: {post.hiddenReason}
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="post-title">{post.title}</h1>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="tag">#{tag}</span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="post-body">
              {post.content.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Stats & Actions */}
            <div className="post-actions-bar">
              <div className="post-stats">
                <div className="stat-item">
                  <span>👁️</span>
                  {post.views || 0} views
                </div>
                <div className="stat-item">
                  <span>❤️</span>
                  {likesCount} likes
                </div>
                <div className="stat-item">
                  <span>💬</span>
                  {comments.length} comments
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className={`action-btn ${isLiked ? 'liked' : ''}`}
                  onClick={handleLike}
                >
                  {isLiked ? '❤️ Liked' : '🤍 Like'}
                </button>

                {isAuthor && (
                  <>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => setShowEditModal(true)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => onDelete(post._id)}
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}

                {isAdmin && (
                  <>
                    <button
                      className="action-btn pin-btn"
                      onClick={() => onPin(post._id, post.isPinned)}
                    >
                      {post.isPinned ? '📌 Unpin' : '📍 Pin'}
                    </button>
                    {post.isHidden ? (
                      <button
                        className="action-btn unhide-btn"
                        onClick={() => onUnhide(post._id)}
                      >
                        👁️ Unhide
                      </button>
                    ) : (
                      <button
                        className="action-btn hide-btn"
                        onClick={() => setShowHideDialog(true)}
                      >
                        🚫 Hide
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="comments-section">
              <h3 className="comments-title">
                💬 Comments ({comments.length})
              </h3>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="add-comment-form">
                <textarea
                  className="comment-input"
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <button type="submit" className="comment-submit-btn">
                  💬 Post Comment
                </button>
              </form>

              {/* Comments List */}
              <div className="comments-list">
                {comments.length === 0 ? (
                  <div className="no-comments">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="comment-item">
                      <div className="comment-avatar">
                        {getInitials(comment.userName)}
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <div>
                            <span className="comment-author">{comment.userName}</span>
                            <span className={`role-badge ${comment.userRole.toLowerCase()}`}>
                              {comment.userRole}
                            </span>
                          </div>
                          <div className="comment-actions">
                            <span className="comment-date">
                              {formatDate(comment.timestamp)}
                            </span>
                            {(comment.userId === userId || isAdmin) && (
                              <button
                                className="comment-delete-btn"
                                onClick={() => handleDeleteComment(comment._id)}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hide Dialog */}
      {showHideDialog && (
        <div className="modal-overlay" onClick={() => setShowHideDialog(false)}>
          <div className="hide-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Hide Post</h3>
            <p>Please provide a reason for hiding this post:</p>
            <textarea
              className="hide-reason-input"
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
              placeholder="E.g., Violates community guidelines, spam, inappropriate content..."
              rows={4}
            />
            <div className="hide-dialog-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowHideDialog(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleHidePost}
              >
                Hide Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <CreatePostModal
          editPost={post}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onUpdate();
            onClose();
          }}
        />
      )}
    </>
  );
}
