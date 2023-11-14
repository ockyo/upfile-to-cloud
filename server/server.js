const sql = require('mssql');
const port = 4000;
const https = require('https');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

const cookie = require('cookie');
const app = express();

// config SSL (HTTPS)
const privateKey = fs.readFileSync('./.cert/key.pem'); // set path private key
const certificate = fs.readFileSync('./.cert/cert.pem'); // set path certificate
const credentials = { key: privateKey, cert: certificate };
const server = https.createServer(credentials, app);
//
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// connect to SQL Server
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


// use middleware CORS và cấu hình tùy chọn
const corsOptions = {
    origin: 'https://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    optionsSuccessStatus: 204,
    credentials: true,
    exposedHeaders: ['SET-COOKIE'],
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json())

app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header('Content-Type', 'application/json;charset=UTF-8')
    res.header('Access-Control-Allow-Credentials', true)
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
})

// app.use(session({
//     secret: 'secret', // Key bí mật để mã hóa cookie
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         secure: true, // Nên là true nếu sử dụng HTTPS
//         maxAge: 3600000,
//     }
// }));

// app.use(cookieParser("secret"));

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

                            // req.session.username = result.recordset[0].Name;
                            // res.cookie('userSession', result.recordset[0].Name, {
                            //     path: '/admin',
                            //     httpOnly: true
                            // });
                            // console.log('Headers:', res.getHeaders());
                            // console.log('Login successful');
                            // return res.json({ message: 'Login successful', username: result.recordset[0].Name });

                            res.cookie('user', result.recordset[0].Name)
                            // res.json({ id: 2 });

                            res.json({ message: 'Login successful', username: result.recordset[0].Name });

                            // insert cookie to db
                            const cookieValue = result.recordset[0].Name;

                            const insertQuery = `UPDATE Users SET Cookie = '${cookieValue}' WHERE Email = '${email}'`;
                            sql.query(insertQuery, (err, result) => {
                                if (err) {
                                    console.error('Error while executing SQL query:', err);
                                    res.status(500).json({ message: 'Error inserting data into the database' });
                                } else {
                                    console.log("Update cookie successed");
                                    console.log(cookieValue);
                                }
                            });
                            

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


//get user info for home page
app.get('/user-info',checkIsLogin, (req, res, next) => {
    console.log(req.cookies['user']);
    const userName = req.cookies['user']
    res.status(200).json({ message: userName })
});




// Logout
app.post('/logout', (req, res) => {
    res.clearCookie("user");
    res.json({ message: 'Logout successful' });
});

//another function
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

function checkIsLogin(req, res, next) {
    const selectQuery = `SELECT Cookie FROM Users WHERE Cookie = '${req.cookies['user']}'`;
    sql.query(selectQuery, (err, result) => {
        if (err) {
            console.error('Error while executing SQL query:', err);
            res.status(500).json({ message: 'Error when querying the database' });
        } else {
            if (result.recordset.length !== 0) {
                next();
            } else {
                res.status(401).json({message: 'Error login'});
            }
        }
    });
    // if (islogged) {
    //     req.userName =
    //         next();
    // }
    // else {
    //     res.status(401).json({ msg: 'abc' });
    // }
}

// Set up multer to handle file uploads

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./public/Images")
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({ storage })

app.post('/upload', upload.single('file'), (req, res) => {
    console.log(req.body)
    console.log(req.file)
    res.json({ message: 'Upload file successed.' });
})

//////////////



// console.log(req.session);
// if (req.session && req.session.username) {
//     return res.json({ valid: true, username: req.session.username });
// } else {
//     return res.status(401).json({ valid: false, message: "Unauthorized" });
// }

// })



// app.get('/print-cookies', (req, res) => {

//     const cookies = req.cookies;
//     console.log('Cookies sent to the client:', cookies);
//     res.send('Check your server console for the list of cookies sent to the client.');
// });

// app.get('/cookie', (req, res) => {
// //     // const user = { name: 'John', email: 'john@example.com' };
// //     // const userCookie = cookie.serialize('user', JSON.stringify(user), {
// //     //     secure: true,
// //     //     httpOnly: false,
// //     // });
// //     // res.setHeader('Set-Cookie', userCookie);
// //     const user = { name: 'John', email: 'john@example.com' };
// //     res.cookie('user', JSON.stringify(user), {
// //         maxAge: 360000,
// //         httpOnly: false,
// //         path: '/'
// //     });
// // })

// app.get('/cookie', (req, res) => {
//     res.cookie('set-cookie', "sesssion=123");
//     res.send('set cookie');
// })



