"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const export_controller_1 = require("../controllers/export.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const exportController = new export_controller_1.ExportController();
router.get('/excel', auth_middleware_1.authMiddleware, exportController.exportExcel);
exports.default = router;
