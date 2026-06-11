"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const files_routes_1 = __importDefault(require("./routes/files.routes"));
const export_routes_1 = __importDefault(require("./routes/export.routes"));
const db_1 = require("./config/db");
dotenv_1.default.config();
(0, db_1.connectDB)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS — allow both local dev and production frontend
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
const device_auth_routes_1 = __importDefault(require("./routes/device-auth.routes"));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/device-auth', device_auth_routes_1.default);
app.use('/api/files', files_routes_1.default);
app.use('/api/export', export_routes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
