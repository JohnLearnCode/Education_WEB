import { getCollection } from "../config/database";
import { CreateQuizRequest, UpdateQuizRequest, Quiz } from "../types/quiz/request";
import { CollectionName } from "../types/common/enums";
import { ObjectId } from "mongodb";

/**
 * Create a new quiz
 */
export const createQuiz = async (quizData: CreateQuizRequest): Promise<Quiz | null> => {
  try {
    const collection = getCollection<Quiz>(CollectionName.QUIZZES);

    const newQuiz = {
      lectureId: new ObjectId(quizData.lectureId),
      courseId: new ObjectId(quizData.courseId),
      title: quizData.title,
      passingScore: quizData.passingScore,
      timeLimit: quizData.timeLimit,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newQuiz as unknown as Quiz);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo quiz ở Model:', error);
    return null;
  }
};

/**
 * Get quiz by ID
 */
export const getQuizById = async (quizId: string): Promise<Quiz | null> => {
  try {
    const collection = getCollection<Quiz>(CollectionName.QUIZZES);
    return await collection.findOne({
      _id: new ObjectId(quizId)
    });
  } catch (error) {
    console.error('Lỗi get quiz by id:', error);
    return null;
  }
};

/**
 * Get quiz by lecture ID
 */
export const getQuizByLectureId = async (lectureId: string): Promise<Quiz | null> => {
  try {
    const collection = getCollection<Quiz>(CollectionName.QUIZZES);
    return await collection.findOne({
      lectureId: new ObjectId(lectureId)
    });
  } catch (error) {
    console.error('Lỗi get quiz by lecture id:', error);
    return null;
  }
};

/**
 * Get quizzes by course ID
 */
export const getQuizzesByCourseId = async (courseId: string): Promise<Quiz[]> => {
  try {
    const collection = getCollection<Quiz>(CollectionName.QUIZZES);
    return await collection
      .find({ courseId: new ObjectId(courseId) })
      .toArray();
  } catch (error) {
    console.error('Lỗi get quizzes by course id:', error);
    return [];
  }
};

/**
 * Update quiz by ID
 */
export const updateQuiz = async (
  quizId: string,
  updateData: UpdateQuizRequest
): Promise<Quiz | null> => {
  try {
    const collection = getCollection<Quiz>(CollectionName.QUIZZES);

    // Prepare update data
    const updateFields: any = {
      ...updateData,
      updatedAt: new Date()
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(quizId) },
      { $set: updateFields }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(quizId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi update quiz:', error);
    return null;
  }
};

/**
 * Delete quiz by ID
 */
export const deleteQuiz = async (quizId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Quiz>(CollectionName.QUIZZES);

    const result = await collection.deleteOne({
      _id: new ObjectId(quizId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete quiz:', error);
    return false;
  }
};

/**
 * Delete quiz by lecture ID (when lecture is deleted)
 */
export const deleteQuizByLectureId = async (lectureId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Quiz>(CollectionName.QUIZZES);

    const result = await collection.deleteOne({
      lectureId: new ObjectId(lectureId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete quiz by lecture id:', error);
    return false;
  }
};

/**
 * Delete all quizzes by course ID (when course is deleted)
 */
export const deleteQuizzesByCourseId = async (courseId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Quiz>(CollectionName.QUIZZES);

    const result = await collection.deleteMany({
      courseId: new ObjectId(courseId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete quizzes by course id:', error);
    return false;
  }
};
