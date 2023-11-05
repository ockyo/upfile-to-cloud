
const sql = require('mssql');
const port = 4000;
const http = require('http');
const bcrypt = require('bcrypt');

// setup connect to SQL Server
const config = {
    user: 'sa',
    password: '11011010@aD',
    server: 'ockyo-ZenBook',
    database: 'ACCOUNTS',
    options: {
        // encrypt: true,
        trustServerCertificate: true, // Bypass SSL certificate validation
    }
};

// connect to sql server
sql.connect(config)
    .then(() => {
        console.log('Connected to SQL Server');
    })
    .catch((err) => {
        console.error('Error connecting to SQL Server:', err);
    });

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:3000', // set origin specifically
    methods: 'GET,POST,PUT,DELETE', // set allow method http
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));// use middleware CORS and option config
// xu ly post request
app.post('/register', (req, res) => {

    //get value from request
    const { name, email, password } = req.body;
    console.log(req.body);
    //create res
    // res.json({ message: 'Data sent and processed successfully' });
    //just sent res.json one time
    const insertQuery = `INSERT INTO Users (Name, Email, Password) VALUES ('${name}', '${email}', '${password}')`;


    hashPassword(password, (hashPassword) => {
        // Create a SQL query to insert data into the 'Users' table
        const insertQuery = `INSERT INTO Users (Name, Email, Password) VALUES ('${name}', '${email}', '${hashPassword}')`;

        sql.query(insertQuery, (err, result) => {
            if (err) {
                console.error('Error while executing SQL query:', err);
                res.status(500).json({ message: 'Error inserting data into database' });
            } else {
                console.log('The data has been inserted successfully.');
                res.json({ message: 'The data has been inserted successfully' });
            }
        })
    });

});

// Xu ly post request cho route "/login"
app.post('/login', (req, res) => {
    //get value from req
    // const { email, password } = req.body;
    const { email, password } = req.body;
    console.log(req.body);
    const selectQuery = `SELECT * FROM Users WHERE Email = '${email}'`;
    sql.query(selectQuery, (err, result) => {
        if (err) {
            console.error('Error while executing SQL query:', err);
            res.status(500).json({ message: 'Error when querying the database' });
        } else {
            //check email in db
            console.log(result.recordset);
            if (result.recordset.length === 0) {
                console.log('Invalid email or password.');
                res.status(401).json({ message: 'Invalid email or password' });
            } else {
                // So sánh mật khẩu đã mã hóa trong cơ sở dữ liệu với mật khẩu đã cung cấp
                bcrypt.compare(password, result.recordset[0].Password, (compareErr, isMatch) => {
                    if (compareErr) {
                        console.error('Error while comparing passwords:', compareErr);
                        res.status(500).json({ message: 'Error when comparing passwords' });
                    } else {
                        if (isMatch) {
                            // Mật khẩu khớp, có thể đăng nhập thành công
                            console.log('Login successful');
                            res.json({ message: 'Login successful' });
                        } else {
                            // Mật khẩu không khớp
                            console.log('Invalid email or password.');
                            res.status(401).json({ message: 'Invalid email or password' });
                        }
                    }
                });
            }
        }
    });
});


//get user info
app.get('/user-info', (req, res) => {
    // const email = g
    console.log(email);
    const selectQuery = `SELECT * FROM Users`;
    
    sql.query(selectQuery, (err, result) => {
        if (err) {
            console.error('Error while executing SQL query:', err);
            res.status(500).json({ message: 'Error when querying the database' });
        } else {
            //check email in db
            console.log(result.recordset);
            if (result.recordset.length === 0) {
                console.log('Invalid email or password.');
                res.status(401).json({ message: 'Invalid email or password' });
            }
            
            return res.status(200).json({ users: result.recordsets });
        }
    });

})
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
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