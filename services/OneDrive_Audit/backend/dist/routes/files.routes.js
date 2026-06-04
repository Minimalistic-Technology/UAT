"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const files_controller_1 = require("../controllers/files.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const filesController = new files_controller_1.FilesController();
// All file routes require auth
router.use(auth_middleware_1.authMiddleware);
router.get('/', filesController.getFiles);
router.post('/sync', filesController.syncFiles);
router.patch('/:id/designation', filesController.updateDesignation);
exports.default = router;
