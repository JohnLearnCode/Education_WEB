import { getCollection } from "../config/database";
import { QuizAttempt, QuestionAnswer } from "../types/quizAttempt/request";
import { CollectionName } from "../types/common/enums";
import { ObjectId } from "mongodb";

/**
 * Create a new quiz attempt
 */
export const createQuizAttempt = async (attemptData: {
  userId: string;
  courseId: string;
  lectureId: string;
  quizId: string;
  answers: QuestionAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
}): Promise<QuizAttempt | null> => {
  try {
    const collection = getCollection<QuizAttempt>(CollectionName.QUIZ_ATTEMPTS);

    const newAttempt = {
      userId: new ObjectId(attemptData.userId),
      courseId: new ObjectId(attemptData.courseId),
      lectureId: new ObjectId(attemptData.lectureId),
      quizId: new ObjectId(attemptData.quizId),
      answers: attemptData.answers,
      score: attemptData.score,
      totalQuestions: attemptData.totalQuestions,
      correctAnswers: attemptData.correctAnswers,
      passed: attemptData.passed,
      attemptedAt: new Date()
    };

    const result = await collection.insertOne(newAttempt as unknown as QuizAttempt);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo quiz attempt ở Model:', error);
    return null;
  }
};

/**
 * Get quiz attempt by ID
 */
export const getQuizAttemptById = async (attemptId: string): Promise<QuizAttempt | null> => {
  try {
    const collection = getCollection<QuizAttempt>(CollectionName.QUIZ_ATTEMPTS);
    return await collection.findOne({
      _id: new ObjectId(attemptId)
    });
  } catch (error) {
    console.error('Lỗi get quiz attempt by id:', error);
    return null;
  }
};

/**
 * Get all attempts by user ID
 */
export const getAttemptsByUserId = async (userId: string): Promise<QuizAttempt[]> => {
  try {
    const collection = getCollection<QuizAttempt>(CollectionName.QUIZ_ATTEMPTS);
    return await collection
      .find({ userId: new ObjectId(userId) })
      .sort({ attemptedAt: -1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get attempts by user id:', error);
    return [];
  }
};

/**
 * Get all attempts for a specific quiz by user
 */
export const getAttemptsByUserAndQuiz = async (
  userId: string,
  quizId: string
): Promise<QuizAttempt[]> => {
  try {
    const collection = getCollection<QuizAttempt>(CollectionName.QUIZ_ATTEMPTS);
    return await collection
      .find({
        userId: new ObjectId(userId),
        quizId: new ObjectId(quizId)
      })
      .sort({ attemptedAt: -1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get attempts by user and quiz:', error);
    return [];
  }
};

/**
 * Get all attempts for a quiz (for instructors)
 */
export const getAttemptsByQuizId = async (quizId: string): Promise<QuizAttempt[]> => {
  try {
    const collection = getCollection<QuizAttempt>(CollectionName.QUIZ_ATTEMPTS);
    return await collection
      .find({ quizId: new ObjectId(quizId) })
      .sort({ attemptedAt: -1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get attempts by quiz id:', error);
    return [];
  }
};

/**
 * Get all attempts for a course by user
 */
export const getAttemptsByUserAndCourse = async (
  userId: string,
  courseId: string
): Promise<QuizAttempt[]> => {
  try {
    const collection = getCollection<QuizAttempt>(CollectionName.QUIZ_ATTEMPTS);
    return await collection
      .find({
        userId: new ObjectId(userId),
        courseId: new ObjectId(courseId)
      })
      .sort({ attemptedAt: -1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get attempts by user and course:', error);
    return [];
  }
};

/**
 * Get best attempt for a quiz by user
 */
export const getBestAttemptByUserAndQuiz = async (
  userId: string,
  quizId: string
): Promise<QuizAttempt | null> => {
  try {
    const collection = getCollection<QuizAttempt>(CollectionName.QUIZ_ATTEMPTS);
    const attempts = await collection
      .find({
        userId: new ObjectId(userId),
        quizId: new ObjectId(quizId)
      })
      .sort({ score: -1, attemptedAt: -1 })
      .limit(1)
      .toArray();

    return attempts.length > 0 ? attempts[0] : null;
  } catch (error) {
    console.error('Lỗi get best attempt:', error);
    return null;
  }
};

/**
 * Count total attempts for a quiz by user
 */
export const countAttemptsByUserAndQuiz = async (
  userId: string,
  quizId: string
): Promise<number> => {
  try {
    const collection = getCollection<QuizAttempt>(CollectionName.QUIZ_ATTEMPTS);
    return await collection.countDocuments({
      userId: new ObjectId(userId),
      quizId: new ObjectId(quizId)
    });
  } catch (error) {
    console.error('Lỗi count attempts:', error);
    return 0;
  }
};

/**
 * Delete all attempts by quiz ID (when quiz is deleted)
 */
export const deleteAttemptsByQuizId = async (quizId: string): Promise<boolean> => {
  try {
    const collection = getCollection<QuizAttempt>(CollectionName.QUIZ_ATTEMPTS);

    const result = await collection.deleteMany({
      quizId: new ObjectId(quizId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete attempts by quiz id:', error);
    return false;
  }
};
