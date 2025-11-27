import { connectDB, getCollection } from '../config/database.js';
import { CollectionName } from '../types/common/enums.js';
import { User } from '../types/auth/request.js';
import { hashPassword } from '../utils/password.js';
import readline from 'readline';

/**
 * Script to create an admin user
 * Run this to create the first admin account
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdminUser() {
  try {
    console.log('🔐 Create Admin User\n');
    
    await connectDB();
    console.log('✅ Connected to database\n');

    const collection = getCollection<User>(CollectionName.USERS);

    // Get admin details from user input
    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    
    if (existingUser) {
      const update = await question(`User with email ${email} already exists. Update to admin? (y/n): `);
      
      if (update.toLowerCase() === 'y') {
        await collection.updateOne(
          { email },
          { $set: { isAdmin: true, updatedAt: new Date() } }
        );
        console.log(`✅ User ${email} has been updated to admin`);
      } else {
        console.log('❌ Operation cancelled');
      }
      
      rl.close();
      process.exit(0);
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const newAdmin = {
      name,
      email,
      password: hashedPassword,
      isInstructor: false,
      isAdmin: true,
      enrolledCourseIds: [],
      courseProgress: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newAdmin as unknown as User);

    if (result.insertedId) {
      console.log('\n✅ Admin user created successfully!');
      console.log(`📧 Email: ${email}`);
      console.log(`👤 Name: ${name}`);
      console.log(`🔑 ID: ${result.insertedId}`);
    } else {
      console.log('❌ Failed to create admin user');
    }

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    rl.close();
    process.exit(1);
  }
}

// Run the script
createAdminUser();
