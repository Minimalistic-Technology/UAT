"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// 1. Initial Microsoft OAuth login step
router.get('/microsoft', authController.login);
// 2. Callback from Microsoft
router.post('/microsoft/callback', authController.callback);
// 3. User Info (needs auth middleware)
router.get('/me', authController.getCurrentUser);
// 4. Logout
router.post('/logout', authController.logout);
exports.default = router;
