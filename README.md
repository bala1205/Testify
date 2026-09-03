# Testify — Smart. Secure. Simple.

Online Examination System for colleges. Role-based (Admin / Staff / Student), fullscreen proctored exams, malpractice detection, auto-scoring, Firebase backend.

## Stack
- React 19 + Vite 8
- React Router 7
- Tailwind CSS 3.4
- Firebase Auth + Firestore

## Setup

1. **Create Firebase Project** `Testify` at https://console.firebase.google.com/
   - Enable **Authentication → Email/Password**
   - Enable **Firestore Database** (start in test mode, then deploy rules from `firestore.rules`)
   - Create Web App → copy config

2. **Env**
```bash
cp .env.example .env
# fill VITE_FIREBASE_* from Firebase Web App config
```

3. **Run**
```bash
npm install
npm run dev
# http://localhost:5173
```

4. **Create initial users**
- In Firebase Console → Authentication → Add user: `admin@testify.edu` / `Admin@123`
- In Firestore → `users` collection → document id = UID of that auth user:
```json
{
  "name": "Admin",
  "email": "admin@testify.edu",
  "role": "admin",
  "status": "active",
  "createdAt": "serverTimestamp",
  "createdBy": null
}
```
- Login → you’ll be redirected to `/admin`.
- Then create Staff/Students via UI (Admin → Staff, Staff → Students).

5. **Deploy Rules**
```bash
firebase login
firebase deploy --only firestore:rules
# Hosting (optional)
npm run build
firebase deploy --only hosting
```

## Scripts
- `npm run dev` — dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview build

## Roles
- **Admin**: manage staff/students, all tests, all results, malpractice, resets
- **Staff**: create students, own tests/questions, assign students, view relevant results, reset attempts
- **Student**: only assigned tests, fullscreen exam, own results

## Malpractice — Honest Limitations
Detects: `fullscreenchange`, `visibilitychange` (tab switch), `blur`, `copy`/`paste`/`cut`/`contextmenu`, Ctrl shortcuts.
Cannot detect OS-level Alt+Tab, external devices, or activity outside browser. Communicated clearly before exam.

## Structure
```
src/
  firebase/config.js
  context/AuthContext.jsx
  hooks/useAuth, useMalpractice
  services/userService, testService, attemptService
  components/ui, layout, exam
  pages/{Landing,Login,admin,staff,student,shared}
  routes/AppRouter.jsx
  utils/constants, helpers
```
