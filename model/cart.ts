import { getCollection } from '../config/database';
import { CollectionName } from '../types/common/enums';
import { ObjectId } from 'mongodb';
import { Cart } from '../types/cart/request.js';

export const getCartByUserId = async (userId: string): Promise<Cart | null> => {
  const collection = getCollection<Cart>(CollectionName.CARTS);
  return await collection.findOne({
    userId: new ObjectId(userId)
  });
};

export const createEmptyCart = async (userId: string): Promise<Cart | null> => {
  const collection = getCollection<Cart>(CollectionName.CARTS);

  const newCart = {
    userId: new ObjectId(userId),
    courses: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await collection.insertOne(newCart as unknown as Cart);

  if (result.insertedId) {
    return await collection.findOne({ _id: result.insertedId });
  }

  return null;
};

export const updateCartCourses = async (
  userId: string,
  courseIds: string[]
): Promise<Cart | null> => {
  const collection = getCollection<Cart>(CollectionName.CARTS);

  const courses = courseIds.map((id) => ({ courseId: new ObjectId(id) }));

  const result = await collection.findOneAndUpdate(
    { userId: new ObjectId(userId) },
    {
      $set: {
        courses,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );

  return result || null;
};
