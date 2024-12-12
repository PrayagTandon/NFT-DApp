const express = require('express');
const { generateImage } = require('../controller/imageController');
const router = express.Router();

router.post('/generate', generateImage);

module.exports = router;
