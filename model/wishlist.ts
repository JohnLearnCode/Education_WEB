import { getCollection } from '../config/database';
import { CollectionName } from '../types/common/enums';
import { ObjectId } from 'mongodb';
import { Wishlist } from '../types/wishlist/request.js';

export const getWishlistByUserId = async (userId: string): Promise<Wishlist | null> => {
  const collection = getCollection<Wishlist>(CollectionName.WISHLISTS);
  return await collection.findOne({
    userId: new ObjectId(userId)
  });
};

export const createEmptyWishlist = async (userId: string): Promise<Wishlist | null> => {
  const collection = getCollection<Wishlist>(CollectionName.WISHLISTS);

  const newWishlist = {
    userId: new ObjectId(userId),
    courses: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await collection.insertOne(newWishlist as unknown as Wishlist);

  if (result.insertedId) {
    return await collection.findOne({ _id: result.insertedId });
  }

  return null;
};

export const updateWishlistCourses = async (
  userId: string,
  courseIds: string[]
): Promise<Wishlist | null> => {
  const collection = getCollection<Wishlist>(CollectionName.WISHLISTS);

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
