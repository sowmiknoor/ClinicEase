import { useState } from 'react';
import './CreatePostModal.css';

export default function CreatePostModal({ onClose, onSuccess, editPost = null }) {
  const [form, setForm] = useState({
    title: editPost?.title || '',
    content: editPost?.content || '',
    category: editPost?.category || 'General Health',
    tags: editPost?.tags?.join(', ') || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = localStorage.getItem('userId');

  const categories = [
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = form.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        tags: tagsArray
      };

      const url = editPost ? `/api/forum/${editPost._id}` : '/api/forum';
      const method = editPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.ok) {
        alert(editPost ? 'Post updated successfully!' : 'Post created successfully!');
        onSuccess();
      } else {
        alert(data.msg || 'Failed to save post');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      alert('Error saving post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editPost ? '✏️ Edit Post' : '✨ Create New Post'}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label>
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter a descriptive title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              maxLength={200}
            />
            <div className="char-count">{form.title.length}/200</div>
          </div>

          <div className="form-group">
            <label>
              Category <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Content <span className="required">*</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="Share your thoughts, questions, or research findings..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              rows={10}
              maxLength={5000}
            />
            <div className="char-count">{form.content.length}/5000</div>
          </div>

          <div className="form-group">
            <label>Tags (optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="diabetes, nutrition, exercise (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <small className="form-help">Separate tags with commas</small>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : (
                <>
                  <span>{editPost ? '💾' : '📤'}</span>
                  {editPost ? 'Update Post' : 'Publish Post'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
