const express = require('express');
const { generateImage, uploadToPinata } = require('../controller/imageController');
const router = express.Router();

router.post('/generate', generateImage);
router.post('/upload-to-pinata', uploadToPinata);

module.exports = router;
