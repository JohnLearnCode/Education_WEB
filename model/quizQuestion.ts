import { getCollection } from "../config/database";
import { CreateQuizQuestionRequest, UpdateQuizQuestionRequest, QuizQuestion, QuizQuestionResponse } from "../types/quizQuestion/request";
import { CollectionName } from "../types/common/enums";
import { ObjectId } from "mongodb";
import * as answerModel from "./answer";
import { Answer } from "../types/answer/request";

/**
 * Create a new quiz question with answers
 */
export const createQuizQuestion = async (questionData: CreateQuizQuestionRequest): Promise<QuizQuestion | null> => {
  try {
    const collection = getCollection<QuizQuestion>(CollectionName.QUIZ_QUESTIONS);

    // Tạo answers trước
    const createdAnswers = await answerModel.bulkCreateAnswers(questionData.answers);
    
    if (createdAnswers.length === 0) {
      console.error('Không thể tạo answers');
      return null;
    }

    // Map correctAnswerIndices sang correctAnswerIds
    const answerIds = createdAnswers.map(a => a._id);
    const correctAnswerIds = questionData.correctAnswerIndices.map(index => answerIds[index]);

    const newQuestion = {
      quizId: new ObjectId(questionData.quizId),
      questionText: questionData.questionText,
      imageUrl: questionData.imageUrl,
      answerIds: answerIds,
      correctAnswerIds: correctAnswerIds,
      requiredAnswers: correctAnswerIds.length, // Tự động = số đáp án đúng
      type: questionData.type,
      createdAt: new Date()
    };

    const result = await collection.insertOne(newQuestion as unknown as QuizQuestion);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo quiz question ở Model:', error);
    return null;
  }
};

/**
 * Get quiz question by ID
 */
export const getQuizQuestionById = async (questionId: string): Promise<QuizQuestion | null> => {
  try {
    const collection = getCollection<QuizQuestion>(CollectionName.QUIZ_QUESTIONS);
    return await collection.findOne({
      _id: new ObjectId(questionId)
    });
  } catch (error) {
    console.error('Lỗi get quiz question by id:', error);
    return null;
  }
};

/**
 * Get questions by quiz ID
 */
export const getQuestionsByQuizId = async (quizId: string): Promise<QuizQuestion[]> => {
  try {
    const collection = getCollection<QuizQuestion>(CollectionName.QUIZ_QUESTIONS);
    return await collection
      .find({ quizId: new ObjectId(quizId) })
      .toArray();
  } catch (error) {
    console.error('Lỗi get questions by quiz id:', error);
    return [];
  }
};

/**
 * Get questions by quiz ID with populated answers (for instructor)
 */
export const getQuestionsByQuizIdWithAnswers = async (quizId: string): Promise<QuizQuestionResponse[]> => {
  try {
    const collection = getCollection<QuizQuestion>(CollectionName.QUIZ_QUESTIONS);
    const questions = await collection
      .find({ quizId: new ObjectId(quizId) })
      .toArray();

    // Populate answers for each question
    const questionsWithAnswers = await Promise.all(
      questions.map(async (q) => {
        const answerIds = q.answerIds.map(id => id.toString());
        const answers = await answerModel.getAnswersByIds(answerIds);
        return {
          ...q,
          quizId: q.quizId.toString(),
          answers: answers,
          correctAnswerIds: q.correctAnswerIds.map(id => id.toString())
        } as QuizQuestionResponse;
      })
    );

    return questionsWithAnswers;
  } catch (error) {
    console.error('Lỗi get questions with answers:', error);
    return [];
  }
};

/**
 * Update quiz question by ID
 */
export const updateQuizQuestion = async (
  questionId: string,
  updateData: UpdateQuizQuestionRequest
): Promise<QuizQuestion | null> => {
  try {
    const collection = getCollection<QuizQuestion>(CollectionName.QUIZ_QUESTIONS);

    // Convert string IDs to ObjectIds
    const updateFields: any = { ...updateData };
    if (updateData.answerIds) {
      updateFields.answerIds = updateData.answerIds.map(id => new ObjectId(id));
    }
    if (updateData.correctAnswerIds) {
      updateFields.correctAnswerIds = updateData.correctAnswerIds.map(id => new ObjectId(id));
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(questionId) },
      { $set: updateFields }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(questionId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi update quiz question:', error);
    return null;
  }
};

/**
 * Delete quiz question by ID
 */
export const deleteQuizQuestion = async (questionId: string): Promise<boolean> => {
  try {
    const collection = getCollection<QuizQuestion>(CollectionName.QUIZ_QUESTIONS);

    const result = await collection.deleteOne({
      _id: new ObjectId(questionId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete quiz question:', error);
    return false;
  }
};

/**
 * Delete all questions by quiz ID (when quiz is deleted)
 */
export const deleteQuestionsByQuizId = async (quizId: string): Promise<boolean> => {
  try {
    const collection = getCollection<QuizQuestion>(CollectionName.QUIZ_QUESTIONS);

    const result = await collection.deleteMany({
      quizId: new ObjectId(quizId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete questions by quiz id:', error);
    return false;
  }
};

/**
 * Delete question with its answers
 */
export const deleteQuizQuestionWithAnswers = async (questionId: string): Promise<boolean> => {
  try {
    const collection = getCollection<QuizQuestion>(CollectionName.QUIZ_QUESTIONS);
    
    // Get question first to get answer IDs
    const question = await collection.findOne({ _id: new ObjectId(questionId) });
    if (!question) return false;

    // Delete associated answers
    const answerIds = question.answerIds.map(id => id.toString());
    await answerModel.deleteAnswersByIds(answerIds);

    // Delete question
    const result = await collection.deleteOne({ _id: new ObjectId(questionId) });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete question with answers:', error);
    return false;
  }
};
