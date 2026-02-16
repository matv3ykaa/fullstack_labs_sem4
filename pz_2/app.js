const express = require('express');
const app = express();
const port = 3000;

// Исходный список товаров
let products = [
    { id: 1, name: 'Смартфон', price: 24990 },
    { id: 2, name: 'Ноутбук', price: 59990 },
    { id: 3, name: 'Наушники', price: 5990 }
];

// Парсинг json в теле запроса
app.use(express.json());

// Главная страница
app.get('/', (req, res) => {
    res.send('API для управления товарами');
});

// Получение всех товаров
app.get('/products', (req, res) => {
    res.json(products);
});

// Получение товара по id
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }
    
    res.json(product);
});

// Создание нового товара
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    
    // Проверка обязательных полей
    if (!name || price === undefined) {
        return res.status(400).json({ message: 'Необходимо указать название и стоимость' });
    }
    
    const newProduct = {
        id: Date.now(),
        name,
        price
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Обновление полей товара
app.patch('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }
    
    const { name, price } = req.body;
    
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    
    res.json(product);
});

// Удаление товара по id
app.delete('/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id == req.params.id);
    
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Товар не найден' });
    }
    
    products.splice(productIndex, 1);
    res.json({ message: 'Товар успешно удален' });
});

// Обработчик ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});