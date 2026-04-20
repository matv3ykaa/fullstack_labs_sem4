const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());

const sequelize = new Sequelize('postgresql://postgres:password@localhost:5432/pz19', {
  dialect: 'postgres',
  logging: false
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

sequelize.sync({ alter: true })
  .then(() => console.log('База данных синхронизирована'))
  .catch(err => console.error('Ошибка подключения к БД:', err));


app.post('/api/users', async (req, res) => {
    try {
        const { first_name, last_name, age } = req.body;
        const user = await User.create({ first_name, last_name, age });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.patch('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        await user.update(req.body);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.delete('/api/users/:id', async (req, res) => {
    try {
        const deleted = await User.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'Пользователь не найден' });
        res.json({ message: 'Пользователь успешно удален' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});