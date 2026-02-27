import { useState, useEffect } from "react";
import { api } from "../api/index.js";
import UserItem from "../components/UserItem.jsx";
import UserModal from "../components/UserModal.jsx";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Загрузка пользователей при монтировании
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError("Ошибка загрузки. Убедитесь, что сервер запущен на порту 3000.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить пользователя?")) return;
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("Ошибка при удалении пользователя");
    }
  };

  const handleSave = async (userData) => {
    try {
      if (editingUser) {
        const updated = await api.updateUser(editingUser.id, userData);
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? updated : u))
        );
      } else {
        const created = await api.createUser(userData);
        setUsers((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      alert("Ошибка при сохранении пользователя");
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>👥 Управление пользователями</h1>
        <button className="btn-add" onClick={handleCreate}>
          + Добавить пользователя
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : users.length === 0 ? (
        <div className="empty">Пользователей пока нет. Создайте первого!</div>
      ) : (
        <div className="users-list">
          {users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <UserModal
          user={editingUser}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
