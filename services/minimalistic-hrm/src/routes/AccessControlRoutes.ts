// routes/authRoutes.ts
import { Router } from "express";
import { register, login, getMe , deleteUser , updateUser , getUsers , updateProfile} from "../controllers/authAccessController";
import { isUser } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route (requires token in cookie)
router.get("/me", isUser, getMe);

router.get('/users'  ,isUser , getUsers);
router.put('/user/:id' , isUser , updateUser );
router.delete('/user/:id' , isUser , deleteUser);
router.put('/update-profile' , isUser , updateProfile);


export default router;