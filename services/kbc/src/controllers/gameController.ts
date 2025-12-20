import { Request, Response } from "express";
import GameConfig from "../models/gameConfig";
import Question from "../models/Question";
import QuestionBank from "../models/QuestionBank";
import GameResult from "../models/GameResult";

export const getGameConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeConfig = await GameConfig.findOne({ isActive: true });
    if (!activeConfig) {
      res.status(404).json({ message: "No active game configuration found" });
      return;
    }

    res.status(200).json({
      totalQuestions: activeConfig.selectedBanks.length,
      lifelines: activeConfig.lifelines,
    });
  } catch (error) {
    console.error("Error in getGameConfig:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const startGameSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeConfig = await GameConfig.findOne({ isActive: true });
    if (!activeConfig) {
      res.status(404).json({ message: "No active game configuration found" });
      return;
    }

    const selectedQuestions = [];

    for (const bankSlug of activeConfig.selectedBanks) {
      const bank = await QuestionBank.findOne({ slug: bankSlug });
      if (!bank) continue;

      const questions = await Question.find({
        bankId: bank._id,
        status: "published",
      });

      if (questions.length > 0) {
        const randomQuestion =
          questions[Math.floor(Math.random() * questions.length)];
        selectedQuestions.push(randomQuestion);
      }
    }

    res.status(200).json({
      message: "Game session started successfully",
      questions: selectedQuestions,
      prizeLadder: activeConfig.prizeLadder,
      lifelines: activeConfig.lifelines,
    });
  } catch (error) {
    console.error("Error in startGameSession:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const flipQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentQuestionBankId, askedQuestionIds } = req.body;

    if (!currentQuestionBankId) {
      res.status(400).json({ message: "currentQuestionBankId is required" });
      return;
    }

    const availableQuestions = await Question.find({
      bankId: currentQuestionBankId,
      _id: { $nin: askedQuestionIds || [] },
      status: "published",
    });

    if (availableQuestions.length === 0) {
      res.status(404).json({ message: "No more questions available in this bank" });
      return;
    }

    const randomQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    res.status(200).json({
      message: "New question fetched successfully",
      question: randomQuestion,
    });
  } catch (error) {
    console.error("Error in flipQuestion:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const completeGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      finalScore,
      isWinner,
      prize,
      totalTimeSeconds,
      lifelinesUsed,
      questionHistory,
    } = req.body;

    if (!userId || !finalScore || !prize || !questionHistory) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newResult = await GameResult.create({
      userId,
      finalScore,
      isWinner,
      prize,
      totalTimeSeconds,
      lifelinesUsed,
      questionHistory,
    });

    const allResults = await GameResult.find()
      .sort({ finalScore: -1, totalTimeSeconds: 1 })
      .limit(5);

    const playerRank =
      (await GameResult.countDocuments({
        finalScore: { $gt: finalScore },
      })) + 1;

    res.status(201).json({
      message: "Game result saved successfully",
      playerRank,
      leaderboard: allResults.map((r, i) => ({
        rank: i + 1,
        name: r.userId,
        score: r.finalScore,
      })),
    });
  } catch (error) {
    console.error("Error in completeGame:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
