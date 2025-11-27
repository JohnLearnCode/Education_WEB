import dotenv from 'dotenv';
dotenv.config();

import { MongoClient, ObjectId } from 'mongodb';
import { QuizType } from '../types/common/enums.js';

const MONGODB_URI = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'education_platform';

interface SeedAnswer {
  _id: ObjectId;
  text: string;
  imageUrl?: string;
  createdAt: Date;
}

interface SeedQuestion {
  _id: ObjectId;
  quizId: ObjectId;
  questionText: string;
  imageUrl?: string;
  answerIds: ObjectId[];
  correctAnswerIds: ObjectId[];
  requiredAnswers: number;
  type: QuizType;
  createdAt: Date;
}

interface SeedQuiz {
  _id: ObjectId;
  lectureId: ObjectId;
  courseId: ObjectId;
  title: string;
  passingScore: number;
  timeLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

async function seedQuizData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Kết nối MongoDB thành công');
    
    const db = client.db(DB_NAME);
    
    // Get existing course and lecture to link quiz
    const coursesCollection = db.collection('courses');
    const lecturesCollection = db.collection('lectures');
    
    const course = await coursesCollection.findOne({});
    if (!course) {
      console.log('❌ Không tìm thấy course. Vui lòng tạo course trước.');
      return;
    }
    
    const lecture = await lecturesCollection.findOne({ courseId: course._id });
    if (!lecture) {
      console.log('❌ Không tìm thấy lecture. Vui lòng tạo lecture trước.');
      return;
    }
    
    console.log(`📚 Sử dụng Course: ${course.title}`);
    console.log(`📖 Sử dụng Lecture: ${lecture.title}`);
    
    // Collections
    const quizzesCollection = db.collection('quizzes');
    const questionsCollection = db.collection('quiz_questions');
    const answersCollection = db.collection('answers');
    const attemptsCollection = db.collection('quiz_attempts');
    
    // Clear existing quiz data
    await quizzesCollection.deleteMany({});
    await questionsCollection.deleteMany({});
    await answersCollection.deleteMany({});
    await attemptsCollection.deleteMany({});
    console.log('🗑️ Đã xóa dữ liệu quiz cũ');
    
    // Create Quiz
    const quizId = new ObjectId();
    const quiz: SeedQuiz = {
      _id: quizId,
      lectureId: lecture._id,
      courseId: course._id,
      title: 'Bài kiểm tra kiến thức cơ bản',
      passingScore: 60,
      timeLimit: 15,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await quizzesCollection.insertOne(quiz);
    console.log('✅ Đã tạo Quiz:', quiz.title);
    
    // Create Answers and Questions
    const allAnswers: SeedAnswer[] = [];
    const allQuestions: SeedQuestion[] = [];
    
    // Question 1: Multiple Choice (Single Answer)
    const q1Answers = [
      { _id: new ObjectId(), text: 'JavaScript', createdAt: new Date() },
      { _id: new ObjectId(), text: 'Python', createdAt: new Date() },
      { _id: new ObjectId(), text: 'Java', createdAt: new Date() },
      { _id: new ObjectId(), text: 'C++', createdAt: new Date() }
    ];
    allAnswers.push(...q1Answers);
    
    allQuestions.push({
      _id: new ObjectId(),
      quizId: quizId,
      questionText: 'Ngôn ngữ lập trình nào được sử dụng phổ biến nhất cho phát triển web frontend?',
      answerIds: q1Answers.map(a => a._id),
      correctAnswerIds: [q1Answers[0]._id], // JavaScript
      requiredAnswers: 1,
      type: QuizType.MULTIPLE_CHOICE,
      createdAt: new Date()
    });
    
    // Question 2: Multiple Choice (Multiple Answers)
    const q2Answers = [
      { _id: new ObjectId(), text: 'React', createdAt: new Date() },
      { _id: new ObjectId(), text: 'Angular', createdAt: new Date() },
      { _id: new ObjectId(), text: 'Vue.js', createdAt: new Date() },
      { _id: new ObjectId(), text: 'MySQL', createdAt: new Date() }
    ];
    allAnswers.push(...q2Answers);
    
    allQuestions.push({
      _id: new ObjectId(),
      quizId: quizId,
      questionText: 'Những framework/library nào sau đây dùng cho frontend? (Chọn nhiều đáp án)',
      answerIds: q2Answers.map(a => a._id),
      correctAnswerIds: [q2Answers[0]._id, q2Answers[1]._id, q2Answers[2]._id], // React, Angular, Vue.js
      requiredAnswers: 3,
      type: QuizType.MULTIPLE_CHOICE,
      createdAt: new Date()
    });
    
    // Question 3: Multiple Choice (Single Answer)
    const q3Answers = [
      { _id: new ObjectId(), text: 'HTML', createdAt: new Date() },
      { _id: new ObjectId(), text: 'CSS', createdAt: new Date() },
      { _id: new ObjectId(), text: 'JavaScript', createdAt: new Date() },
      { _id: new ObjectId(), text: 'Tất cả các đáp án trên', createdAt: new Date() }
    ];
    allAnswers.push(...q3Answers);
    
    allQuestions.push({
      _id: new ObjectId(),
      quizId: quizId,
      questionText: 'Để tạo một trang web hoàn chỉnh, bạn cần biết những công nghệ nào?',
      answerIds: q3Answers.map(a => a._id),
      correctAnswerIds: [q3Answers[3]._id], // Tất cả
      requiredAnswers: 1,
      type: QuizType.MULTIPLE_CHOICE,
      createdAt: new Date()
    });
    
    // Question 4: Multiple Choice with Image
    const q4Answers = [
      { _id: new ObjectId(), text: 'Flexbox', createdAt: new Date() },
      { _id: new ObjectId(), text: 'Grid', createdAt: new Date() },
      { _id: new ObjectId(), text: 'Float', createdAt: new Date() },
      { _id: new ObjectId(), text: 'Position', createdAt: new Date() }
    ];
    allAnswers.push(...q4Answers);
    
    allQuestions.push({
      _id: new ObjectId(),
      quizId: quizId,
      questionText: 'CSS layout nào được khuyến khích sử dụng cho responsive design hiện đại?',
      answerIds: q4Answers.map(a => a._id),
      correctAnswerIds: [q4Answers[0]._id, q4Answers[1]._id], // Flexbox và Grid
      requiredAnswers: 2,
      type: QuizType.MULTIPLE_CHOICE,
      createdAt: new Date()
    });
    
    // Question 5: Multiple Choice (Single Answer)
    const q5Answers = [
      { _id: new ObjectId(), text: 'npm', createdAt: new Date() },
      { _id: new ObjectId(), text: 'yarn', createdAt: new Date() },
      { _id: new ObjectId(), text: 'pnpm', createdAt: new Date() },
      { _id: new ObjectId(), text: 'Tất cả đều đúng', createdAt: new Date() }
    ];
    allAnswers.push(...q5Answers);
    
    allQuestions.push({
      _id: new ObjectId(),
      quizId: quizId,
      questionText: 'Package manager nào được sử dụng trong Node.js ecosystem?',
      answerIds: q5Answers.map(a => a._id),
      correctAnswerIds: [q5Answers[3]._id], // Tất cả đều đúng
      requiredAnswers: 1,
      type: QuizType.MULTIPLE_CHOICE,
      createdAt: new Date()
    });
    
    // Insert all answers
    await answersCollection.insertMany(allAnswers);
    console.log(`✅ Đã tạo ${allAnswers.length} Answers`);
    
    // Insert all questions
    await questionsCollection.insertMany(allQuestions);
    console.log(`✅ Đã tạo ${allQuestions.length} Questions`);
    
    // Summary
    console.log('\n📊 Tổng kết:');
    console.log(`   - Quiz: 1`);
    console.log(`   - Questions: ${allQuestions.length}`);
    console.log(`   - Answers: ${allAnswers.length}`);
    console.log(`   - Passing Score: ${quiz.passingScore}%`);
    console.log(`   - Time Limit: ${quiz.timeLimit} phút`);
    
    console.log('\n✅ Seed quiz data hoàn tất!');
    
  } catch (error) {
    console.error('❌ Lỗi seed data:', error);
  } finally {
    await client.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Run seed
seedQuizData();
