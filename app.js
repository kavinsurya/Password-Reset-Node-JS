const express = require('express')
var cors = require('cors')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

const mongodb = require('mongodb');
const client = mongodb.MongoClient;

//middlewares
const app = express()
app.use(cors());
app.use(bodyParser.json())



//DB url 
const url = process.env.url;

//APi to view users
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



//Api to register new user
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


//Api to Login the user
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
                    message: "Login Failed"
                });
            }
        } else {
            res.status(401).json({
                message: "E-mail is not registered"
            })
        }
        await connection.close();
    } catch (error) {
        console.log(error);
    }
})


//Api to send the reset code via mail 
 app.post('/sendMail', async(req, res) => {
    try {
        let connection = await client.connect(url);
        let db = connection.db("password_reset");
        let checkvalidity = await db.collection("users").findOne({ email: req.body.email });
      
        if (checkvalidity) {
            let data = await db.collection("reset").insertOne(req.body);
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.mail,
                    pass: process.env.password
                }
            });

            let mailOptions = {
                from: "kavinguvi@gmail.com",
                to: req.body.email,
                subject: "Password reset",
                html: `<div>
                <p>Hello ${checkvalidity.name},</p>

                <p>Enter the code <b>${req.body.code}</b> in the webpage!!</p>

                <p>Regards,</p>
                <p>Password reset team</p>
                </div>`
            }
         

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ message: "Error occured while sending mail" })
                } else {
                    res.status(200).json({ message: "Email sent !!" })
                }
            })
            await connection.close();
        } else {
            res.status(402).json({ message: "User doesn't exist in data base!" })
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Error while sending mail !!" })
    }
})



//APi to validate the reset code

app.post('/code', async(req, res) => {
    let connection = await client.connect(url);
    let db = connection.db("password_reset");
    let ismatching = await db.collection('reset').findOne({ "code": req.body.code });
    if (ismatching !== null) {
        res.status(200).json({ 
            message: "success"
         });
    } else {
        res.status(400).json({
             message: "code doesn't match" 
            });
    }
    await connection.close();
})



//Api to reset the password for an user
app.put('/resetpassword', async(req, res) => {
    let connection = await client.connect(url, { useUnifiedTopology: true });
    let db = connection.db("password_reset");
    let isAvailable = await db.collection("users").findOne({ email: req.body.email });
    if (isAvailable) {
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        let updatepassword = await db.collection("users").updateOne({ "email": req.body.email }, { $set: { "password": req.body.password } });
        if (updatepassword) {
            res.status(200).json({
                 message: "Password Updated successfully"
                 })
        } else {
            res.status(400).json({
                 message: "Password reset failed" 
                })
        }
        await connection.close();
    } else {
        res.status(401).json({ 
            message: "Email doesn't exist"
         })
    }


})



app.listen(3000, () => {
    console.log('Listening to port 3000');
})