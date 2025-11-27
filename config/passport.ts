import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { getCollection } from './database.js';
import { CollectionName } from '../types/common/enums.js';
import { User } from '../types/user/request.js';

export const configurePassport = () => {
  // Read environment variables inside the function to ensure dotenv has loaded
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
  const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  // Skip Google OAuth configuration if credentials are not provided
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google OAuth credentials not found. Google login will be disabled.');
    console.warn('   Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env to enable Google login.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        try {
          const collection = getCollection<User>(CollectionName.USERS);
          
          // Lấy email và tên từ Google profile
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || profile.name?.givenName || 'User';
          const avatarUrl = profile.photos?.[0]?.value;
          
          if (!email) {
            return done(new Error('Email không tồn tại trong Google profile'), undefined);
          }

          // Tìm user theo googleId hoặc email
          let user = await collection.findOne({
            $or: [
              { googleId: profile.id },
              { email: email }
            ]
          });

          if (user) {
            // Nếu user đã tồn tại nhưng chưa có googleId, cập nhật googleId
            if (!user.googleId) {
              await collection.updateOne(
                { _id: user._id },
                { 
                  $set: { 
                    googleId: profile.id,
                    avatarUrl: avatarUrl || user.avatarUrl,
                    updatedAt: new Date()
                  } 
                }
              );
              user.googleId = profile.id;
            }
          } else {
            // Tạo user mới
            const newUser = {
              name,
              email,
              googleId: profile.id,
              avatarUrl,
              password: '', // Không cần password cho Google OAuth
              isInstructor: false,
              isAdmin: false,
              enrolledCourseIds: [],
              courseProgress: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = await collection.insertOne(newUser as any);
            user = {
              ...newUser,
              _id: result.insertedId
            } as any;
          }

          return done(null, user || undefined);
        } catch (error) {
          console.error('Lỗi Google OAuth:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user._id.toString());
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const collection = getCollection<User>(CollectionName.USERS);
      const { ObjectId } = await import('mongodb');
      const user = await collection.findOne({ _id: new ObjectId(id) });
      done(null, user || undefined);
    } catch (error) {
      done(error, undefined);
    }
  });
};

export default passport;
