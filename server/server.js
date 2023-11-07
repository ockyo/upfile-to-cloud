const sql = require('mssql');
const port = 4000;
const https = require('https'); // Sử dụng https thay vì http
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');

// Cấu hình SSL (HTTPS)
const privateKey = fs.readFileSync('./.cert/key.pem'); // Đặt đường dẫn tới private key
const certificate = fs.readFileSync('./.cert/cert.pem'); // Đặt đường dẫn tới certificate
const credentials = { key: privateKey, cert: certificate };

const app = express();
app.use(bodyParser.json());

// Sử dụng middleware CORS và cấu hình tùy chọn
const corsOptions = {
    origin: 'https://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    optionsSuccessStatus: 204
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

// Sử dụng HTTPS thay vì HTTP
const server = https.createServer(credentials, app);

// Chuyển từ app.listen() sang server.listen() để sử dụng HTTPS
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    // Sử dụng hàm hashPassword để mã hóa mật khẩu
    hashPassword(password, (hashedPassword) => {
        const insertQuery = `INSERT INTO Users (Name, Email, Password) VALUES ('${name}', '${email}', '${hashedPassword}')`;

        sql.query(insertQuery, (err, result) => {
            if (err) {
                console.error('Error while executing SQL query:', err);
                res.status(500).json({ message: 'Error inserting data into database' });
            } else {
                console.log('The data has been inserted successfully.');
                res.json({ message: 'The data has been inserted successfully' });
            }
        });
    });
});
app.use('/',(req,res,next)=>{
    res.send('hello')
})
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
    // const selectQuery = `SELECT * FROM Users`;

    // sql.query(selectQuery, (err, result) => {
    //     if (err) {
    //         console.error('Error while executing SQL query:', err);
    //         res.status(500).json({ message: 'Error when querying the database' });
    //     } else {
    //         if (result.recordset.length === 0) {
    //             console.log('No user found.');
    //             res.status(404).json({ message: 'No user found' });
    //         }

    //         return res.status(200).json({ users: result.recordsets });
    //     }
    // });
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

