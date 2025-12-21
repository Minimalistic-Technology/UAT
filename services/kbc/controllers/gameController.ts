import { Request, Response } from "express";
import Question from "../models/Question";
import QuestionBank from "../models/QuestionBank";
import GameResult from "../models/GameResult";
import GameConfig from "../models/gameConfig";
import mongoose from "mongoose";

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


const getRandomQuestion = async (bankId: string) => {
  // Step 1: Pick one random unasked question
  const randomQuestion = await Question.aggregate([
    {
      $match: {
        bankId: new mongoose.Types.ObjectId(bankId),
        status: "published",
        isAsked: false,
      },
    },
    { $sample: { size: 1 } },
  ]);

  if (!randomQuestion.length) return null;

  // Step 2: Atomically update it (in case of race condition)
  const updated = await Question.findOneAndUpdate(
    { _id: randomQuestion[0]._id, isAsked: false },
    { $set: { isAsked: true } },
    { new: true }
  );

  return updated;
};

export const startGameSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeConfig = await GameConfig.findOne({ isActive: true });

    if (!activeConfig) {
      res.status(404).json({ message: "No active game configuration found" });
      return;
    }

    const selectedQuestions: any[] = [];

    // Loop through each selected bank
    for (const bankId of activeConfig.selectedBanks) {
      const bank = await QuestionBank.findById(bankId);
      if (!bank) continue;

      // Step 1: Try to get one random unasked question
      let randomQuestion = await getRandomQuestion(bank._id);

      // Step 2: If all are asked, reset and retry once
      if (!randomQuestion) {
        await Question.updateMany(
          { bankId: bank._id, status: "published" },
          { $set: { isAsked: false } }
        );

        randomQuestion = await getRandomQuestion(bank._id);
      }

      // Step 3: Push to selected list if found
      if (randomQuestion) selectedQuestions.push(randomQuestion);
    }

    res.status(200).json({
      message: "Game session started successfully",
      questions: selectedQuestions,
      prizeLadder: activeConfig.prizeLadder,
      lifelines: activeConfig.lifelines,
      gameConfigId:activeConfig._id,
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

    let availableQuestions = await Question.find({
      bankId: currentQuestionBankId,
      _id: { $nin: askedQuestionIds || [] },
      status: "published",
      isAsked:"false"
    });

      if (availableQuestions.length === 0) {
      await Question.updateMany(
        { bankId: currentQuestionBankId, status: "published" },
        { $set: { isAsked: false } }
      );

      availableQuestions = await Question.find({
        bankId: currentQuestionBankId,
        status: "published",
        isAsked: false,
      });
    }

    // 🔹 If still no questions found after reset (empty bank)
    if (availableQuestions.length === 0) {
      res.status(404).json({ message: "No questions available in this bank" });
      return;
    }

    const randomQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    res.status(200).json({
      message: "New question fetched successfully",
      question: randomQuestion,
    });

    await Question.findByIdAndUpdate(randomQuestion._id, {
          isAsked: true,
        });

    
  } catch (error) {
    console.error("Error in flipQuestion:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const completeGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { finalScore, isWinner, prize, totalTimeSeconds, lifelinesUsed, questionHistory } = req.body;

  const user = (req as any).user;
if (!user || !finalScore || !prize || !questionHistory) {
  res.status(400).json({ message: "Missing required fields" });
  return;
}

const newResult = await GameResult.create({
  userId: user._id,
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

export const fiftyFiftyLifeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question } = req.body;

    if (!question || !Array.isArray(question.options) || !question.answer) {
      res.status(400).json({ message: "Invalid question data provided" });
      return;
    }

    const { options, answer } = question;

    const incorrectOptions = options.filter((opt: string) => opt !== answer);

    for (let i = incorrectOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [incorrectOptions[i], incorrectOptions[j]] = [incorrectOptions[j], incorrectOptions[i]];
    }

    const removedOptions = incorrectOptions.slice(0, 2);

    res.status(200).json({ removedOptions });

  } catch (error) {
    console.error("Error in fiftyFiftyLifeline:", error);
    res.status(500).json({ message: "Server error", error });
  }
};