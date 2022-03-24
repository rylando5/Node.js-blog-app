const express = require('express');
const router = express.Router();
const { signup } = require("../controllers/user")

//Sign up route
router.post('/signup', signup)



module.exports = router