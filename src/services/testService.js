import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";

export async function createTest({ title, description, durationMinutes, startTime, endTime, assignedStudents, createdBy, createdByRole }) {
  const ref = await addDoc(collection(db, "tests"), {
    title,
    description,
    durationMinutes: Number(durationMinutes),
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    assignedStudents: assignedStudents || [],
    createdBy,
    createdByRole,
    status: "published",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTest(testId, data) {
  await updateDoc(doc(db, "tests", testId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTest(testId) {
  // delete questions subcollection? For MVP, just delete test doc; questions remain orphaned but okay
  // Ideally delete subcollection via batch — we attempt to delete questions
  try {
    const qSnap = await getDocs(collection(db, "tests", testId, "questions"));
    const deletes = qSnap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletes);
  } catch {}
  await deleteDoc(doc(db, "tests", testId));
}

export async function getAllTests() {
  const snap = await getDocs(query(collection(db, "tests"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTestsByCreator(uid) {
  const q = query(collection(db, "tests"), where("createdBy", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAssignedTests(studentUid) {
  const q = query(collection(db, "tests"), where("assignedStudents", "array-contains", studentUid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTestById(testId) {
  const snap = await getDoc(doc(db, "tests", testId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Questions
export async function addQuestion(testId, { question, options, correctAnswer, order }) {
  const ref = await addDoc(collection(db, "tests", testId, "questions"), {
    question,
    options, // {A,B,C,D}
    correctAnswer, // "A"|"B"|"C"|"D"
    order: order ?? 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateQuestion(testId, questionId, data) {
  await updateDoc(doc(db, "tests", testId, "questions", questionId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteQuestion(testId, questionId) {
  await deleteDoc(doc(db, "tests", testId, "questions", questionId));
}

export async function getQuestions(testId) {
  const snap = await getDocs(collection(db, "tests", testId, "questions"));
  const questions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // sort by order
  return questions.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getQuestionsForStudent(testId) {
  // Returns questions WITHOUT correctAnswer
  const questions = await getQuestions(testId);
  return questions.map(({ correctAnswer, ...rest }) => rest);
}
