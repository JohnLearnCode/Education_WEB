import { getCollection } from "../config/database";
import { CreateQuizQuestionRequest, UpdateQuizQuestionRequest, QuizQuestion } from "../types/quizQuestion/request";
import { CollectionName } from "../types/common/enums";
import { ObjectId } from "mongodb";

/**
 * Create a new quiz question
 */
export const createQuizQuestion = async (questionData: CreateQuizQuestionRequest): Promise<QuizQuestion | null> => {
  try {
    const collection = getCollection<QuizQuestion>(CollectionName.QUIZ_QUESTIONS);

    const newQuestion = {
      quizId: new ObjectId(questionData.quizId),
      questionText: questionData.questionText,
      options: questionData.options,
      correctAnswerIndex: questionData.correctAnswerIndex,
      order: questionData.order,
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
      .sort({ order: 1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get questions by quiz id:', error);
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

    const result = await collection.updateOne(
      { _id: new ObjectId(questionId) },
      { $set: updateData }
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
 * Reorder questions (update order of multiple questions)
 */
export const reorderQuestions = async (questionOrders: { questionId: string; order: number }[]): Promise<boolean> => {
  try {
    const collection = getCollection<QuizQuestion>(CollectionName.QUIZ_QUESTIONS);

    const bulkOps = questionOrders.map(({ questionId, order }) => ({
      updateOne: {
        filter: { _id: new ObjectId(questionId) },
        update: { $set: { order } }
      }
    }));

    const result = await collection.bulkWrite(bulkOps);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Lỗi reorder questions:', error);
    return false;
  }
};

/**
 * Get next order number for a quiz
 */
export const getNextOrderNumber = async (quizId: string): Promise<number> => {
  try {
    const collection = getCollection<QuizQuestion>(CollectionName.QUIZ_QUESTIONS);
    
    const lastQuestion = await collection
      .find({ quizId: new ObjectId(quizId) })
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    return lastQuestion.length > 0 ? lastQuestion[0].order + 1 : 1;
  } catch (error) {
    console.error('Lỗi get next order number:', error);
    return 1;
  }
};
