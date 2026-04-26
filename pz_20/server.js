require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('MONGODB_URI не задан в .env');
  process.exit(1);
}

app.use(express.json());

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true, trim: true, maxlength: 100 },
  last_name: { type: String, required: true, trim: true, maxlength: 100 },
  age: { type: Number, required: true, min: 0, max: 150, integer: true },
  created_at: { type: Number, required: true },
  updated_at: { type: Number, required: true }
});

userSchema.pre('save', function(next) {
  const now = Math.floor(Date.now() / 1000);
  if (this.isNew) this.created_at = now;
  this.updated_at = now;
  next();
});

const User = mongoose.model('User', userSchema);


app.post('/api/users', async (req, res) => {
  try {
    const { first_name, last_name, age } = req.body;

    if (!first_name || !last_name || age === undefined) {
      return res.status(400).json({ error: 'Required fields missing: first_name, last_name, age' });
    }
    if (typeof first_name !== 'string' || first_name.trim() === '') {
      return res.status(400).json({ error: 'first_name must be non-empty string' });
    }
    if (typeof last_name !== 'string' || last_name.trim() === '') {
      return res.status(400).json({ error: 'last_name must be non-empty string' });
    }
    if (!Number.isInteger(age) || age < 0 || age > 150) {
      return res.status(400).json({ error: 'age must be integer between 0 and 150' });
    }

    const user = new User({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      age
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error('CREATE error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (err) {
    console.error('READ ALL error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('READ ONE error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, age } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    if (first_name !== undefined) {
      if (typeof first_name !== 'string' || first_name.trim() === '') {
        return res.status(400).json({ error: 'first_name must be non-empty string' });
      }
    }
    if (last_name !== undefined) {
      if (typeof last_name !== 'string' || last_name.trim() === '') {
        return res.status(400).json({ error: 'last_name must be non-empty string' });
      }
    }
    if (age !== undefined) {
      if (!Number.isInteger(age) || age < 0 || age > 150) {
        return res.status(400).json({ error: 'age must be integer between 0 and 150' });
      }
    }

    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name.trim();
    if (last_name !== undefined) updateData.last_name = last_name.trim();
    if (age !== undefined) updateData.age = age;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true, lean: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('UPDATE error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await User.findByIdAndDelete(id).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', user });
  } catch (err) {
    console.error('DELETE error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Успешное подключение к MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Mongo API: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Ошибка подключения к MongoDB:', err);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  console.error('Неизвестная ошибка:', err.message);
  process.exit(1);
});