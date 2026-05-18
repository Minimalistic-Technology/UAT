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
  listTrending,
  getUserStats,
} from "../controllers/postController";
import requireAuth from "../middleware/requireAuth";
import { uploadCoverImage, uploadMedia as uploadMediaMiddleware } from "../middleware/upload";

const router = Router();

router.get("/", listPosts);
router.get("/trending", listTrending);              // Top blogs by views
router.get("/my", requireAuth, listMyPosts);
router.get("/user/stats", requireAuth, getUserStats);
router.get("/slug/:slug", getPostBySlug);

router.post("/slug/:slug/view", recordView);        // Public — no auth needed
router.get("/id/:blogId", getPostById);
router.post("/", requireAuth, uploadCoverImage, createPost);
router.put("/:blogId", requireAuth, updatePost);
router.delete("/:blogId", requireAuth, deletePost);
router.post("/:blogId/like", requireAuth, likePost);
router.post("/media/upload", requireAuth, uploadMediaMiddleware, uploadMedia);

export default router;
