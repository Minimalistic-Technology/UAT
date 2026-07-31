import { Router } from "express";
import {
  listPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getPostById,
  likePost,
  listMyPosts,
  uploadMedia,
  recordView,
  getUserStats,
} from "../controllers/postController";
import requireAuth from "../middleware/requireAuth";
import checkDbPermission from "../middleware/checkDbPermission";
import { uploadCoverImage, uploadMedia as uploadMediaMiddleware } from "../middleware/upload";

const router = Router();

router.get("/", listPosts);
router.get("/my", requireAuth, listMyPosts);
router.get("/user/stats", requireAuth, getUserStats);
router.get("/slug/:slug", getPostBySlug);

router.post("/slug/:slug/view", recordView);        // Public — no auth needed
router.get("/id/:blogId", getPostById);
router.post("/", requireAuth, checkDbPermission, uploadCoverImage, createPost);
router.put("/:blogId", requireAuth, checkDbPermission, updatePost);
router.delete("/:blogId", requireAuth, checkDbPermission, deletePost);
router.post("/:blogId/like", requireAuth, checkDbPermission, likePost);
router.post("/media/upload", requireAuth, checkDbPermission, uploadMediaMiddleware, uploadMedia);

export default router;
