import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import './CommunityForum.css';
import CreatePostModal from './CreatePostModal';
import PostDetailModal from './PostDetailModal';

export default function CommunityForum() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMyPosts, setViewMyPosts] = useState(false);

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  const categories = [
    'All',
    'General Health',
    'Mental Health',
    'Nutrition',
    'Exercise & Fitness',
    'Disease Prevention',
    'Research Papers',
    'Medical Breakthrough',
    'Patient Stories',
    'Health Tips',
    'Q&A',
    'Other'
  ];

  useEffect(() => {
    fetchPosts();
  }, [viewMyPosts]);

  useEffect(() => {
    filterPosts();
  }, [posts, categoryFilter, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const endpoint = viewMyPosts ? '/api/forum/my-posts' : '/api/forum';
      const res = await fetch(endpoint, {
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(post => post.category === categoryFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredPosts(filtered);
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/forum/${postId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        setPosts(posts.filter(p => p._id !== postId));
        setSelectedPost(null);
        alert('Post deleted successfully');
      } else {
        alert(data.msg || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Error deleting post');
    }
  };

  const handleHidePost = async (postId, reason) => {
    try {
      const res = await fetch(`/api/forum/${postId}/hide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.ok) {
        fetchPosts();
        alert('Post hidden successfully');
      } else {
        alert(data.msg || 'Failed to hide post');
      }
    } catch (err) {
      console.error('Failed to hide post:', err);
      alert('Error hiding post');
    }
  };

  const handleUnhidePost = async (postId) => {
    try {
      const res = await fetch(`/api/forum/${postId}/unhide`, {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        fetchPosts();
        alert('Post unhidden successfully');
      } else {
        alert(data.msg || 'Failed to unhide post');
      }
    } catch (err) {
      console.error('Failed to unhide post:', err);
      alert('Error unhiding post');
    }
  };

  const handlePinPost = async (postId, isPinned) => {
    try {
      const endpoint = isPinned ? 'unpin' : 'pin';
      const res = await fetch(`/api/forum/${postId}/${endpoint}`, {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
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
    <div className="forum-container">
      {/* Header */}
      <div className="forum-header">
        <div className="forum-title-section">
          <h1>
            <span>💬</span>
            Community Health Forum
          </h1>
          <p>Share knowledge, ask questions, and connect with the community</p>
        </div>
        <div className="forum-actions">
          <button
            className="my-posts-btn"
            onClick={() => setViewMyPosts(!viewMyPosts)}
          >
            {viewMyPosts ? '🌐 All Posts' : '📝 My Posts'}
          </button>
          <button
            className="new-post-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <span>✏️</span>
            New Post
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="forum-filters">
        <div className="filter-group">
          <label>Category:</label>
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search posts, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: 'var(--color-text-muted)' }}>
            Loading posts...
          </p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No Posts Found</h3>
          <p>
            {viewMyPosts
              ? "You haven't created any posts yet."
              : 'Be the first to start a conversation!'}
          </p>
          <button
            className="new-post-btn"
            onClick={() => setShowCreateModal(true)}
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="forum-posts">
          {filteredPosts.map(post => (
            <div
              key={post._id}
              className={`post-card ${post.isPinned ? 'pinned' : ''} ${post.isHidden ? 'hidden' : ''}`}
              onClick={() => setSelectedPost(post)}
            >
              {post.isPinned && (
                <div className="pin-badge">
                  <span>📌</span>
                  Pinned
                </div>
              )}
              {post.isHidden && userRole === 'Admin' && (
                <div className="hidden-badge">
                  🚫 Hidden
                </div>
              )}

              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">
                    {getInitials(post.authorName)}
                  </div>
                  <div className="author-info">
                    <h4>{post.authorName}</h4>
                    <div className="author-meta">
                      <span className={`role-badge ${post.authorRole.toLowerCase()}`}>
                        {post.authorRole}
                      </span>
                      <span className="post-time">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="category-badge">{post.category}</span>
              </div>

              <div className="post-content">
                <h3>{post.title}</h3>
                <p className="post-preview">{post.content}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="post-footer">
                <div className="post-stats">
                  <div className="stat-item">
                    <span>👁️</span>
                    <span>{post.views || 0}</span> views
                  </div>
                  <div className="stat-item">
                    <span>❤️</span>
                    <span>{post.likes?.length || 0}</span> likes
                  </div>
                  <div className="stat-item">
                    <span>💬</span>
                    <span>{post.comments?.length || 0}</span> comments
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPosts();
          }}
        />
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDelete={handleDeletePost}
          onHide={handleHidePost}
          onUnhide={handleUnhidePost}
          onPin={handlePinPost}
          onUpdate={fetchPosts}
        />
      )}
    </div>
  );
}
