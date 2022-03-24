const User = require('../models/userSchema');

exports.signup = (req, res) => {
    const user = new User(req.body)
    user.save((err, user) => {
        if(err){
            return res.status(400).json({
                error: "Unable to add User"
            })
        }
        //any code that runs here means we dont have an error!
        return res.json({
            message: "Success",
             user
        })

    })
}

