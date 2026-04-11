import { Router } from "express";
import { getDriveFilesController, handleShareCSV } from "../../controllers/drive.controller";

const router = Router();

router.get("/", getDriveFilesController)
router.post("/share/CSV", handleShareCSV)

export default router;