import { getCollection } from "../config/database";
import { CreateAnswerRequest, UpdateAnswerRequest, Answer } from "../types/answer/request";
import { CollectionName } from "../types/common/enums";
import { ObjectId } from "mongodb";

/**
 * Create a new answer
 */
export const createAnswer = async (answerData: CreateAnswerRequest): Promise<Answer | null> => {
  try {
    const collection = getCollection<Answer>(CollectionName.ANSWERS);

    const newAnswer = {
      text: answerData.text,
      imageUrl: answerData.imageUrl,
      createdAt: new Date()
    };

    const result = await collection.insertOne(newAnswer as unknown as Answer);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo answer ở Model:', error);
    return null;
  }
};

/**
 * Bulk create answers
 */
export const bulkCreateAnswers = async (answers: CreateAnswerRequest[]): Promise<Answer[]> => {
  try {
    const collection = getCollection<Answer>(CollectionName.ANSWERS);

    const newAnswers = answers.map(answer => ({
      text: answer.text,
      imageUrl: answer.imageUrl,
      createdAt: new Date()
    }));

    const result = await collection.insertMany(newAnswers as unknown as Answer[]);

    if (result.insertedCount > 0) {
      const insertedIds = Object.values(result.insertedIds);
      return await collection.find({ _id: { $in: insertedIds } }).toArray();
    }

    return [];
  } catch (error) {
    console.error('Lỗi bulk create answers ở Model:', error);
    return [];
  }
};

/**
 * Get answer by ID
 */
export const getAnswerById = async (answerId: string): Promise<Answer | null> => {
  try {
    const collection = getCollection<Answer>(CollectionName.ANSWERS);
    return await collection.findOne({
      _id: new ObjectId(answerId)
    });
  } catch (error) {
    console.error('Lỗi get answer by id:', error);
    return null;
  }
};

/**
 * Get answers by IDs
 */
export const getAnswersByIds = async (answerIds: string[]): Promise<Answer[]> => {
  try {
    const collection = getCollection<Answer>(CollectionName.ANSWERS);
    const objectIds = answerIds.map(id => new ObjectId(id));
    return await collection.find({ _id: { $in: objectIds } }).toArray();
  } catch (error) {
    console.error('Lỗi get answers by ids:', error);
    return [];
  }
};

/**
 * Update answer by ID
 */
export const updateAnswer = async (
  answerId: string,
  updateData: UpdateAnswerRequest
): Promise<Answer | null> => {
  try {
    const collection = getCollection<Answer>(CollectionName.ANSWERS);

    const result = await collection.updateOne(
      { _id: new ObjectId(answerId) },
      { $set: updateData }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(answerId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi update answer:', error);
    return null;
  }
};

/**
 * Delete answer by ID
 */
export const deleteAnswer = async (answerId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Answer>(CollectionName.ANSWERS);

    const result = await collection.deleteOne({
      _id: new ObjectId(answerId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete answer:', error);
    return false;
  }
};

/**
 * Delete answers by IDs
 */
export const deleteAnswersByIds = async (answerIds: string[]): Promise<boolean> => {
  try {
    const collection = getCollection<Answer>(CollectionName.ANSWERS);
    const objectIds = answerIds.map(id => new ObjectId(id));

    const result = await collection.deleteMany({
      _id: { $in: objectIds }
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete answers by ids:', error);
    return false;
  }
};
