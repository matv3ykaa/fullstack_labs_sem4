const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

const ACCESS_SECRET = 'access_secret';
const REFRESH_SECRET = 'refresh_secret';

const ACCESS_EXPIRES_IN = '0.1m';
const REFRESH_EXPIRES_IN = '7d';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API AUTH + PRODUCTS + RBAC',
      version: '1.0.0',
      description: 'Практическое задание 11',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Локальный сервер',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

// { id, email, first_name, last_name, password, role, blocked }
let users = [];
let products = [
  {
    id: nanoid(),
    title: 'MacBook Pro M5',
    category: 'Ноутбуки',
    description: 'Ноутбук Apple с чипом M5, 16 ГБ unified memory, дисплей Liquid Retina XDR 14.2", до 24 часов автономной работы.',
    price: 229990,
    image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp14-spaceblack-select-202410?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1728916322974',
  },
  {
    id: nanoid(),
    title: 'Видеокарта RTX 5080',
    category: 'Комплектующие',
    description: 'NVIDIA GeForce RTX 5080, 16 ГБ GDDR7, архитектура Blackwell, поддержка DLSS 4 и трассировки лучей нового поколения.',
    price: 119990,
    image: 'https://hyperpc.ru/images/product/choice-pc/main-content/gpu/nvidia-geforce-rtx-5080-page-mobile-banner.jpg',
  },
  {
    id: nanoid(),
    title: 'iPhone 17 Pro',
    category: 'Смартфоны',
    description: 'Смартфон Apple с чипом A19 Pro, камерой 48 МП с перископным объективом, titanium корпусом и дисплеем ProMotion 120 Гц.',
    price: 139990,
    image: 'https://niceapplespb.ru/wp-content/uploads/2025/09/17proCosmicOrange.webp',
  },
  {
    id: nanoid(),
    title: 'Микрофон Shure SM7B',
    category: 'Аудио',
    description: 'Динамический кардиоидный микрофон для вокала, подкастов и стриминга. Встроенный фильтр высоких частот и поп-фильтр.',
    price: 34990,
    image: 'https://doctorhead.ru/upload/dev2fun.imagecompress/webp/iblock/224/5u6w9apc3qir3rbvv5edqusnva7kjfap/shure_SM7dB_1.webp',
  },
  {
    id: nanoid(),
    title: 'Геймпад DualSense',
    category: 'Игровые аксессуары',
    description: 'Беспроводной контроллер PlayStation 5 с адаптивными триггерами, тактильной обратной связью и встроенным микрофоном.',
    price: 7990,
    image: 'https://gmedia.playstation.com/is/image/SIEPDC/dualsense-controller-product-thumbnail-01-en-14sep21',
  },
  {
    id: nanoid(),
    title: 'Мышь Logitech G Pro X Superlight 2',
    category: 'Периферия',
    description: 'Ультралёгкая беспроводная игровая мышь весом 60 г, сенсор HERO 2 с точностью 32 000 DPI, автономность до 95 часов.',
    price: 14990,
    image: 'https://www.mvideo.ru/Big/50176251bb.jpg',
  },
];

const refreshTokens = new Set();

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

function findUserOr404(email, res) {
  const user = users.find(u => u.email === email);
  if (!user) {
    res.status(404).json({ error: 'user not found' });
    return null;
  }
  return user;
}

function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'product not found' });
    return null;
  }
  return product;
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ivan@mail.ru
 *               first_name:
 *                 type: string
 *                 example: Ivan
 *               last_name:
 *                 type: string
 *                 example: Ivanov
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *       400:
 *         description: Некорректные данные
 */
app.post('/api/auth/register', async (req, res) => {
  const { email, first_name, last_name, password } = req.body;

  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ error: 'email, first_name, last_name and password are required' });
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'user with this email already exists' });
  }

  const newUser = {
    id: nanoid(),
    email,
    first_name,
    last_name,
    password: await hashPassword(password),
    role: 'user', // роль назначает только админ через PUT /api/users/:id
    blocked: false,
  };

  users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ivan@mail.ru
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       200:
 *         description: Возвращает accessToken
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 *       403:
 *         description: Пользователь заблокирован
 *       404:
 *         description: Пользователь не найден
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = findUserOr404(email, res);
  if (!user) return;

  if (user.blocked) {
    return res.status(403).json({ error: 'User is blocked' });
  }

  const isAuthenticated = await verifyPassword(password, user.password);
  if (!isAuthenticated) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  refreshTokens.add(refreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ accessToken });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление пары токенов
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Возвращает новый accessToken
 *       400:
 *         description: refreshToken не передан
 *       401:
 *         description: Невалидный или истёкший refresh-токен
 */
app.post('/api/auth/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find(u => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    refreshTokens.delete(refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.add(newRefreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Объект текущего пользователя
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Пользователь не найден
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав
 */
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const list = users.map(({ password: _, ...u }) => u);
  res.status(200).json(list);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь найден
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Пользователь не найден
 */
app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить информацию пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Пользователь обновлён
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Пользователь не найден
 */
app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  const { first_name, last_name, role, blocked } = req.body;
  const allowedRoles = ['user', 'seller', 'admin'];

  if (first_name !== undefined) user.first_name = first_name;
  if (last_name !== undefined) user.last_name = last_name;
  if (role !== undefined && allowedRoles.includes(role)) user.role = role;
  if (blocked !== undefined) user.blocked = Boolean(blocked);

  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Пользователь не найден
 */
app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  if (req.params.id === req.user.sub) {
    return res.status(403).json({ error: 'cannot block yourself' });
  }
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }
  user.blocked = true;
  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Товар создан
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав
 */
app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const { title, category, description, price, image } = req.body;

  if (!title || !category || !description || price === undefined) {
    return res.status(400).json({ error: 'title, category, description and price are required' });
  }

  const newProduct = {
    id: nanoid(),
    title,
    category,
    description,
    price: Number(price),
    image: image || null,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список товаров
 *       401:
 *         description: Не авторизован
 */
app.get('/api/products', authMiddleware, (req, res) => {
  res.status(200).json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по id
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар найден
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', authMiddleware, (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.status(200).json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить параметры товара
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Товар не найден
 */
app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  const { title, category, description, price, image } = req.body;

  if (title !== undefined) product.title = title;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (image !== undefined) product.image = image;

  res.status(200).json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  products = products.filter(p => p.id !== req.params.id);
  res.status(200).json({ deleted: true });
});

app.listen(port, async () => {
  // дефолтный админ при первом запуске
  const adminEmail = 'admin@shop.ru';
  if (!users.find(u => u.email === adminEmail)) {
    users.push({
      id: nanoid(),
      email: adminEmail,
      first_name: 'Admin',
      last_name: '',
      password: await hashPassword('admin123'),
      role: 'admin',
      blocked: false,
    });
    console.log(`Создан дефолтный админ: ${adminEmail} / admin123`);
  }
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});
