import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";

export async function createAttempt({ studentId, testId, totalQuestions }) {
  const ref = await addDoc(collection(db, "attempts"), {
    studentId,
    testId,
    answers: {},
    score: 0,
    totalQuestions,
    percentage: 0,
    malpracticeCount: 0,
    status: "in_progress",
    startedAt: serverTimestamp(),
    submittedAt: null,
    resetAt: null,
    resetBy: null,
    terminatedAt: null,
    terminationReason: null,
  });
  return ref.id;
}

export async function getAttemptById(attemptId) {
  const snap = await getDoc(doc(db, "attempts", attemptId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getStudentAttempts(studentId) {
  const q = query(collection(db, "attempts"), where("studentId", "==", studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAttemptForTest(studentId, testId) {
  const q = query(
    collection(db, "attempts"),
    where("studentId", "==", studentId),
    where("testId", "==", testId)
  );
  const snap = await getDocs(q);
  // return latest non-reset? There might be multiple due to reset. We want latest completed/in_progress.
  // Prefer in_progress or completed that is not reset? Actually reset status is "reset".
  const attempts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // sort by startedAt desc
  attempts.sort((a, b) => {
    const aTime = a.startedAt?.toMillis ? a.startedAt.toMillis() : 0;
    const bTime = b.startedAt?.toMillis ? b.startedAt.toMillis() : 0;
    return bTime - aTime;
  });
  // find first not reset
  const active = attempts.find((a) => a.status !== "reset");
  return active || null;
}

export async function updateAttempt(attemptId, data) {
  await updateDoc(doc(db, "attempts", attemptId), data);
}

export async function submitAttempt(attemptId, { answers, score, totalQuestions, percentage, malpracticeCount }) {
  await updateDoc(doc(db, "attempts", attemptId), {
    answers,
    score,
    totalQuestions,
    percentage,
    malpracticeCount,
    status: "completed",
    submittedAt: serverTimestamp(),
  });
}

export async function terminateAttempt(attemptId, { answers, score, totalQuestions, percentage, eventType }) {
  // Save final state and mark as terminated due to malpractice
  // Note: malpracticeCount is handled by logMalpracticeEvent (increment), so we don't overwrite it here
  const payload = {
    answers: answers || {},
    score: score ?? 0,
    totalQuestions: totalQuestions ?? 0,
    percentage: percentage ?? 0,
    status: "terminated",
    terminationReason: "malpractice",
    terminationEvent: eventType || null,
    terminatedAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  };
  await updateDoc(doc(db, "attempts", attemptId), payload);
}

export async function saveAnswer(attemptId, questionId, answer) {
  const ref = doc(db, "attempts", attemptId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = snap.data().answers || {};
  await updateDoc(ref, {
    answers: { ...current, [questionId]: answer },
  });
}

export async function logMalpracticeEvent(attemptId, { studentId, testId, eventType }) {
  const eventRef = await addDoc(collection(db, "attempts", attemptId, "malpracticeEvents"), {
    studentId,
    testId,
    eventType,
    timestamp: serverTimestamp(),
  });
  // increment malpracticeCount
  const attemptSnap = await getDoc(doc(db, "attempts", attemptId));
  if (attemptSnap.exists()) {
    const current = attemptSnap.data().malpracticeCount || 0;
    await updateDoc(doc(db, "attempts", attemptId), {
      malpracticeCount: current + 1,
    });
  }
  return eventRef.id;
}

export async function getMalpracticeEvents(attemptId) {
  const snap = await getDocs(collection(db, "attempts", attemptId, "malpracticeEvents"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllAttempts() {
  const snap = await getDocs(collection(db, "attempts"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAttemptsForTest(testId) {
  const q = query(collection(db, "attempts"), where("testId", "==", testId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function resetAttempt(attemptId, resetByUid) {
  // mark previous as reset, keep history
  await updateDoc(doc(db, "attempts", attemptId), {
    status: "reset",
    resetAt: serverTimestamp(),
    resetBy: resetByUid,
  });
}

export async function getResultsForStudent(studentId) {
  const q = query(collection(db, "attempts"), where("studentId", "==", studentId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((a) => a.status === "completed" || a.status === "terminated")
    .sort((a, b) => {
      const aT = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : a.terminatedAt?.toMillis ? a.terminatedAt.toMillis() : 0;
      const bT = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : b.terminatedAt?.toMillis ? b.terminatedAt.toMillis() : 0;
      return bT - aT;
    });
}
