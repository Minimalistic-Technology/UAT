import { Request, Response } from "express";
import ActiveSession from "../models/ActiveSession";
import GameConfig from "../models/gameConfig";

export const startOrResumeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user?._id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const activeConfig = await GameConfig.findOne({ isActive: true });
    if (!activeConfig) {
      res.status(404).json({ message: "No active game configuration found" });
      return;
    }

    const { gameConfigId, questions, prizeLadder, lifelines } = req.body;
    if (!gameConfigId || !questions || !prizeLadder || !lifelines) {
      res.status(400).json({ message: "Missing required session data" });
      return;
    }

    // Step 1 — Resume unfinished session
    let existingSession = await ActiveSession.findOne({
      userId,
      gameConfigId: activeConfig._id,
      isCompleted: false,
    });

    if (existingSession) {
      res.status(200).json({
        message: "Resumed existing session",
        session: existingSession,
      });
      return;
    }

    // Step 2 — Already completed session
    const completedSession = await ActiveSession.findOne({
      userId,
      gameConfigId: activeConfig._id,
      isCompleted: true,
    });

    if (completedSession) {
      res.status(206).json({
        message: "You have already completed this session",
        session: completedSession,
      });
      return;
    }

    // Step 3 — Remove old incomplete sessions
    await ActiveSession.deleteMany({
      userId,
      gameConfigId: { $ne: activeConfig._id },
      isCompleted: false,
    });

    // Step 4 — Create new session
    const newSession = await ActiveSession.create({
      userId,
      gameConfigId: activeConfig._id,
      questions,
      prizeLadder,
      lifelines,
      currentQuestionIndex: 0,
      currentPrizeLevel: 0,
      isCompleted: false,
    });

    res.status(201).json({
      message: "Game session started successfully",
      session: newSession,
    });
  } catch (error: any) {
    console.error("Error creating/resuming session:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getActiveSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user?._id;

    const session = await ActiveSession.findOne({ userId, isCompleted: false });

    if (!session) {
      res.status(404).json({ message: "No active session found" });
      return;
    }

    res.status(200).json({ session });
  } catch (error: any) {
    console.error("Error in getActiveSession:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const updateSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user?._id;

    const { currentQuestionIndex, lifelines, questionId, isCorrect } = req.body;

    const session = await ActiveSession.findOne({ userId, isCompleted: false });
    if (!session) {
      res.status(404).json({ message: "Active session not found" });
      return;
    }

    if (currentQuestionIndex !== undefined) session.currentQuestionIndex = currentQuestionIndex;
    if (lifelines) session.lifelines = lifelines;

    if (questionId) {
      const question = session.questions.find(
        (q: any) => q._id.toString() === questionId
      );
      if (question) {
        question.isAsked = true;
        question.answeredCorrectly = !!isCorrect;
      }
    }

    await session.save();

    res.status(200).json({
      message: "Session updated successfully",
      session,
    });
  } catch (error: any) {
    console.error("Error in updateSession:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const completeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user?._id;

    const session = await ActiveSession.findOneAndUpdate(
      { userId, isCompleted: false },
      { isCompleted: true, completedAt: new Date() },
      { new: true }
    );

    if (!session) {
      res.status(404).json({ message: "No active session found" });
      return;
    }

    res.status(200).json({
      message: "Game session completed successfully",
      session,
    });
  } catch (error: any) {
    console.error("Error in completeSession:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
