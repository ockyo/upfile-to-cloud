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
    //create res
    // res.json({ message: 'Data sent and processed successfully' });
    //just sent res.json one time



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
app.listen(port, () => {
    console.log(`Listening in ${port}`);
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