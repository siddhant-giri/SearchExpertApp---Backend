const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

//Database Connection
const db = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME
})

//Checking if database is connected properly or not
db.connect((error)=>{
    if(error){
        console.error('Error connecting to database', error);
    }
    else {
        console.log('Connected to database');
    }
});

app.get('/api/locations', (req, res) => {

    try{
        const query = 'SELECT DISTINCT location FROM experts';
        db.query(query, (err, results) => {
            if(err){
                console.error('Error retrieving locations', err);
                res.status(500).send('Error retrieving locations.');
            }
            else{
                const locations = results.map(result => result.location);
                res.json(locations);
            }
        });

    }
    catch(err){
        return res.status(500).send("Internal Server Error");
    }
});


app.get('/api/experts/:location/:expertise', (req, res) => {

    try {
        const location = req.params.location;
        const expertise = req.params.expertise;
        const query = `SELECT * FROM experts WHERE location = "${location}" AND expertise = "${expertise}"`;

        db.query(query, (err, results) => {
            if(err){
                console.error(`Error retrieving experts for location '${location}' and expertise '${expertise}': `, err);
                res.status(500).send(`Error retrieving experts for location '${location}' and expertise '${expertise}'.`)
            }
            else{
                res.json(results);
            }
        });
    }
    catch(err){
        return res.status(500).send("Internal Server Error");
    }

});

app.post("/api/contact", (req, res) => {

    try{
        const expert_id = req.body.expertId;
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const message = req.body.message;
        const terms = req.body.termsAccepted;

        const sql = "INSERT INTO contacts (expert_id, name, email, phone, message, terms) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [expert_id, name, email, phone, message, terms], (err, result) => {
            if(err) throw err;
            res.json({message : "Contact saved successfully"});
        })
    }
    catch(err){
        return res.status(500).send("Internal Server Error");
    }
})

app.listen(8081, () => {
    console.log("listening");
})

