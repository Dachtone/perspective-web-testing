const bcrypt = require('bcryptjs');

module.exports = function(app) {
    /* ------- Middleware ------- */

    app.use((req, res, next) => {
        if (req.session && req.session.user) {
            connection.query('SELECT verified FROM users WHERE login = ?', [req.session.user.login], (err, results, fields) => {
                if (err)
                    console.log('An error has occured on middleware. ' + err.code + ': ' + err.sqlMessage);
    
                // Account has been destroyed
                if (results.length === 0) {
                    req.session.destroy((err) => {
                        res.clearCookie('sessionID');
                        return res.redirect('/');
                    });
                }
                else {
                    // Workaround for session disappearing while request is processing
                    if (req.session && req.session.user)
                        req.session.user.verified = results[0].verified;
                    
                    next();
                }
            });
        }
        else {
            next();
        }
    });

    /* -------- Routing -------- */

    app.get('/', (req, res) => {
        var messages = [];

        if (req.query.action === 'registered')
            messages.push('Регистрация прошла успешно!');
        else if (req.query.action === 'deleted_account')
            messages.push('Ваш аккаунт успешно удалён!');

        if (req.session && req.session.user)
        {
            if (!req.session.user.verified)
                messages.push('Ожидайте подтверждения Вашего аккаунта Администратором. Некоторые возможности отключены.');

            return res.render('home', { messages: messages, user: req.session.user });
        }

        return res.render('home', { messages: messages });
    });

    app.get('/profile', (req, res) => {
        if (!req.session.user)
            return res.redirect('/error');

        return res.render('profile', { user: req.session.user, profile: req.session.user });
    });

    app.get('/profile/:id', (req, res) => {
        if (!req.session.user)
            return res.redirect('/error');

        var messages = [];
        
        connection.query('SELECT id, login, name, type, verified, position FROM users WHERE id = ?', [req.params.id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /profile. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length === 0)
                return res.redirect('/error');

            var profile = { 
                id: results[0].id,
                login: results[0].login,
                name: results[0].name,
                type: results[0].type,
                verified: results[0].verified,
                position: results[0].position
            };

            return res.render('profile', { user: req.session.user, profile: profile });
        });
    });

    app.get('/admin', (req, res) => {
        if (!req.session.user || req.session.user.type != 3 || !req.session.user.verified)
            return res.redirect('/error');

        return res.render('admin', { user: req.session.user });
    });

    app.get('/admin/users', (req, res) => {
        if (!req.session.user || req.session.user.type != 3 || !req.session.user.verified)
            return res.redirect('/error');

        return res.redirect('/users');
    });

    app.get('/users', (req, res) => {
        if (!req.session.user)
            return res.redirect('/error');

        const admin = (req.session.user.type === 3 && req.session.user.verified) ? true : false;

        var messages = [];

        if (req.query.error) {
            if (req.query.error === 'no_user')
                messages.push('Ошибка: Пользователь не найден.');
            else if (req.query.error === 'admin')
                messages.push('Ошибка: Нельзя удалить Администратора.');
            else if (req.query.error === 'already_verified')
                messages.push('Ошибка: Пользователь уже подтверждён.');
        }
        else if (req.query.deleted)
            messages.push('Пользователь ' + req.query.deleted + ' успешно удалён.');
        else if (req.query.verified)
            messages.push('Пользователь ' + req.query.verified + ' успешно подтверждён.');

        const elements_per_page = 10;
        
        var page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page, 10);

            if (page < 1) {
                messages.push("Страница с введённым номером не существует.");
                page = 1;
            }
        }
        
        var pages_num = 1;
        connection.query('SELECT COUNT(*) FROM users', (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /users. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            pages_num = results[0]['COUNT(*)'] !== 0 ? Math.ceil(results[0]['COUNT(*)'] / elements_per_page) : 0;
        });

        var offset = (page - 1) * elements_per_page;
        connection.query('SELECT id, login, name, type, verified, position FROM users LIMIT ? OFFSET ?', [elements_per_page, offset], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /users. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            return res.render('users', { messages: messages, user: req.session.user, page: page, pages_num: pages_num, elements: results, admin: admin });
        });
    });

    app.get('/tests', (req, res) => {
        if (!req.session.user)
            return res.redirect('/error');

        const teacher = (req.session.user.type >= 2 && req.session.user.verified) ? true : false;

        var messages = [];

        if (req.query.error) {
            if (req.query.error === 'no_test')
                messages.push('Ошибка: Тема не найдена.');
        }
        else if (req.query.deleted)
            messages.push('Тест "' + decodeURIComponent(req.query.deleted) + '" успешно удалён.');
        else if (req.query.success)
            messages.push('Тест успешно создан.');

        const elements_per_page = 10;
        
        var page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page, 10);

            if (page < 1) {
                messages.push("Страница с введённым номером не существует.");
                page = 1;
            }
        }
        
        var pages_num = 1;
        connection.query('SELECT COUNT(*) FROM tests', (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /tests. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            pages_num = results[0]['COUNT(*)'] !== 0 ? Math.ceil(results[0]['COUNT(*)'] / elements_per_page) : 0;
        });

        var offset = (page - 1) * elements_per_page;
        connection.query('SELECT tests.id, tests.headline, topics.title, topics.subject, users.id AS author_id, users.name, tests.created + INTERVAL 3 HOUR AS created FROM tests LEFT JOIN topics ON tests.topic = topics.id LEFT JOIN users ON tests.author = users.id ORDER BY tests.id DESC LIMIT ? OFFSET ?', [elements_per_page, offset], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /topics. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            return res.render('tests', { messages: messages, user: req.session.user, page: page, pages_num: pages_num, elements: results, teacher: teacher });
        });
    });

    app.get('/test', (req, res) => {
        res.redirect('/tests');
    });

    app.post('/delete_test/:id', (req, res) => {
        if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
            return res.redirect('/error');

        connection.query('SELECT headline FROM tests WHERE id = ?', [req.params.id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /delete_test. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length === 0)
                return res.redirect('/tests?error=no_test');

            var headline = results[0].headline;

            connection.query('DELETE FROM tests WHERE id = ?', [req.params.id], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /delete_test. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }
    
                return res.redirect('/tests?deleted=' + encodeURIComponent(headline));
            });
        });
    });

    app.get('/topics', (req, res) => {
        if (!req.session.user)
            return res.redirect('/error');

        const teacher = (req.session.user.type >= 2 && req.session.user.verified) ? true : false;

        var messages = [];

        if (req.query.error) {
            if (req.query.error === 'no_topic')
                messages.push('Ошибка: Тема не найдена.');
        }
        else if (req.query.deleted)
            messages.push('Тема "' + decodeURIComponent(req.query.deleted) + '" успешно удалена.');
        else if (req.query.success)
            messages.push('Тема успешно создана.');

        const elements_per_page = 10;
        
        var page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page, 10);

            if (page < 1) {
                messages.push("Страница с введённым номером не существует.");
                page = 1;
            }
        }
        
        var pages_num = 1;
        connection.query('SELECT COUNT(*) FROM topics', (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /topics. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            pages_num = results[0]['COUNT(*)'] !== 0 ? Math.ceil(results[0]['COUNT(*)'] / elements_per_page) : 0;
        });

        var offset = (page - 1) * elements_per_page;
        connection.query('SELECT id, title, subject, semester FROM topics LIMIT ? OFFSET ?', [elements_per_page, offset], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /topics. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            return res.render('topics', { messages: messages, user: req.session.user, page: page, pages_num: pages_num, elements: results, teacher: teacher });
        });
    });

    app.post('/delete_topic/:id', (req, res) => {
        if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
            return res.redirect('/error');

        connection.query('SELECT title FROM topics WHERE id = ?', [req.params.id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /delete_topic. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length === 0)
                return res.redirect('/topics?error=no_topic');

            var title = results[0].title;

            connection.query('DELETE FROM topics WHERE id = ?; DELETE FROM tests WHERE topic = ?', [req.params.id, req.params.id], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /delete_topic. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }
    
                return res.redirect('/topics?deleted=' + encodeURIComponent(title));
            });
        });
    });

    app.get('/create_topic', (req, res) => {
        if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
            return res.redirect('/error');

        return res.render('create_topic', { user: req.session.user });
    });

    app.post('/create_topic', (req, res) => {
        if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
            return res.redirect('/error');

        var title = req.body.inputTitle;
        var subject = req.body.inputSubject;
        var semester = req.body.inputSemester;

        if (!title)
            return res.render('create_topic', { messages: ["Введите название темы."], user: req.session.user });
        title = escapeHTML(title);
        if (title.length < 3)
            return res.render('create_topic', { messages: ["Название темы не может быть короче 3 символов."], user: req.session.user });
        
        if (!subject)
            return res.render('create_topic', { messages: ["Введите название предмета."], user: req.session.user });
        if (!(/^[а-яА-Я\s]*$/.test(subject)))
            return res.render('create_topic', { messages: ["В названии предмета допустима только кириллица."], user: req.session.user });
        if (subject.length < 2)
            return res.render('create_topic', { messages: ["Название предмета не может быть короче 2 символов."], user: req.session.user });
        
        if (!semester)
            return res.render('create_topic', { messages: ["Выберите необходимый уровень подготовки."], user: req.session.user });
        semester = parseInt(semester, 10);
        if (semester === -1)
            return res.render('create_topic', { messages: ["Выберите необходимый уровень подготовки."], user: req.session.user });
        if (semester < 0)
            return res.render('create_topic', { messages: ["Неверный уровень подготовки."], user: req.session.user });

        connection.query('INSERT INTO topics (title, subject, semester) VALUES (?, ?, ?)', 
                        [title, subject, semester], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /create_topic. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            return res.redirect('/topics?success=true');
        });
    });

    app.post('/delete_account', (req, res) => {
        if (!req.session.user)
            return res.redirect('/error');

        connection.query('DELETE FROM users WHERE id = ?; DELETE FROM tests WHERE author = ?', [req.session.user.id, req.session.user.id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /delete_account. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            req.session.destroy((err) => {
                res.clearCookie('sessionID');
                return res.redirect("/?action=deleted_account");
            });
        });
    });

    app.post('/admin/delete_account/:id', (req, res) => {
        if (!req.session.user || req.session.user.type != 3 || !req.session.user.verified)
            return res.redirect('/error');

        connection.query('SELECT login, type, verified FROM users WHERE id = ?', [req.params.id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /admin/delete_account. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length === 0)
                return res.redirect('/admin/users?error=no_user');
            if (results[0].type === 3 && results[0].verified)
                return res.redirect('/admin/users?error=admin');

            var login = results[0].login;

            connection.query('DELETE FROM users WHERE id = ?; DELETE FROM tests WHERE author = ?', [req.params.id, req.params.id], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /admin/delete_account. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }
    
                return res.redirect('/admin/users?deleted=' + login);
            });
        });
    });

    app.post('/admin/verify_account/:id', (req, res) => {
        if (!req.session.user || req.session.user.type != 3 || !req.session.user.verified)
            return res.redirect('/error');

        connection.query('SELECT login, verified FROM users WHERE id = ?', [req.params.id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /admin/verify_account. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length === 0)
                return res.redirect('/admin/users?error=no_user');
            if (results[0].verified)
                return res.redirect('/admin/users?error=already_verified');

            var login = results[0].login;

            connection.query('UPDATE users SET verified = 1 WHERE id = ?', [req.params.id], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /admin/verify_account. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }
    
                return res.redirect('/admin/users?verified=' + login);
            });
        });
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

        connection.query('SELECT id, hash, name, type, verified, position FROM users WHERE login = ?', [login], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /login. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length === 0)
                return res.render('login', { messages: ["Аккаунт с введённым логином не существует."] });

            var user = { 
                id: results[0].id,
                login: login,
                hash: results[0].hash,
                name: results[0].name,
                type: results[0].type,
                verified: results[0].verified,
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
            return res.redirect('/error');
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
        if (login.length < 4)
            return res.render('register', { messages: ["Логин не может быть короче 4 символов."] });
        if (!(/^[a-zA-Z]+$/.test(login)))
            return res.render('register', { messages: ["Логин не должен содержать пробелов. Допустимы только латинские буквы."] });
        if (password.length < 4)
            return res.render('register', { messages: ["Пароль не может быть короче 4 символов."] });
        
        if (!name)
            return res.render('register', { messages: ["Введите ФИО."] });
        var parts = name.split(" ");
        if (parts.length !== 3)
            return res.render('register', { messages: ["Введите ФИО в формате \"Фамилия Имя Отчество\"."] });
        for (part of parts) {
            if (!(/^[а-яА-Я]+$/.test(part)) || part.charAt(0) == part.charAt(0).toLowerCase() || part.length < 2)
                return res.render('register', { messages: ["Введите ФИО в формате \"Фамилия Имя Отчество\"."] });
        }

        if (!type)
            return res.render('register', { messages: ["Выберите тип аккаунта."] });
        type = parseInt(type, 10);
        if (type === -1)
            return res.render('register', { messages: ["Выберите тип аккаунта."] });
        if (type < 0 || type > 3)
            return res.render('register', { messages: ["Неверный тип аккаунта."] });
        
        if (!position)
            return res.render('register', { messages: ["Введите ваш класс/должность."] });
        position = escapeHTML(position);

        var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

        connection.query('SELECT id FROM users WHERE login = ?', [login], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /register. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length !== 0)
                return res.render('register', { messages: ["Логин занят."] });

            var verified = type === 0 ? true : false;
            connection.query('INSERT INTO users (login, hash, name, type, verified, position) VALUES (?, ?, ?, ?, ?, ?)', 
                            [login, hash, name, type, verified, position], (err, results, fields) => {
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
                    verified: verified,
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

function escapeHTML(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, (m) => { return map[m]; });
}