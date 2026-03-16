import { useState, useEffect } from 'react';
import { usersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import UserEditModal from '../components/UserEditModal';

const ROLE_LABELS = {
  user: 'пользователь',
  seller: 'продавец',
  admin: 'администратор',
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    usersApi.getAll()
      .then((res) => setList(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleBlock = async (id) => {
    if (!window.confirm('заблокировать пользователя?')) return;
    const res = await usersApi.block(id);
    setList((prev) => prev.map(u => u.id === id ? res.data : u));
  };

  const handleUnblock = async (id) => {
    const res = await usersApi.update(id, { blocked: false });
    setList((prev) => prev.map(u => u.id === id ? res.data : u));
  };

  const handleSave = (updated) => {
    setList((prev) => prev.map(u => u.id === updated.id ? updated : u));
    setEditUser(null);
  };

  if (loading) return <div className="loading">загрузка...</div>;

  return (
    <div className="layout">
      <Navbar />
      <main className="main">
        <div className="page-header">
          <div className="page-title">пользователи <span>{list.length} шт</span></div>
        </div>

        {list.length === 0 ? (
          <div className="empty-state">пользователей пока нет</div>
        ) : (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>имя</th>
                  <th>email</th>
                  <th>роль</th>
                  <th>статус</th>
                  <th>действия</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className={u.blocked ? 'row-blocked' : ''}>
                      <td>{u.first_name} {u.last_name}</td>
                      <td className="cell-mono">{u.email}</td>
                      <td>
                        <span className={`role-badge role-${u.role}`}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td>
                        {u.blocked
                          ? <span className="status-blocked">заблокирован</span>
                          : <span className="status-active">активен</span>
                        }
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-ghost"
                            onClick={() => setEditUser(u)}
                          >
                            изменить
                          </button>
                          {u.blocked ? (
                            <button
                              className="btn btn-accent-outline"
                              onClick={() => handleUnblock(u.id)}
                            >
                              разблокировать
                            </button>
                          ) : (
                            <button
                              className="btn btn-danger"
                              onClick={() => handleBlock(u.id)}
                              disabled={isSelf}
                              title={isSelf ? 'нельзя заблокировать себя' : ''}
                            >
                              заблокировать
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {editUser && (
        <UserEditModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSave} />
      )}
    </div>
  );
}