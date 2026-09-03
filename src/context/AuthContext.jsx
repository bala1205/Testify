import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isConfigured } from "../firebase/config";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setError(null);
      if (!fbUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      setUser(fbUser);
      try {
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        if (!snap.exists()) {
          setError("User profile not found. Contact administrator.");
          setProfile(null);
          await signOut(auth);
          setUser(null);
        } else {
          const data = snap.data();
          if (!["admin", "staff", "student"].includes(data.role)) {
            setError("Invalid role assigned. Contact administrator.");
            setProfile(null);
            await signOut(auth);
            setUser(null);
          } else if (data.status === "disabled") {
            setError("Your account has been disabled.");
            setProfile(null);
            await signOut(auth);
            setUser(null);
          } else {
            setProfile({ uid: fbUser.uid, ...data });
          }
        }
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const login = async (email, password, selectedRole) => {
    setError(null);
    if (!selectedRole) {
      throw new Error("Please select your role.");
    }
    if (!["admin", "staff", "student"].includes(selectedRole)) {
      throw new Error("Invalid role selected.");
    }
    if (!isConfigured || !auth) {
      throw new Error("Firebase not configured. Please setup .env with your Firebase project credentials. See .env.example");
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists()) {
      await signOut(auth);
      throw new Error("No profile found for this user. Contact admin.");
    }
    const data = snap.data();
    if (!["admin", "staff", "student"].includes(data.role)) {
      await signOut(auth);
      throw new Error("Invalid role. Contact admin.");
    }
    if (data.status === "disabled") {
      await signOut(auth);
      throw new Error("Account disabled.");
    }
    if (data.role !== selectedRole) {
      await signOut(auth);
      throw new Error("Selected role does not match this account.");
    }
    setUser(cred.user);
    setProfile({ uid: cred.user.uid, ...data });
    return { uid: cred.user.uid, ...data };
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    role: profile?.role || null,
    loading,
    error,
    login,
    logout,
    isConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
