const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const {getUsers} = require('../Controllers/loginController');
const {registerAccount} = require('../Controllers/loginController');
const {verifyAccount} = require ('../Controllers/loginController');





    


router.route('/registeredUsers').get( getUsers);

router.route('/users').post(registerAccount);

router.route('/users/login').post(verifyAccount);



module.exports = router