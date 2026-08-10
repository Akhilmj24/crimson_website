// @ts-nocheck
import express from 'express';
import authController from '../controllers/authController';
import auth from '../middlewares/auth';
import tenant from '../middlewares/tenant';

const router = express.Router();

// Public routes
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);

// Protected routes (Admin / Super Admin user management)
router.get('/auth/users', auth, tenant, authController.getUsers);
router.post('/auth/users', auth, tenant, authController.createUser);
router.put('/auth/users/:id/permissions', auth, tenant, authController.updateUserPermissions);
router.delete('/auth/users/:id', auth, tenant, authController.deleteUser);

// General route to fetch users under current tenant (accessible by all roles)
router.get('/auth/users-list', auth, tenant, authController.getUsersList);

export default router;
