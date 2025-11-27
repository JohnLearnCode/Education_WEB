import { connectDB, getCollection } from '../config/database.js';
import { CollectionName } from '../types/common/enums.js';
import { User } from '../types/auth/request.js';

/**
 * Migration script to add isAdmin field to existing users
 * Run this once to update all existing users in the database
 */
async function addIsAdminField() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    const collection = getCollection<User>(CollectionName.USERS);

    console.log('🔄 Adding isAdmin field to all users...');
    
    // Update all users that don't have isAdmin field
    const result = await collection.updateMany(
      { isAdmin: { $exists: false } },
      { $set: { isAdmin: false } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with isAdmin field`);

    // Optional: Set a specific user as admin by email
    // Uncomment and modify the email below if you want to set an admin
    /*
    const adminEmail = 'admin@example.com';
    const adminResult = await collection.updateOne(
      { email: adminEmail },
      { $set: { isAdmin: true } }
    );
    
    if (adminResult.modifiedCount > 0) {
      console.log(`✅ Set ${adminEmail} as admin`);
    } else {
      console.log(`⚠️ User ${adminEmail} not found`);
    }
    */

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
addIsAdminField();
