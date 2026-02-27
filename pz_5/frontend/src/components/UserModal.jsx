import { useState, useEffect } from "react";

export default function UserModal({ user, onSave, onClose }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAge(user.age);
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || age === "") return;
    onSave({ name: name.trim(), age: Number(age) });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{user ? "Редактировать пользователя" : "Добавить пользователя"}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Имя:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите имя"
              required
            />
          </label>
          <label>
            Возраст:
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Введите возраст"
              min="0"
              max="150"
              required
            />
          </label>
          <div className="modal-buttons">
            <button type="submit" className="btn-save">
              {user ? "Сохранить" : "Создать"}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
