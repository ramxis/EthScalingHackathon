const { toUtf8CodePoints } = require('@ethersproject/strings');
const express = require('express');
const router = express.Router();


router.get('/', function(req, res, next) {
    res.render('index');
});




module.exports = router;