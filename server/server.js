const sql = require('mssql');
const port = 4000;
const https = require('https');
const fs = require('fs');

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
    credentials: true
};
app.use(cors(corsOptions));

app.use(express.json())
app.use(cookieParser());
app.use(bodyParser.json());

app.use(session({
    secret: 'your-secret-key', // Key bí mật để mã hóa cookie
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // Nên là true nếu bạn sử dụng HTTPS
        maxAge: 3600000, 
    }
}));



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
                // const emailCookie = cookie.serialize('nauser-session', email, {
                //     secure: true, // Bảo đảm rằng cookie chỉ được gửi qua kết nối an toàn HTTPS
                //     httpOnly: false,
                //     maxAge: 3600000, // Thời gian sống của cookie (60 phút)
                // });
                // Gửi cookie về máy khách
                // res.setHeader('Set-Cookie', "sessionDemo=emailCookie");
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


                            // const user = { name: result.recordset[0].Name, email };
                            // res.cookie('user', JSON.stringify(user), {
                            //     maxAge: 360000,
                            //     httpOnly: false,
                            //     path: '/',
                            // });


                            req.session.username = result.recordset[0].Name;
                            res.cookie('sessionId1', req.session.id);
                            console.log(req.session.username);
                            console.log('Login successful');
                            return res.json({ message: 'Login successful', username: req.session.username });
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

    if (req.session.username) {
        return res.json({ valid: true, username: req.session.username });
    }

})


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
app.get('/print-cookies', (req, res) => {
    
    const cookies = req.cookies;
    console.log('Cookies sent to the client:', cookies);
    res.send('Check your server console for the list of cookies sent to the client.');
});
// app.get('/cookie', (req, res) => {
//     // const user = { name: 'John', email: 'john@example.com' };
//     // const userCookie = cookie.serialize('user', JSON.stringify(user), {
//     //     secure: true,
//     //     httpOnly: false,
//     // });
//     // res.setHeader('Set-Cookie', userCookie);
//     const user = { name: 'John', email: 'john@example.com' };
//     res.cookie('user', JSON.stringify(user), {
//         maxAge: 360000,
//         httpOnly: false,
//         path: '/',
//     });
// })
app.get('/cookie', (req, res) => {
    res.cookie('set-cookie', "sesssion=123");
    res.send('set cookie');
})


