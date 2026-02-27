export default function UserItem({ user, onEdit, onDelete }) {
  return (
    <div className="user-card">
      <div className="user-info">
        <span className="user-name">{user.name}</span>
        <span className="user-age">{user.age} лет</span>
        <span className="user-id">ID: {user.id}</span>
      </div>
      <div className="user-actions">
        <button className="btn-edit" onClick={() => onEdit(user)}>
          ✏️ Изменить
        </button>
        <button className="btn-delete" onClick={() => onDelete(user.id)}>
          🗑️ Удалить
        </button>
      </div>
    </div>
  );
}
