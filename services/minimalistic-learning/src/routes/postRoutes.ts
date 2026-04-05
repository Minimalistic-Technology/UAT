import { Router } from "express";
import {
  listPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getPostById,
  upvotePost,
  downvotePost,
  listMyPosts,
} from "../controllers/postController";
import requireAuth from "../middleware/requireAuth";
import { uploadCoverImage } from "../middleware/upload";

const router = Router();

router.get("/", listPosts);
router.get("/my", requireAuth, listMyPosts);
router.get("/slug/:slug", getPostBySlug);
router.get("/id/:blogId", getPostById);
router.post("/", requireAuth, uploadCoverImage, createPost);
router.put("/:blogId", requireAuth, updatePost);
router.delete("/:blogId", requireAuth, deletePost);
router.post("/:blogId/upvote", requireAuth, upvotePost);
router.post("/:blogId/downvote", requireAuth, downvotePost);

export default router;
