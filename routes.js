const bcrypt = require('bcryptjs');

module.exports = function(app) {

    /* -------- Middleware -------- */

    app.use((req, res, next) => {
        // Redirect the user if there is no connection to the DataBase
        if (connection.state === 'disconnected') {
            return res.render('error', { culprit: 'db' });
        }

        // If there are multiple parameters with the same name
        // in a GET request, degrade the array into a single value
        if (req.method === 'GET' && req.query) {
            for (key in req.query) {
                if (Array.isArray(req.query.key))
                    req.query.key = req.query.key[0];
            }
        }

        if (req.session && req.session.user) {
            connection.query('SELECT verified FROM users WHERE login = ?', [req.session.user.login], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on middleware. ' + err.code + ': ' + err.sqlMessage);
                    res.redirect('/error');
                }
    
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

    /* +------+ Home +------+ */

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

    /* +------+ Profile +------+ */

    app.get('/profile', (req, res) => {
        if (!req.session.user)
            return res.redirect('/error');

        return res.render('profile', { user: req.session.user, profile: req.session.user });
    });

    app.get('/profile/:id', (req, res) => {
        if (!req.session.user)
            return res.redirect('/error');

        var messages = [];
        
        connection.query('SELECT id, login, name, type, verified, position FROM users WHERE id = ?',
                        [req.params.id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /profile. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length === 0)
                return res.redirect('/error');
            
            return res.render('profile', { user: req.session.user, profile: results[0] });
        });
    });

    app.post('/delete_account', (req, res) => {
        if (!req.session.user)
            return res.redirect('/error');

        var id = req.session.user.id;
        connection.query(`DELETE FROM users WHERE id = ?; 
                          DELETE FROM tests_completion WHERE user = ?; 
                          DELETE FROM answers WHERE test IN (SELECT id FROM tests WHERE author = ?) OR user = ?; 
                          DELETE FROM questions WHERE test IN (SELECT id FROM tests WHERE author = ?); 
                          DELETE FROM tests WHERE author = ?`,
                        [id, id, id, id], (err, results, fields) => {
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

    /* +------+ Admin +------+ */

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

    app.post('/admin/delete_account/:id', (req, res) => {
        if (!req.session.user || req.session.user.type != 3 || !req.session.user.verified)
            return res.redirect('/error');

        connection.query('SELECT login, type, verified FROM users WHERE id = ?', [req.params.id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /admin/delete_account. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length === 0)
                return res.redirect('/users?error=no_user');
            if (results[0].type === 3 && results[0].verified)
                return res.redirect('/users?error=admin');

            var login = results[0].login;
            var id = req.params.id;

            connection.query(`DELETE FROM users WHERE id = ?; 
                              DELETE FROM tests_completion WHERE user = ?; 
                              DELETE FROM answers WHERE test IN (SELECT id FROM tests WHERE author = ?) OR user = ?; 
                              DELETE FROM questions WHERE test IN (SELECT id FROM tests WHERE author = ?); 
                              DELETE FROM tests WHERE author = ?`,
                            [id, id, id, id, id, id], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /delete_user. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }

                return res.redirect('/users?deleted=' + login);
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
                return res.redirect('/users?error=no_user');
            if (results[0].verified)
                return res.redirect('/users?error=already_verified');

            var login = results[0].login;

            connection.query('UPDATE users SET verified = 1 WHERE id = ?', [req.params.id], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /verify_account. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }
    
                return res.redirect('/users?verified=' + login);
            });
        });
    });

    /* +------+ Users +------+ */

    app.get('/users', (req, res) => {
        if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
            return res.redirect('/error');
        
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

            if (page === NaN || page < 1) {
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

            var offset = (page - 1) * elements_per_page;
            connection.query('SELECT id, login, name, type, verified, position FROM users LIMIT ? OFFSET ?',
                            [elements_per_page, offset], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /users. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }
    
                return res.render('users', {
                    messages: messages, user: req.session.user, page: page,
                    pages_num: pages_num, elements: results
                });
            });
        });
    });

    /* +------+ Tests +------+ */

    app.get('/test/:id', (req, res) => {
        if (!req.session.user || !req.session.user.verified)
            return res.redirect('/error');

        const test_id = req.params.id;

        var messages = [];

        if (req.query.completed)
            messages.push("Тест пройдён. Можете ознакомиться с правильными ответами:");

        connection.query(`SELECT tests.headline, topics.title, topics.subject, topics.semester, users.id AS author_id, 
                          users.name, tests_completion.mark, tests.created + INTERVAL 3 HOUR AS created 
                          FROM tests LEFT JOIN topics ON tests.topic = topics.id LEFT JOIN users ON tests.author = users.id 
                          LEFT JOIN tests_completion ON tests.id = tests_completion.test AND tests_completion.user = ? 
                          WHERE tests.id = ?`,
                        [req.session.user.id, test_id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /test. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length === 0)
                return res.redirect('/error');
            
            var info = {
                id: test_id,
                headline: results[0].headline,
                topic: {
                    title: results[0].title,
                    subject: results[0].subject
                }, 
                author: {
                    id: results[0].author_id,
                    name: results[0].name
                },
                semester: results[0].semester,
                completed: results[0].mark !== null ? true : false,
                mark: results[0].mark,
                created: results[0].created
            };

            connection.query(`SELECT questions.id, questions.body, questions.answer AS correct_answer, questions.points 
                              FROM questions WHERE test = ?`,
                            [test_id], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /test. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }

                if (results.length === 0)
                    return res.redirect('/error');

                var questions = results;
                if (!info.completed) {
                    questions.forEach((question) => {
                        delete question["correct_answer"];
                    });

                    return res.render('test', {
                        messages: messages, user: req.session.user, info: info, questions: questions
                    });
                }

                connection.query(`SELECT question, answer, correct FROM answers WHERE test = ? AND user = ? 
                                  ORDER BY question ASC`,
                                [test_id, req.session.user.id], (err, results, fields) => {
                    if (err) {
                        console.log('An error has occured on /test. ' + err.code + ': ' + err.sqlMessage);
                        return res.redirect('/error');
                    }

                    var index = 0;
                    for (var i = 0; i < questions.length; i++) {
                        if (index >= results.length) {
                            questions[i].filled = false;
                            continue;
                        }

                        if (results[index].question - 1 === i) {
                            questions[i].filled = true;
                            questions[i].answer = results[index].answer;
                            questions[i].correct = results[index].correct;
                            index++;
                        }
                        else {
                            questions[i].filled = false;
                        }
                    }

                    return res.render('test', {
                        messages: messages, user: req.session.user, info: info, questions: questions
                    });
                });
            });
        });
    });

    app.get('/test', (req, res) => {
        res.redirect('/tests');
    });

    app.get('/tests', (req, res) => {
        if (!req.session.user)
            return res.redirect('/error');
        
        var messages = [];

        if (req.query.error) {
            if (req.query.error === 'no_test')
                messages.push('Ошибка: Тема не найдена.');
        }
        else if (req.query.deleted)
            messages.push('Тест "' + decodeURIComponent(req.query.deleted) + '" успешно удалён.');
        else if (req.query.success)
            messages.push('Тест успешно создан.');
        
        var invalidField = false;
        var search = { set: false, sql: ' WHERE' };
        if (req.query.headline) {
            var headline = req.query.headline.trim();
            if (headline.length < 4 || headline.length > 128) {
                messages.push('Заголовок теста должен содержать в себе не менее 4 и не более 128 символов.');
                invalidField = true;
            }
            else {
                search.headline = headline;
                search.sql += ' tests.headline = ' + connection.escape(headline);
                search.set = true;
            }
        }
        if (!invalidField && req.query.subject) {
            var subject = req.query.subject.trim();
            if (subject.length < 2 || subject.length > 128) {
                messages.push('Название предмета должно содержать в себе не менее 2 и не более 128 символов.');
                invalidField = true;
            }
            else {
                search.subject = subject;
                search.sql += (search.set ? ' AND' : '') +
                    ' tests.topic IN (SELECT topics.id FROM topics WHERE topics.subject = ' +
                    connection.escape(subject) + ')';
                search.set = true;
            }
        }
        if (!invalidField && req.query.topic) {
            var topic = parseInt(req.query.topic, 10);
            if (topic === NaN || topic < 0) {
                messages.push('Данной темы не существует.');
                invalidField = true;
            }
            else {
                search.topic = topic;
                search.sql += (search.set ? ' AND' : '') + ' tests.topic = ' + topic;
                search.set = true;
            }
        }
        if (!invalidField && req.query.semester) {
            var semester = parseInt(req.query.semester, 10);
            if (semester === NaN || semester < 0 || semester > 23) {
                messages.push('Данного уровня подготовки не существует.');
                invalidField = true;
            }
            else {
                search.semester = semester;
                search.sql += (search.set ? ' AND' : '') +
                    ' tests.topic IN (SELECT topics.id FROM topics WHERE topics.semester = ' +
                    semester + ')';
                search.set = true;
            }
        }
        if (!invalidField && req.query.author) {
            var author = parseInt(req.query.author, 10);
            if (author === NaN || author < 0) {
                messages.push('Данного преподавателя не существует.');
                invalidField = true;
            }
            else {
                search.author = author;
                search.sql += (search.set ? ' AND' : '') + ' tests.author = ' + author;
                search.set = true;
            }
        }

        if (!invalidField && req.query.completed) {
            var completed = parseInt(req.query.completed, 10);
            if (completed === NaN || (completed !== 0 && completed !== 1)) {
                messages.push('Тест может быть либо пройден, либо нет.');
                invalidField = true;
            }
            else {
                search.completed = completed;
                search.sql += (search.set ? ' AND' : '') +
                    ' tests.id ' + (completed === 0 ? 'NOT ' : '') +
                    'IN (SELECT tests_completion.test FROM tests_completion WHERE tests_completion.user = ' +
                    req.session.user.id + ')';
                search.set = true;
            }
        }

        const elements_per_page = 10;
        
        var page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page, 10);

            if (page === NaN || page < 1) {
                messages.push("Страница с введённым номером не существует.");
                page = 1;
            }
        }
        
        var pages_num = 1;
        connection.query('SELECT NULL FROM tests' + (search.set ? search.sql : ''), (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /tests. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            pages_num = results.length !== 0 ? Math.ceil(results.length / elements_per_page) : 0;

            var offset = (page - 1) * elements_per_page;
            connection.query(`SELECT tests.id, tests.headline, topics.title, topics.subject, topics.semester, 
                              users.id AS author_id, users.name, tests_completion.user AS completed, tests_completion.mark, 
                              tests.created + INTERVAL 3 HOUR AS created FROM tests 
                              LEFT JOIN topics ON tests.topic = topics.id LEFT JOIN users ON tests.author = users.id 
                              LEFT JOIN tests_completion ON tests_completion.test = tests.id AND tests_completion.user = ? ` +
                              (search.set ? search.sql : '') + ` ORDER BY tests.id DESC LIMIT ? OFFSET ?`,
                            [req.session.user.id, elements_per_page, offset], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /tests. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }

                var elements = results;

                connection.query('SELECT id, title FROM topics', (err, results, fields) => {
                    if (err) {
                        console.log('An error has occured on /tests. ' + err.code + ': ' + err.sqlMessage);
                        return res.redirect('/error');
                    }

                    var topics = results;

                    connection.query('SELECT id, name FROM users WHERE type = 2', (err, results, fields) => {
                        if (err) {
                            console.log('An error has occured on /tests. ' + err.code + ': ' + err.sqlMessage);
                            return res.redirect('/error');
                        }

                        return res.render('tests', {
                            messages: messages, user: req.session.user, page: page,
                            pages_num: pages_num, elements: elements, topics: topics,
                            teachers: results, search: search
                        });
                    });
                });
            });
        });
    });

    app.post('/send_test/:id', (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        if (!req.session.user || !req.session.user.verified || req.session.user.type !== 1)
            return res.json({ success: false, error: 'Нет доступа' });

        var id = req.params.id;
        
        connection.query('SELECT NULL FROM tests WHERE id = ?', [id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /send_test. ' + err.code + ': ' + err.sqlMessage);
                return res.json({ success: false, error: 'Ошибка Базы Данных' });
            }

            if (results.length === 0)
                return res.json({ success: false, error: 'Данный тест не существует' });

            connection.query('SELECT NULL FROM tests_completion WHERE user = ? AND test = ?',
                            [req.session.user.id, id], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /send_test. ' + err.code + ': ' + err.sqlMessage);
                    return res.json({ success: false, error: 'Ошибка Базы Данных' });
                }

                const completed = results.length !== 0 ? true : false;
                if (completed)
                    return res.json({ success: false, error: 'Вы уже прошли этот тест' });

                connection.query('SELECT id, answer, points FROM questions WHERE test = ? ORDER BY id ASC',
                                [id], (err, results, fields) => {
                    if (err) {
                        console.log('An error has occured on /send_test. ' + err.code + ': ' + err.sqlMessage);
                        return res.json({ success: false, error: 'Ошибка Базы Данных' });
                    }

                    if (results.length === 0)
                        return res.json({ success: false, error: 'Правильный ответ отсутствует' });
                    
                    var data = req.body.data;
                    
                    var points_max = 0;
                    var points = 0;

                    var abort = false;
                    results.forEach((question, index) => {
                        if (abort)
                            return;

                        points_max += question.points;

                        if (index < data.length) {
                            if (data[index].answer.length > 128) {
                                abort = true;
                                return res.json({ success: false, error: 'Ответы не могут быть длиннее 128 символов' });
                            }

                            data[index].correct_answer = question.answer;
                            data[index].correct = (question.answer.trim().toLowerCase() === data[index].answer.trim().toLowerCase())
                                ? 1 : 0;
                            if (data[index].correct === 1)
                                points += question.points;
                        }
                    });
                    
                    if (abort)
                        return;

                    var percent = Math.round(points / points_max * 100);
                    var mark = 'См.'; // Default value if no mark matches the percentage
                    var found = false;
                    config.marks.forEach((grade) => {
                        if (found)
                            return;

                        if (percent >= grade.percent) {
                            mark = grade.mark;
                            found = true;
                        }
                    });

                    connection.query('INSERT INTO tests_completion (user, test, mark) VALUES (?, ?, ?)',
                                    [req.session.user.id, id, mark], (err, results, fields) => {
                        if (err) {
                            console.log('An error has occured on /send_test. ' + err.code + ': ' + err.sqlMessage);
                            return res.json({ success: false, error: 'Ошибка Базы Данных' });
                        }

                        abort = false;
                        var finished = 0;
                        data.forEach((question, index) => {
                            if (abort)
                                return;

                            if (!question.filled) {
                                finished++;
                                return;
                            }

                            connection.query('INSERT INTO answers (test, question, user, answer, correct) VALUES (?, ?, ?, ?, ?)',
                                            [id, index + 1, req.session.user.id, question.answer, question.correct],
                                            (err, results, fields) => {
                                if (err) {
                                    console.log('An error has occured on /send_test. ' + err.code + ': ' + err.sqlMessage);
                                    abort = true;
                                    return;
                                }

                                finished++;
                                if (finished === data.length && !abort)
                                    return res.json({ success: true });
                            });
                        });

                        if (abort)
                            return res.json({ success: false, error: 'Ошибка Базы Данных' });
                    });
                });
            });
        });
    });

    app.get('/create_test', (req, res) => {
    if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
        return res.redirect('/error');
        
        connection.query('SELECT id, title FROM topics', (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /create_test. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            return res.render('create_test', { user: req.session.user, topics: results });
        });
    });

    app.post('/create_test', (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
            return res.json({ success: false, error: 'Нет доступа' });
        
        var data = req.body;
        
        var headline = data.head.headline.trim();
        if (!headline)
            return res.json({ success: false, error: 'Заголовок должен быть заполнен' });
        if (headline.length < 4)
            return res.json({ success: false, error: 'Заголовок не может быть короче 4 символов' });
        if (headline.length > 128)
            return res.json({ success: false, error: 'Заголовок не может быть длиннее 128 символов' });
        
        var topic = data.head.topic;
        topic = parseInt(topic, 10);
        if (topic === NaN || topic === -1)
            return res.json({ success: false, error: 'Выберите тему' });
        
        connection.query('SELECT NULL FROM tests WHERE headline = ? AND topic = ?', [headline, topic], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on PUT /create_test. ' + err.code + ': ' + err.sqlMessage);
                return res.json({ success: false, error: 'Ошибка Базы Данных при проверке темы' });
            }

            if (results.length !== 0) {
                return res.json({
                    success: false,
                    error: 'Тест с данным заголовком и выбранной темой уже существует'
                });
            }
        
            connection.query('SELECT NULL FROM topics WHERE id = ?', [topic], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on PUT /create_test. ' + err.code + ': ' + err.sqlMessage);
                    return res.json({ success: false, error: 'Ошибка Базы Данных при проверке темы' });
                }

                if (results.length === 0)
                    return res.json({ success: false, error: 'Выбранная тема не существует' });

                var abort = false;
                var response = {};
                data.questions.forEach((question) => {
                    if (abort)
                        return;

                    if (!question.body) {
                        response = { success: false, error: 'Пустые вопросы запрещены' };
                        abort = true;
                        return;
                    }
                    if (question.body.length < 3) {
                        response = { success: false, error: 'Вопрос не может быть короче 3 символов' };
                        abort = true;
                        return;
                    }
                    if (question.body.length > 1024) {
                        response = { success: false, error: 'Вопрос не может быть длиннее 1024 символов' };
                        abort = true;
                        return;
                    }
                    
                    if (!question.answer) {
                        response = { success: false, error: 'У вопроса должен быть правильный ответ' };
                        abort = true;
                        return;
                    }
                    question.answer = question.answer.trim();
                    if (question.answer.length < 1) {
                        response = { success: false, error: 'У вопроса должен быть правильный ответ' };
                        abort = true;
                        return;
                    }
                    if (question.answer.length > 128) {
                        response = { success: false, error: 'Ответ не может быть длиннее 128 символов' };
                        abort = true;
                        return;
                    }

                    if (!question.points) {
                        response = { success: false, error: 'Каждый вопрос должен давать как минимум один балл' };
                        abort = true;
                        return;
                    }
                    question.points = parseInt(question.points, 10);
                    if (question.points === NaN || question.points < 1) {
                        response = { success: false, error: 'Каждый вопрос должен давать как минимум один балл' };
                        abort = true;
                        return;
                    }
                });

                if (abort)
                    return res.json(response);

                connection.query('INSERT INTO tests (headline, topic, author) VALUES (?, ?, ?)',
                                [headline, topic, req.session.user.id], (err, results, fields) => {
                    if (err) {
                        console.log('An error has occured on PUT /create_test. ' + err.code + ': ' + err.sqlMessage);
                        return res.json({ success: false, error: 'Ошибка Базы Данных при внесении теста' });
                    }

                    var test_id = results.insertId;

                    var finished = 0;
                    abort = false;
                    data.questions.forEach((question, index) => {
                        if (abort)
                            return;

                        connection.query('INSERT INTO questions (test, body, answer, points) VALUES (?, ?, ?, ?)',
                                        [test_id, question.body, question.answer, question.points],
                                        (err, results, fields) => {
                            if (err) {
                                console.log('An error has occured on PUT /create_test. ' + err.code + ': ' + err.sqlMessage);
                                if (!abort) {
                                    res.json({ success: false, error: 'Ошибка Базы Данных при внесении вопроса' });
                                    abort = true;
                                }

                                return;
                            }
            
                            finished++;
                            if (!abort && finished === data.questions.length)
                                return res.json({ success: true });
                        });
                    });
                });
            });
        });
    });

    app.post('/delete_test/:id', (req, res) => {
        if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
            return res.redirect('/error');

        connection.query('SELECT author, headline FROM tests WHERE id = ?',
                        [req.params.id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /delete_test. ' + err.code + ': ' + err.sqlMessage);
                return res.redirect('/error');
            }

            if (results.length === 0)
                return res.redirect('/tests?error=no_test');

            if (req.session.user.type !== 3 && results[0].author !== req.session.user.id)
                return res.redirect('/error');

            var headline = results[0].headline;
            var test_id = req.params.id;

            connection.query(`DELETE FROM tests WHERE id = ?; 
                              DELETE FROM tests_completion WHERE test = ?; 
                              DELETE FROM questions WHERE test = ?; 
                              DELETE FROM answers WHERE test = ?`,
                            [test_id, test_id, test_id, test_id], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /delete_test. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }

                return res.redirect('/tests?deleted=' + encodeURIComponent(headline));
            });
        });
    });

    /* +------+ Topics +------+ */

    app.get('/topics', (req, res) => {
        if (!req.session.user)
            return res.redirect('/error');
        
        var messages = [];

        if (req.query.error) {
            if (req.query.error === 'no_topic')
                messages.push('Ошибка: Тема не найдена.');
        }
        else if (req.query.deleted)
            messages.push('Тема "' + decodeURIComponent(req.query.deleted) + '" успешно удалена.');
        else if (req.query.success)
            messages.push('Тема успешно создана.');

        const elements_per_page = 20;
        
        var page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page, 10);

            if (page === NaN || page < 1) {
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

            var offset = (page - 1) * elements_per_page;
            connection.query('SELECT id, title, subject, semester FROM topics LIMIT ? OFFSET ?',
                            [elements_per_page, offset], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /topics. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }
    
                return res.render('topics', {
                    messages: messages, user: req.session.user, page: page,
                    pages_num: pages_num, elements: results
                });
            });
        });
    });

    app.get('/create_topic', (req, res) => {
        if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
            return res.redirect('/error');

        return res.render('create_topic', { user: req.session.user });
    });

    app.post('/create_topic', (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
            return res.json({ success: false, error: 'Нет доступа' });

        var title = req.body.inputTitle;
        var subject = req.body.inputSubject;
        var semester = req.body.inputSemester;

        if (!title) {
            return res.json({ 
                sucess: false,
                error: 'Введите название темы'
            });
        }
        title = decodeURIComponent(title.trim());
        if (title.length < 3) {
            return res.json({ 
                sucess: false,
                error: 'Название темы не может быть короче 3 символов'
            });
        }
        if (title.length > 128) {
            return res.json({ 
                sucess: false,
                error: 'Название темы не может быть длиннее 128 символов'
            });
        }
        
        if (!subject) {
            return res.json({ 
                sucess: false,
                error: 'Введите название предмета'
            });
        }
        subject = decodeURIComponent(subject);
        if (!(/^[а-яА-Я\s]*$/.test(subject))) {
            return res.json({ 
                sucess: false,
                error: 'В названии предмета допустима только кириллица'
            });
        }
        if (subject.length < 2) {
            return res.json({ 
                sucess: false,
                error: 'Название предмета не может быть короче 2 символов'
            });
        }
        if (subject.length > 128) {
            return res.json({ 
                sucess: false,
                error: 'Название предмета не может быть длиннее 128 символов'
            });
        }
        
        
        if (!semester) {
            return res.json({ 
                sucess: false,
                error: 'Выберите необходимый уровень подготовки'
            });
        }
        semester = parseInt(semester, 10);
        if (semester === NaN || semester === -1) {
            return res.json({ 
                sucess: false,
                error: 'Выберите необходимый уровень подготовки'
            });
        }
        if (semester < 0) {
            return res.json({ 
                sucess: false,
                error: 'Неверный уровень подготовки'
            });
        }

        connection.query('SELECT NULL FROM topics WHERE title = ?', 
                        [title], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /create_topic. ' + err.code + ': ' + err.sqlMessage);
                return res.json({ success: false, error: 'Ошибка Базы Данных' });
            }

            if (results.length !== 0)
                return res.json({ success: false, error: 'Тема с таким названием уже существует' });

            connection.query('INSERT INTO topics (title, subject, semester) VALUES (?, ?, ?)', 
                            [title, subject, semester], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /create_topic. ' + err.code + ': ' + err.sqlMessage);
                    return res.json({ success: false, error: 'Ошибка Базы Данных' });
                }

                return res.json({ success: true });
            });
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

            var id = req.params.id;
            connection.query(`DELETE FROM tests_completion WHERE test IN (SELECT id FROM tests WHERE topic = ?); 
                              DELETE FROM answers WHERE test IN (SELECT id FROM tests WHERE topic = ?); 
                              DELETE FROM questions WHERE test IN (SELECT id FROM tests WHERE topic = ?); 
                              DELETE FROM tests WHERE topic = ?; 
                              DELETE FROM topics WHERE id = ?`,
                            [id, id, id, id, id], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /delete_topic. ' + err.code + ': ' + err.sqlMessage);
                    return res.redirect('/error');
                }

                return res.redirect('/topics?deleted=' + encodeURIComponent(title));
            });
        });
    });

    /* +------+ Statistics +------+ */

    app.get('/statistics', (req, res) => {
        if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
            return res.redirect('/error');
        
        connection.query('SELECT id, headline, created AS date FROM tests WHERE author = ?',
                        [req.session.user.id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /statistics. ' + err.code + ': ' + err.sqlMessage);
                return res.render('statistics/select', {
                    user: req.session.user,
                    success: false,
                    error: 'Ошибка Базы Данных'
                });
            }

            var tests = [];
            results.forEach((test) => {
                tests.push(Object.assign({}, test));
            });

            return res.render('statistics/select', {
                user: req.session.user,
                success: true,
                tests: tests
            });
        });
    });

    app.get('/statistics/test/:id', (req, res) => {
        if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
            return res.redirect('/error');
        
        connection.query('SELECT headline FROM tests WHERE id = ?',
                        [req.params.id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /statistics/user. ' + err.code + ': ' + err.sqlMessage);
                return res.render('statistics/test', {
                    user: req.session.user,
                    success: false,
                    error: 'Ошибка Базы Данных'
                });
            }

            if (results.length === 0) {
                return res.render('statistics/test', {
                    user: req.session.user,
                    success: false,
                    error: 'Тест не найден'
                });
            }

            var test = { headline: results[0].headline };

            connection.query('SELECT COUNT(*) FROM users WHERE type = 1', (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /statistics/test. ' + err.code + ': ' + err.sqlMessage);
                    return res.render('statistics/test', {
                        user: req.session.user,
                        success: false,
                        error: 'Ошибка Базы Данных'
                    });
                }

                var count = results[0]['COUNT(*)'];

                connection.query(`SELECT users.name, tests_completion.mark FROM tests_completion 
                                  LEFT JOIN users ON tests_completion.user = users.id 
                                  WHERE tests_completion.test = ?`,
                                [req.params.id], (err, results, fields) => {
                    if (err) {
                        console.log('An error has occured on /statistics/test. ' + err.code + ': ' + err.sqlMessage);
                        return res.render('statistics/test', {
                            user: req.session.user,
                            success: false,
                            error: 'Ошибка Базы Данных'
                        });
                    }

                    test.quantity = count - results.length;
                    var students = [];
                    results.forEach((student) => {
                        students.push(Object.assign({}, student));
                    });

                    return res.render('statistics/test', {
                        user: req.session.user,
                        success: true,
                        test: test,
                        students: students,
                        marks: config.marks
                    });
                });
            });
        });
    });

    /*
    app.get('/statistics/user/:id', (req, res) => {
        if (!req.session.user || req.session.user.type < 2 || !req.session.user.verified)
            return res.redirect('/error');
        
        connection.query('SELECT name, position AS class, type FROM users WHERE id = ?',
                        [req.params.id], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /statistics/user. ' + err.code + ': ' + err.sqlMessage);
                return res.render('statistics/user_journal', {
                    user: req.session.user,
                    success: false,
                    error: 'Ошибка Базы Данных'
                });
            }

            if (results.length === 0) {
                return res.render('statistics/user_journal', {
                    user: req.session.user,
                    success: false,
                    error: 'Пользователь не найден'
                });
            }

            var student = Object.assign({}, results[0]);
            if (student.type !== 1) {
                return res.render('statistics/user_journal', {
                    user: req.session.user,
                    success: false,
                    error: 'Пользователь не является учеником'
                });
            }

            connection.query(`SELECT tests_completion.mark, tests.headline, tests.created, topics.title AS topic 
                              FROM tests_completion LEFT JOIN tests ON tests_completion.test = tests.id 
                              LEFT JOIN topics ON tests.topic = topics.id WHERE tests_completion.user = ?`,
                            [req.params.id], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /statistics/user. ' + err.code + ': ' + err.sqlMessage);
                    return res.render('statistics/user_journal', {
                        user: req.session.user,
                        success: false,
                        error: 'Ошибка Базы Данных'
                    });
                }

                var tests = [];
                results.forEach((test) => {
                    tests.push(Object.assign({}, test));
                });

                return res.render('statistics/user_journal', {
                    user: req.session.user,
                    success: true,
                    student: student,
                    tests: tests
                });
            });
        });
    });
    */

    /* +------+ Authorization +------+ */
    
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

        connection.query('SELECT id, hash, name, type, verified, position FROM users WHERE login = ?',
                        [login], (err, results, fields) => {
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

    /* +------+ Registration +------+ */

    app.get('/register', (req, res) => {
        if (req.session.user)
            return res.redirect('/');

        return res.render('register');
    });

    app.post('/register', (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.session.user)
            return res.json({ success: false, error: 'Вы уже вошли как ' + req.session.user.login });
        
        var data = req.body;    

        var login = data.inputLogin;
        var password = data.inputPassword;
        var name = data.inputName;
        var type = data.inputType;
        var position = data.inputPosition;

        if (!login || !password)
            return res.json({ success: false, error: 'Введите логин и пароль' });
        if (login.length < 4)
            return res.json({ success: false, error: 'Логин не может быть короче 4 символов' });
        if (login.length > 64)
            return res.json({ success: false, error: 'Логин не может быть длиннее 64 символов' });
        if (!(/^[a-zA-Z0-9_]+$/.test(login))) {
            return res.json({
                success: false,
                error: 'Логин не должен содержать пробелов. Допустимы только латинские буквы, цифры, нижние подчёркивания и тире'
            });
        }
        
        if (password.length < 4)
            return res.json({ success: false, error: 'Пароль не может быть короче 4 символов' });
        
        if (!name)
            return res.json({ success: false, error: 'Введите ФИО' });
        if (name.length > 128)
            return res.json({ success: false, error: 'ФИО не может быть длиннее 128 символов' });
        var parts = name.split(" ");
        if (parts.length !== 3)
            return res.json({ success: false, error: 'Введите ФИО в формате \"Фамилия Имя Отчество\"' });
        for (part of parts) {
            if (!(/^[а-яА-Я]+$/.test(part)) || part.charAt(0) == part.charAt(0).toLowerCase() || part.length < 2)
                return res.json({ success: false, error: 'Введите ФИО в формате \"Фамилия Имя Отчество\"' });
        }

        if (!type)
            return res.json({ success: false, error: 'Выберите тип аккаунта' });
        type = parseInt(type, 10);
        if (type === NaN || type === -1)
            return res.json({ success: false, error: 'Выберите тип аккаунта' });
        if (type < 0 || type > 3)
            return res.json({ success: false, error: 'Неверный тип аккаунта' });
        
        if (!position)
            return res.json({ success: false, error: 'Введите ваш класс/должность' });
        position = position.trim();
        if (position.length > 128)
            return res.json({ success: false, error: 'Название класса/должности не может быть длиннее 128 символов' });

        var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

        connection.query('SELECT id FROM users WHERE login = ?', [login], (err, results, fields) => {
            if (err) {
                console.log('An error has occured on /register. ' + err.code + ': ' + err.sqlMessage);
                return res.json({ success: false, error: 'Ошибка Базы Данных' });
            }

            if (results.length !== 0)
                return res.json({ success: false, error: 'Логин занят' });

            var verified = type === 0 ? true : false;
            connection.query('INSERT INTO users (login, hash, name, type, verified, position) VALUES (?, ?, ?, ?, ?, ?)', 
                            [login, hash, name, type, verified, position], (err, results, fields) => {
                if (err) {
                    console.log('An error has occured on /register. ' + err.code + ': ' + err.sqlMessage);
                    return res.json({ success: false, error: 'Ошибка Базы Данных' });
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

                // return res.redirect('/?action=registered');
                return res.json({ success: true });
            });
        });
    });

    /* -------- 404 -------- */

    app.get('*', (req, res) => {
        return res.render('error');
    });
};

/* -------- Functions -------- */

/*
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
*/