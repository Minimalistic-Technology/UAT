import { Router } from "express";
import {
    addCompany,
    updateCompany,
    getCompanies,
    addUser,
} from "../controllers/companyControllers";
import { isUser, isAdmin } from "../middleware/authMiddleware"; // Assuming isUser checks token

const router = Router();




router.post("/add", isUser , addCompany); // Super Admin
router.get("/",isUser , getCompanies); // Super Admin (all) / Admin (own)
router.put("/:id", isUser,updateCompany); // Super Admin / Admin (own)

router.post("/add-user",isUser , addUser); // Super Admin / Admin (add users)

export default router;
