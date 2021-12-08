const jwt = require("express-jwt")  // if in its own module the jwt library
                                    // need to be wrapped in express middleware by the expres-jwt module


const isAuthenticated = jwt(
    {
        secret: process.env.JWT_SECRET,
        requestProperty: "payload",
        getToken: token,
        // if you have used special algorithms in the encoding, you shold specify here the same algo
        // algorthms:["HS256"]
    }
    )

    const token = ()=>{
        if(req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer"){
        return req.headers.authorization.split(" ")[1]
    } else {
        return null
    }
     // the first part is the string "Bearer" because the protol requires it.
    }
    module.exports = {isAuthenticated}