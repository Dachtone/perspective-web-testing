const bcrypt = require('bcryptjs');

module.exports = function(app) {
    /* -------- Routing -------- */

    app.get('/', (req, res) => {
        var message = req.query.action === 'registered' ? 'Регистрация прошла успешно!\n' : '';
        if (req.session.user) {
            return res.render('home', { message: message + 'Вы вошли как ' + req.session.user.login });
        }
        return res.render('home');
    });
    
    app.get('/login', (req, res) => {
        if (req.session.user)
            return res.redirect('/');

        return res.render('login');
    });

    app.post('/login', (req, res) => {
        if (req.session.user)
            return res.redirect('/');

        var login = req.body.inputLogin;
        var password = req.body.inputPassword;

        if (!login || !password)
            return res.render('login', { messages: ["Введите логин и пароль."] });

        connection.query('SELECT id, hash, name, type, position FROM users WHERE login = ?', [login], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /login. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length === 0)
                return res.render('login', { messages: ["Данного логина не существует."] });

            var user = { 
                id: results[0].id,
                login: login,
                hash: results[0].hash,
                name: results[0].name,
                type: results[0].type,
                position: results[0].position
            };

            if (!bcrypt.compareSync(password, user.hash))
                return res.render('login', { messages: ["Неверный пароль."] });

            req.session.user = user;
            return res.redirect('/');
        });
    });

    app.post('/logout', (req, res) => {
        if (req.session.user) {
            req.session.destroy((err) => {
                res.clearCookie('sessionID');
                return res.redirect("/");
            });
        }
        else {
            return res.status(401).send('Unauthorized');
        }
    });

    app.get('/register', (req, res) => {
        if (req.session.user)
            return res.redirect('/');

        return res.render('register');
    });

    app.post('/register', (req, res) => {
        if (req.session.user)
            return res.redirect('/');

        var login = req.body.inputLogin;
        var password = req.body.inputPassword;
        var name = req.body.inputName;
        var type = req.body.inputType;
        var position = req.body.inputPosition;

        if (!login || !password)
            return res.render('register', { messages: ["Введите логин и пароль."] });
        if (password.length < 4)
            return res.render('register', { messages: ["Пароль не может быть короче 4 символов."] });
        
        if (!name)
            return res.render('register', { messages: ["Введите ФИО."] });
        var parts = name.split(" ");
        if (parts.length !== 3)
            return res.render('register', { messages: ["Введите ФИО в формате \"Фамилия Имя Отчество\"."] });
        for (part of parts) {
            if (!(/^[а-яА-Я]+$/.test(part)) || part.charAt(0) == part.charAt(0).toLowerCase())
                return res.render('register', { messages: ["Введите ФИО в формате \"Фамилия Имя Отчество\"."] });
        }

        if (!type)
            return res.render('register', { messages: ["Введите тип аккаунта."] });
        type = parseInt(type, 10);
        if (type < 0 || type > 3)
            return res.render('register', { messages: ["Неверный тип аккаунта."] });
        
        if (!position)
            return res.render('register', { messages: ["Введите ваш класс/должность."] });

        var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

        connection.query('SELECT id FROM users WHERE login = ?', [login], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /register. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length !== 0)
                return res.render('register', { message: "Логин занят." });

            connection.query('INSERT INTO users (login, hash, name, type, position) VALUES (?, ?, ?, ?, ?)', 
                            [login, hash, name, type, position], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /register. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }

                var user = { 
                    id: results.insertId,
                    login: login,
                    hash: hash,
                    name: name,
                    type: type,
                    position: position
                };
                req.session.user = user;
                return res.redirect('/?action=registered');
            });
        });
    });

    app.get('*', (req, res) => {
        return res.render('error');
    });
};