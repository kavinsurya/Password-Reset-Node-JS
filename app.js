const express = require('express')
var cors = require('cors')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const mongodb = require('mongodb');
const client = mongodb.MongoClient;


const app = express()
app.use(cors());
app.use(bodyParser.json())

const url = "mongodb://localhost:27017";

app.get('/users', async function (req, res) {
    try {
        let connection = await client.connect(url);
        let dataBase = connection.db("password_reset");
        let data = await dataBase.collection("users").find().toArray();
        await connection.close();
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
    }

})


app.post('/register', async (req, res) => {
    try {
        let connection = await client.connect(url);
        let dataBase = connection.db("password_reset");
        let data = await dataBase.collection("users").findOne({ email: req.body.email })
        if (data) {
            res.status(400).json({
                message: "User already exists"
            });
        } else {
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(req.body.password, salt);
            req.body.password = hash;
            await dataBase.collection("users").insertOne(req.body);
            res.status(200).json({
                message: "Registration Successful"
            });
        }
        await connection.close();
    } catch (error) {
        console.log(error);
    }

})

app.post('/login', async (req, res) => {
    try {
        let connection = await client.connect(url);
        let dataBase = connection.db('password_reset');
        let data = await dataBase.collection('users').findOne({ email: req.body.email });
        if (data) {
            let compare = await bcrypt.compare(req.body.password, data.password);
            if (compare) {
                res.status(200).json({
                    message: "Logged in Successfully"
                });
            } else {
                res.status(400).json({
                    message: "Login  Failed"
                });
            }
        } else {
            res.status(401).json({
                message: "Email not registered"
            })
        }
        await connection.close();
    } catch (error) {
        console.log(error);
    }
})




app.listen(3000, () => {
    console.log('Listening to port 3000');
})