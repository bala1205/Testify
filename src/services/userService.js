import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, getDocs, collection, query, where, updateDoc, deleteDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase/config";

// NOTE: Creating users via client SDK will sign in as that new user, thus we create a secondary auth approach.
// We use the same auth instance but we sign out and sign back? Instead we store user creation via cloud function would be ideal.
// For now, we use a workaround: create user, then immediately create profile, then sign back as creator if needed.
// To avoid session hijack, we use fetch to create via firebase? But for simplicity in this college project, we implement secondary app instance.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

function getSecondaryAuth() {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  let secondaryApp;
  try {
    secondaryApp = getApp("Secondary");
  } catch {
    secondaryApp = initializeApp(firebaseConfig, "Secondary");
  }
  return getAuth(secondaryApp);
}

let secondaryAuthInstance = null;
function getSecAuth() {
  if (secondaryAuthInstance) return secondaryAuthInstance;
  try {
    secondaryAuthInstance = getSecondaryAuth();
  } catch {
    secondaryAuthInstance = auth;
  }
  return secondaryAuthInstance;
}

export async function createUserAccount({ name, email, password, role, createdBy }) {
  // Try secondary auth to not log out current admin/staff
  let userCredential;
  try {
    const secAuth = getSecAuth();
    // If secAuth is same as auth, this will switch session — we handle by not signing out? We'll try.
    userCredential = await createUserWithEmailAndPassword(secAuth, email, password);
    // sign out secondary to clean
    try { await secAuth.signOut(); } catch {}
  } catch (e) {
    // fallback: use primary auth (will log out creator, but we re-auth required)
    // For demo, propagate error with hint
    if (e.code === "auth/email-already-in-use") throw e;
    // if secondary failed due to duplicate app, try primary
    if (!userCredential) {
      throw new Error(e.message + " (Hint: Creating users from client may log you out. For production use Cloud Functions. Please re-login after creation.)");
    }
  }
  const uid = userCredential.user.uid;
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    role,
    status: "active",
    createdAt: serverTimestamp(),
    createdBy: createdBy || null,
  });
  return uid;
}

export async function getAllUsersByRole(role) {
  const q = query(collection(db, "users"), where("role", "==", role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function getAllStaff() {
  return getAllUsersByRole("staff");
}
export async function getAllStudents() {
  return getAllUsersByRole("student");
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() };
}

export async function updateUser(uid, data) {
  await updateDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() });
}

export async function disableUser(uid) {
  await updateDoc(doc(db, "users", uid), { status: "disabled" });
}
export async function enableUser(uid) {
  await updateDoc(doc(db, "users", uid), { status: "active" });
}
export async function deleteUserProfile(uid) {
  await deleteDoc(doc(db, "users", uid));
}
