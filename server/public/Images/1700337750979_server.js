// app.post('/register', (req, res) => {
//     const { name, email, password } = req.body;

//     // use hashPassword to encrypt pass
//     hashPassword(password, (hashedPassword) => {
//         const insertQuery = `INSERT INTO Users (Name, Email, Password) VALUES ('${name}', '${email}', '${hashedPassword}')`;

//         sql.query(insertQuery, (err, result) => {
//             if (err) {
//                 console.error('Error while executing SQL query:', err);
//                 res.status(500).json({ message: 'Error inserting data into database' });
//             } else {
//                 console.log('The data has been inserted successfully.');
//                 res.json({ message: 'The data has been inserted successfully' });
//             }
//         });
//     });
// });

// app.use('/', (req, res, next) => {
//     res.send('hello')
// })

// app.post('/login', (req, res) => {
//     const { email, password } = req.body;
//     const selectQuery = `SELECT * FROM Users WHERE Email = '${email}'`;

//     sql.query(selectQuery, (err, result) => {
//         if (err) {
//             console.error('Error while executing SQL query:', err);
//             res.status(500).json({ message: 'Error when querying the database' });
//         } else {
//             if (result.recordset.length === 0) {
//                 console.log('Invalid email or password.');
//                 res.status(401).json({ message: 'Invalid email or password' });
//             } else {
//                 bcrypt.compare(password, result.recordset[0].Password, (compareErr, isMatch) => {
//                     if (compareErr) {
//                         console.error('Error while comparing passwords:', compareErr);
//                         res.status(500).json({ message: 'Error when comparing passwords' });
//                     } else {
//                         if (isMatch) {
//                             console.log('Login successful');
//                             res.json({ message: 'Login successful' });
//                         } else {
//                             console.log('Invalid email or password.');
//                             res.status(401).json({ message: 'Invalid email or password' });
//                         }
//                     }
//                 });
//             }
//         }
//     });
// });








const sql = require('mssql');
const port = 4000;
const https = require('https'); // Sử dụng https thay vì http
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

// Cấu hình SSL (HTTPS)
const privateKey = fs.readFileSync('./.cert/key.pem'); // Đặt đường dẫn tới private key
const certificate = fs.readFileSync('./.cert/cert.pem'); // Đặt đường dẫn tới certificate
const credentials = { key: privateKey, cert: certificate };
// Sử dụng HTTPS thay vì HTTP
const server = https.createServer(credentials, app);

// Chuyển từ app.listen() sang server.listen() để sử dụng HTTPS
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


app.use(bodyParser.json());
// Cấu hình cho express-session
app.use(session({
    secret: 'your-secret-key', // Key bí mật để mã hóa cookie
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true, // Nên là true nếu bạn sử dụng HTTPS
        maxAge: 3600000, // Thời gian sống của cookie (60 phút)
    }
}));
// Sử dụng middleware CORS và cấu hình tùy chọn
const corsOptions = {
    origin: 'https://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    optionsSuccessStatus: 204,
    credentials: true
};
app.use(cors(corsOptions));

// Kết nối đến SQL Server
const config = {
    user: 'sa',
    password: '11011010@aD',
    server: 'ockyo-ZenBook',
    database: 'ACCOUNTS',
    options: {
        trustServerCertificate: true, // Bypass SSL certificate validation
    }
};

sql.connect(config)
    .then(() => {
        console.log('Connected to SQL Server');
    })
    .catch((err) => {
        console.error('Error connecting to SQL Server:', err);
    });



const cookie = require('cookie');

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;


    hashPassword(password, (hashedPassword) => {
        const insertQuery = `INSERT INTO Users (Name, Email, Password) VALUES ('${name}', '${email}', '${hashedPassword}')`;

        sql.query(insertQuery, (err, result) => {
            if (err) {
                console.error('Error while executing SQL query:', err);
                res.status(500).json({ message: 'Error inserting data into the database' });
            } else {
                console.log('Registration successful');

                // Tạo một đối tượng cookie
                const userCookie = cookie.serialize('user', JSON.stringify({ name, email }), {
                    secure: true, // Bảo đảm rằng cookie chỉ được gửi qua kết nối an toàn HTTPS
                    httpOnly: true,
                    maxAge: 3600000, // Thời gian sống của cookie (60 phút)
                });

                // Gửi cookie về máy khách
                res.setHeader('Set-Cookie', userCookie);
                res.json({ message: 'Registration successful' });
            }
        });
    });
});

// Xác thực người dùng và tạo cookie
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const selectQuery = `SELECT * FROM Users WHERE Email = '${email}'`;

    sql.query(selectQuery, (err, result) => {
        if (err) {
            console.error('Error while executing SQL query:', err);
            res.status(500).json({ message: 'Error when querying the database' });
        } else {
            if (result.recordset.length === 0) {
                console.log('Invalid email or password.');
                res.status(401).json({ message: 'Invalid email or password' });
            } else {
                bcrypt.compare(password, result.recordset[0].Password, (compareErr, isMatch) => {
                    if (compareErr) {
                        console.error('Error while comparing passwords:', compareErr);
                        res.status(500).json({ message: 'Error when comparing passwords' });
                    } else {
                        if (isMatch) {
                            // Thực hiện xác thực thành công và tạo cookie phiên làm việc
                            const user = { name: result.recordset[0].Name, email };
                            const userCookie = cookie.serialize('user', JSON.stringify(user), {
                                secure: true, // Bảo đảm rằng cookie chỉ được gửi qua kết nối an toàn HTTPS
                                httpOnly: true,
                                maxAge: 3600000, // Thời gian sống của cookie (60 phút)
                            });
                            res.setHeader('Set-Cookie', userCookie);
                            req.session.user = email;

                            console.log('Login successful');
                            res.json({ message: 'Login successful' });
                        } else {
                            console.log('Invalid email or password.');
                            res.status(401).json({ message: 'Invalid email or password' });
                        }
                    }
                });
            }
        }
    });
});


app.get('/user-info', (req, res) => {
    if (req.session.user) {
        // Đã xác thực, truy cập thông tin người dùng từ cookie
        const userEmail = req.session.user;
        console.log(userEmail);
        // Thay đổi câu truy vấn SQL để lấy cả tên người dùng
        const selectQuery = `SELECT Name, Email FROM Users WHERE Email = '${userEmail}'`;

        sql.query(selectQuery, (err, result) => {
            if (err) {
                console.error('Error while executing SQL query:', err);
                res.status(500).json({ message: 'Error when querying the database' });
            } else {
                if (result.recordset.length === 0) {
                    console.log('No user found.');
                    res.status(404).json({ message: 'No user found' });
                } else {
                    const userData = result.recordset[0];
                    res.json({ message: 'Authenticated user', name: userData.Name, email: userData.Email });
                }
            }
        });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
        console.log(401);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ message: 'Error destroying session' });
        } else {
            res.status(200).json({ message: 'Logged out successfully' });
        }
    });
});
function hashPassword(password, callback) {
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, function (err, hashedPassword) {
        if (err) {
            console.error('Error while hash password:', err);
        } else {
            callback(hashedPassword);
        }
    });
}

