const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const User = require("../models/User.model");

const isAuthenticated = require("../middleware/isAuthenticated")

router.post("/login", (req, res)=>{
    const {email, password} = req.body

    if(!email || !password) res.status(400).json({error: new Error("WRONG_CRED"), status: 400, message: "Please provide credentials"})

    User.find({email})
    .then(foundUser=>{
        if(!foundUser) res.status(400).json({error: new Error("WRONG_USR"), status: 400, message: "Wrong credentials"})

        const isPwdCorrect = bcrypt.compareSync(password, foundUser.password)

        const payload = {id: foundUser._id, name: foundUser.name, email: foundUser.email}
        const secret = process.env.JWT_SECRET;

        if(isPwdCorrect){
            const authToken = jwt.sign(
                payload,
                secret,
                // { algorithm: 'HS256', expiresIn: "6h" }
            )

            res.status(200).json({authToken, status: 200, message: "User correctly logged in"})
        }else{
            res.status(400).json({error: new Error("WRONG_CRED"), status: 400, message: "Please provide credentials"})
        }
    })
    .catch(error=> res.status(500).json({error: new Error("SRV_ERR"), status: 500, message: "Server error" + error}))
})


router.get("/verify", isAuthenticated, (req, res)=>{
    // we could decrypt by hand the JWT here and NOT use the middleware,
    // but it's cleaner to have one common middleware throuout the backend to handle JWT
    // so the decryption function neds up also here as middleware
    
    const validationResponse = req.payload

    res.status(200).json(validationResponse)
})

router.post('/signup', (req, res, next) => {
    const { email, password, name } = req.body;
  
    // Check if email or password or name are provided as empty string 
    if (email === '' || password === '' || name === '') {
      res.status(400).json({ message: "Provide email, password and name" });
      return;
    }
  
    // Use regex to validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Provide a valid email address.' });
      return;
    }
    
    // Use regex to validate the password format
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
      return;
    }
  
  
    // Check the users collection if a user with the same email already exists
    User.findOne({ email })
      .then((foundUser) => {
        // If the user with the same email already exists, send an error response
        if (foundUser) {
          res.status(400).json({ message: "User already exists." });
          return;
        }
  
        // If email is unique, proceed to hash the password
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(password, salt);
  
        // Create the new user in the database
        // We return a pending promise, which allows us to chain another `then` 
        return User.create({ email, password: hashedPassword, name });
      })
      .then((createdUser) => {
        // Deconstruct the newly created user object to omit the password
        // We should never expose passwords publicly
        const { email, name, _id } = createdUser;
      
        // Create a new object that doesn't expose the password
        const user = { email, name, _id };
  
        // Send a json response containing the user object
        res.status(201).json({ user: user });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" })
      });
  });
  
  