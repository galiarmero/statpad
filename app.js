const express = require('express');
const app = express();
const authRoutes = require('./routes/auth-routes');
const db = require('./config/db');

db.init()

app.set('view engine', 'ejs');

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    if (req.user) {
        res.send("You are logged in")
    } else {
        res.render('home');
    }
});

app.listen(80, (err) => {
    console.log('Listening to port 80')
});