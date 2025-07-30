const express = require('express');
const { registerUser, loginUser, verifyUser, getUnverifiedUsers } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/verify/:id', verifyUser);
router.get('/unverified', getUnverifiedUsers);


module.exports = router;
