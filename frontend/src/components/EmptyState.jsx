import './EmptyState.css';

export default function EmptyState({ 
  icon = '📭', 
  title = 'No data found', 
  description = 'There is nothing to display at the moment.',
  action = null,
  actionLabel = null,
  onAction = null
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      {action && onAction && (
        <button className="empty-action-btn" onClick={onAction}>
          {actionLabel || action}
        </button>
      )}
    </div>
  );
}
