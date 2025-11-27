import { CreateQuizQuestionRequest, UpdateQuizQuestionRequest, QuizQuestion, QuizQuestionResponse, QuizQuestionStudentResponse } from "../types/quizQuestion/request";
import * as quizQuestionModel from '../model/quizQuestion.js';
import * as quizModel from '../model/quiz.js';
import * as quizService from './quiz.js';
import * as answerModel from '../model/answer.js';
import { QuizQuestionMessage } from '../types/quizQuestion/enums.js';
import * as XLSX from 'xlsx';
import { QuizType } from '../types/common/enums.js';

/**
 * Verify quiz ownership by instructor
 */
const verifyQuizOwnership = async (quizId: string, instructorId: string): Promise<void> => {
  const quiz = await quizModel.getQuizById(quizId);
  if (!quiz) {
    throw new Error('Không tìm thấy quiz');
  }

  // Use quiz service to verify course ownership
  const quizResponse = await quizService.getQuizById(quizId);
  const courseId = quizResponse.courseId;
  
  const courseService = await import('./course.js');
  const hasAccess = await courseService.verifyCourseInstructor(courseId, instructorId);
  if (!hasAccess) {
    throw new Error('Bạn không có quyền truy cập quiz này');
  }
};

/**
 * Create a new quiz question (instructor only)
 */
export const createQuizQuestion = async (
  questionData: CreateQuizQuestionRequest,
  instructorId: string
): Promise<QuizQuestionResponse> => {
  // Verify that the instructor owns the quiz
  await verifyQuizOwnership(questionData.quizId, instructorId);

  // Validate correctAnswerIndices are within answers range
  for (const index of questionData.correctAnswerIndices) {
    if (index >= questionData.answers.length) {
      throw new Error('Chỉ số đáp án đúng vượt quá số lượng đáp án');
    }
  }

  const question = await quizQuestionModel.createQuizQuestion(questionData);
  
  if (!question) {
    throw new Error(QuizQuestionMessage.FAIL_CREATE);
  }

  // Get populated answers
  const answerIds = question.answerIds.map(id => id.toString());
  const answers = await answerModel.getAnswersByIds(answerIds);

  // Convert ObjectId to string for response
  const response: QuizQuestionResponse = {
    ...question,
    quizId: question.quizId.toString(),
    answers: answers,
    correctAnswerIds: question.correctAnswerIds.map(id => id.toString())
  };

  return response;
};

/**
 * Get quiz question by ID with answers (public)
 */
export const getQuizQuestionById = async (questionId: string): Promise<QuizQuestionResponse> => {
  const question = await quizQuestionModel.getQuizQuestionById(questionId);
  
  if (!question) {
    throw new Error(QuizQuestionMessage.QUESTION_NOT_FOUND);
  }

  // Get populated answers
  const answerIds = question.answerIds.map(id => id.toString());
  const answers = await answerModel.getAnswersByIds(answerIds);

  // Convert ObjectId to string for response
  const response: QuizQuestionResponse = {
    ...question,
    quizId: question.quizId.toString(),
    answers: answers,
    correctAnswerIds: question.correctAnswerIds.map(id => id.toString())
  };

  return response;
};

/**
 * Get questions by quiz ID with answers (for instructor)
 */
export const getQuestionsByQuizId = async (quizId: string): Promise<QuizQuestionResponse[]> => {
  // First verify that the quiz exists
  await quizService.getQuizById(quizId);

  // Use the model function that populates answers
  return await quizQuestionModel.getQuestionsByQuizIdWithAnswers(quizId);
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get questions by quiz ID for student (without correct answers, shuffled)
 */
export const getQuestionsByQuizIdForStudent = async (quizId: string): Promise<QuizQuestionStudentResponse[]> => {
  // First verify that the quiz exists
  await quizService.getQuizById(quizId);

  const questions = await quizQuestionModel.getQuestionsByQuizIdWithAnswers(quizId);
  
  // Shuffle questions and answers, remove correctAnswerIds
  const shuffledQuestions = shuffleArray(questions).map(({ correctAnswerIds, answers, ...rest }) => ({
    ...rest,
    answers: shuffleArray(answers) // Shuffle answers within each question
  }));

  return shuffledQuestions;
};

/**
 * Update quiz question by ID (instructor only)
 */
export const updateQuizQuestion = async (
  questionId: string,
  instructorId: string,
  updateData: UpdateQuizQuestionRequest
): Promise<QuizQuestionResponse> => {
  // First get the question to verify ownership
  const question = await quizQuestionModel.getQuizQuestionById(questionId);
  if (!question) {
    throw new Error(QuizQuestionMessage.QUESTION_NOT_FOUND);
  }

  // Verify that the instructor owns the quiz
  await verifyQuizOwnership(question.quizId.toString(), instructorId);

  // Validate correctAnswerIds if provided
  if (updateData.correctAnswerIds && updateData.answerIds) {
    // Check that all correctAnswerIds are in answerIds
    for (const correctId of updateData.correctAnswerIds) {
      if (!updateData.answerIds.includes(correctId)) {
        throw new Error('Đáp án đúng phải nằm trong danh sách đáp án');
      }
    }
  } else if (updateData.correctAnswerIds) {
    // Check against existing answerIds
    const existingAnswerIds = question.answerIds.map(id => id.toString());
    for (const correctId of updateData.correctAnswerIds) {
      if (!existingAnswerIds.includes(correctId)) {
        throw new Error('Đáp án đúng phải nằm trong danh sách đáp án hiện tại');
      }
    }
  }

  const updatedQuestion = await quizQuestionModel.updateQuizQuestion(questionId, updateData);
  
  if (!updatedQuestion) {
    throw new Error(QuizQuestionMessage.FAIL_UPDATE);
  }

  // Get populated answers
  const answerIds = updatedQuestion.answerIds.map(id => id.toString());
  const answers = await answerModel.getAnswersByIds(answerIds);

  // Convert ObjectId to string for response
  const response: QuizQuestionResponse = {
    ...updatedQuestion,
    quizId: updatedQuestion.quizId.toString(),
    answers: answers,
    correctAnswerIds: updatedQuestion.correctAnswerIds.map(id => id.toString())
  };

  return response;
};

/**
 * Delete quiz question by ID with its answers (instructor only)
 */
export const deleteQuizQuestion = async (questionId: string, instructorId: string): Promise<boolean> => {
  // First get the question to verify ownership
  const question = await quizQuestionModel.getQuizQuestionById(questionId);
  if (!question) {
    throw new Error(QuizQuestionMessage.QUESTION_NOT_FOUND);
  }

  // Verify that the instructor owns the quiz
  await verifyQuizOwnership(question.quizId.toString(), instructorId);

  // Delete question with its answers
  const success = await quizQuestionModel.deleteQuizQuestionWithAnswers(questionId);
  
  if (!success) {
    throw new Error(QuizQuestionMessage.FAIL_DELETE);
  }

  return true;
};

/**
 * Delete all questions by quiz ID (when quiz is deleted)
 */
export const deleteQuestionsByQuizId = async (quizId: string): Promise<boolean> => {
  return await quizQuestionModel.deleteQuestionsByQuizId(quizId);
};

/**
 * Interface for parsed question from CSV/XLSX
 */
interface ParsedQuestion {
  questionText: string;
  type: QuizType;
  answers: { text: string }[];
  correctAnswerIndices: number[];
}

/**
 * Import quiz questions from CSV/XLSX file buffer
 * Format: questionText | type | answer1 | answer2 | answer3 | answer4 | answer5 | answer6 | correctAnswers
 * - type: MULTIPLE_CHOICE or FILL_BLANK (default: MULTIPLE_CHOICE)
 * - correctAnswers: comma-separated 1-indexed answer positions (e.g., "1,3" means answer1 and answer3 are correct)
 */
export const importQuestionsFromFile = async (
  quizId: string,
  instructorId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<{ success: number; failed: number; errors: string[] }> => {
  // Verify that the instructor owns the quiz
  await verifyQuizOwnership(quizId, instructorId);

  // Parse the file
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON with header row
  const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { 
    header: 1,
    defval: ''
  }) as any[][];

  if (rawData.length < 2) {
    throw new Error('File phải có ít nhất 1 dòng header và 1 dòng dữ liệu');
  }

  // Get header row (first row)
  const headers = rawData[0].map((h: any) => String(h).toLowerCase().trim());
  
  // Find column indices
  const questionTextIdx = headers.findIndex((h: string) => h.includes('question') || h.includes('câu hỏi'));
  const typeIdx = headers.findIndex((h: string) => h === 'type' || h.includes('loại'));
  const correctAnswersIdx = headers.findIndex((h: string) => 
    h.includes('correct') || h.includes('đáp án đúng') || h.includes('dap an dung')
  );
  
  // Find answer columns (answer1, answer2, etc. or đáp án 1, đáp án 2, etc.)
  const answerIndices: number[] = [];
  headers.forEach((h: string, idx: number) => {
    if ((h.includes('answer') || h.includes('đáp án') || h.includes('dap an')) && 
        !h.includes('correct') && !h.includes('đúng') && !h.includes('dung')) {
      answerIndices.push(idx);
    }
  });

  if (questionTextIdx === -1) {
    throw new Error('Không tìm thấy cột "questionText" hoặc "câu hỏi" trong file');
  }

  if (answerIndices.length < 2) {
    throw new Error('Cần ít nhất 2 cột đáp án (answer1, answer2 hoặc đáp án 1, đáp án 2)');
  }

  if (correctAnswersIdx === -1) {
    throw new Error('Không tìm thấy cột "correctAnswers" hoặc "đáp án đúng" trong file');
  }

  // Parse data rows
  const parsedQuestions: ParsedQuestion[] = [];
  const errors: string[] = [];

  for (let rowIdx = 1; rowIdx < rawData.length; rowIdx++) {
    const row = rawData[rowIdx];
    const rowNum = rowIdx + 1; // 1-indexed for user display

    try {
      // Get question text
      const questionText = String(row[questionTextIdx] || '').trim();
      if (!questionText) {
        errors.push(`Dòng ${rowNum}: Câu hỏi trống`);
        continue;
      }

      // Get type (default to MULTIPLE_CHOICE)
      let type = QuizType.MULTIPLE_CHOICE;
      if (typeIdx !== -1) {
        const typeValue = String(row[typeIdx] || '').toLowerCase().trim();
        if (typeValue.includes('fill') || typeValue.includes('blank') || typeValue.includes('điền')) {
          type = QuizType.FILL_BLANK;
        }
      }

      // Get answers
      const answers: { text: string }[] = [];
      for (const ansIdx of answerIndices) {
        const answerText = String(row[ansIdx] || '').trim();
        if (answerText) {
          answers.push({ text: answerText });
        }
      }

      if (answers.length < 2) {
        errors.push(`Dòng ${rowNum}: Cần ít nhất 2 đáp án`);
        continue;
      }

      // Get correct answer indices (1-indexed in file, convert to 0-indexed)
      const correctAnswersStr = String(row[correctAnswersIdx] || '').trim();
      if (!correctAnswersStr) {
        errors.push(`Dòng ${rowNum}: Chưa chỉ định đáp án đúng`);
        continue;
      }

      const correctAnswerIndices: number[] = [];
      const correctParts = correctAnswersStr.split(/[,;]/);
      for (const part of correctParts) {
        const idx = parseInt(part.trim(), 10);
        if (isNaN(idx) || idx < 1 || idx > answers.length) {
          errors.push(`Dòng ${rowNum}: Chỉ số đáp án đúng "${part}" không hợp lệ (phải từ 1 đến ${answers.length})`);
          continue;
        }
        correctAnswerIndices.push(idx - 1); // Convert to 0-indexed
      }

      if (correctAnswerIndices.length === 0) {
        errors.push(`Dòng ${rowNum}: Không có đáp án đúng hợp lệ`);
        continue;
      }

      parsedQuestions.push({
        questionText,
        type,
        answers,
        correctAnswerIndices
      });
    } catch (err) {
      errors.push(`Dòng ${rowNum}: Lỗi xử lý - ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Create questions
  let success = 0;
  let failed = 0;

  for (const parsedQ of parsedQuestions) {
    try {
      const questionData: CreateQuizQuestionRequest = {
        quizId,
        questionText: parsedQ.questionText,
        type: parsedQ.type,
        answers: parsedQ.answers,
        correctAnswerIndices: parsedQ.correctAnswerIndices
      };

      await quizQuestionModel.createQuizQuestion(questionData);
      success++;
    } catch (err) {
      failed++;
      errors.push(`Câu hỏi "${parsedQ.questionText.substring(0, 30)}...": ${err instanceof Error ? err.message : 'Lỗi tạo câu hỏi'}`);
    }
  }

  return { success, failed, errors };
};

/**
 * Preview parsed questions from CSV/XLSX file (without saving)
 */
export const previewQuestionsFromFile = async (
  fileBuffer: Buffer,
  fileName: string
): Promise<{ 
  questions: Array<{
    questionText: string;
    type: string;
    answers: string[];
    correctAnswers: number[];
  }>;
  errors: string[];
}> => {
  // Parse the file
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON with header row
  const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { 
    header: 1,
    defval: ''
  }) as any[][];

  if (rawData.length < 2) {
    throw new Error('File phải có ít nhất 1 dòng header và 1 dòng dữ liệu');
  }

  // Get header row (first row)
  const headers = rawData[0].map((h: any) => String(h).toLowerCase().trim());
  
  // Find column indices
  const questionTextIdx = headers.findIndex((h: string) => h.includes('question') || h.includes('câu hỏi'));
  const typeIdx = headers.findIndex((h: string) => h === 'type' || h.includes('loại'));
  const correctAnswersIdx = headers.findIndex((h: string) => 
    h.includes('correct') || h.includes('đáp án đúng') || h.includes('dap an dung')
  );
  
  // Find answer columns
  const answerIndices: number[] = [];
  headers.forEach((h: string, idx: number) => {
    if ((h.includes('answer') || h.includes('đáp án') || h.includes('dap an')) && 
        !h.includes('correct') && !h.includes('đúng') && !h.includes('dung')) {
      answerIndices.push(idx);
    }
  });

  if (questionTextIdx === -1) {
    throw new Error('Không tìm thấy cột "questionText" hoặc "câu hỏi" trong file');
  }

  if (answerIndices.length < 2) {
    throw new Error('Cần ít nhất 2 cột đáp án (answer1, answer2 hoặc đáp án 1, đáp án 2)');
  }

  if (correctAnswersIdx === -1) {
    throw new Error('Không tìm thấy cột "correctAnswers" hoặc "đáp án đúng" trong file');
  }

  // Parse data rows
  const questions: Array<{
    questionText: string;
    type: string;
    answers: string[];
    correctAnswers: number[];
  }> = [];
  const errors: string[] = [];

  for (let rowIdx = 1; rowIdx < rawData.length; rowIdx++) {
    const row = rawData[rowIdx];
    const rowNum = rowIdx + 1;

    try {
      const questionText = String(row[questionTextIdx] || '').trim();
      if (!questionText) {
        errors.push(`Dòng ${rowNum}: Câu hỏi trống`);
        continue;
      }

      let type = 'MULTIPLE_CHOICE';
      if (typeIdx !== -1) {
        const typeValue = String(row[typeIdx] || '').toLowerCase().trim();
        if (typeValue.includes('fill') || typeValue.includes('blank') || typeValue.includes('điền')) {
          type = 'FILL_BLANK';
        }
      }

      const answers: string[] = [];
      for (const ansIdx of answerIndices) {
        const answerText = String(row[ansIdx] || '').trim();
        if (answerText) {
          answers.push(answerText);
        }
      }

      if (answers.length < 2) {
        errors.push(`Dòng ${rowNum}: Cần ít nhất 2 đáp án`);
        continue;
      }

      const correctAnswersStr = String(row[correctAnswersIdx] || '').trim();
      if (!correctAnswersStr) {
        errors.push(`Dòng ${rowNum}: Chưa chỉ định đáp án đúng`);
        continue;
      }

      const correctAnswers: number[] = [];
      const correctParts = correctAnswersStr.split(/[,;]/);
      for (const part of correctParts) {
        const idx = parseInt(part.trim(), 10);
        if (isNaN(idx) || idx < 1 || idx > answers.length) {
          errors.push(`Dòng ${rowNum}: Chỉ số đáp án đúng "${part}" không hợp lệ`);
          continue;
        }
        correctAnswers.push(idx);
      }

      if (correctAnswers.length === 0) {
        errors.push(`Dòng ${rowNum}: Không có đáp án đúng hợp lệ`);
        continue;
      }

      questions.push({
        questionText,
        type,
        answers,
        correctAnswers
      });
    } catch (err) {
      errors.push(`Dòng ${rowNum}: Lỗi xử lý - ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return { questions, errors };
};

/**
 * Export quiz questions to XLSX file
 */
export const exportQuestionsToFile = async (quizId: string): Promise<Buffer> => {
  // Get questions with answers
  const questions = await getQuestionsByQuizId(quizId);
  
  if (questions.length === 0) {
    throw new Error('Không có câu hỏi nào để export');
  }

  // Build data rows
  const header = ['questionText', 'type', 'answer1', 'answer2', 'answer3', 'answer4', 'answer5', 'answer6', 'correctAnswers'];
  const rows: (string | number)[][] = [header];

  for (const question of questions) {
    const row: (string | number)[] = [
      question.questionText,
      question.type === QuizType.MULTIPLE_CHOICE ? 'MULTIPLE_CHOICE' : 'FILL_BLANK',
    ];

    // Add answers (up to 6)
    const answers = question.answers || [];
    for (let i = 0; i < 6; i++) {
      row.push(answers[i]?.text || '');
    }

    // Find correct answer indices (1-indexed)
    const correctIndices: number[] = [];
    const correctAnswerIdStrings = question.correctAnswerIds || [];
    answers.forEach((ans, idx) => {
      if (correctAnswerIdStrings.includes(ans._id?.toString() || '')) {
        correctIndices.push(idx + 1);
      }
    });
    row.push(correctIndices.join(','));

    rows.push(row);
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 50 }, // questionText
    { wch: 18 }, // type
    { wch: 25 }, // answer1
    { wch: 25 }, // answer2
    { wch: 25 }, // answer3
    { wch: 25 }, // answer4
    { wch: 25 }, // answer5
    { wch: 25 }, // answer6
    { wch: 15 }, // correctAnswers
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
  
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
};

/**
 * Generate sample template for import
 */
export const generateImportTemplate = (): Buffer => {
  const templateData = [
    ['questionText', 'type', 'answer1', 'answer2', 'answer3', 'answer4', 'correctAnswers'],
    ['Thủ đô của Việt Nam là gì?', 'MULTIPLE_CHOICE', 'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Huế', '1'],
    ['JavaScript là ngôn ngữ gì?', 'MULTIPLE_CHOICE', 'Lập trình', 'Markup', 'Styling', 'Database', '1'],
    ['Chọn các ngôn ngữ lập trình:', 'MULTIPLE_CHOICE', 'Python', 'HTML', 'Java', 'CSS', '1,3'],
    ['2 + 2 = ___', 'FILL_BLANK', '4', '5', '', '', '1'],
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(templateData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 40 }, // questionText
    { wch: 15 }, // type
    { wch: 20 }, // answer1
    { wch: 20 }, // answer2
    { wch: 20 }, // answer3
    { wch: 20 }, // answer4
    { wch: 15 }, // correctAnswers
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
};
