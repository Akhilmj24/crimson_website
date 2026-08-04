const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const tenant = require('../middlewares/tenant');

const router = express.Router();

// Public routes
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);

// Protected routes (Admin / Super Admin user management)
router.get('/auth/users', auth, tenant, authController.getUsers);
router.post('/auth/users', auth, tenant, authController.createUser);
router.delete('/auth/users/:id', auth, tenant, authController.deleteUser);

module.exports = router;
