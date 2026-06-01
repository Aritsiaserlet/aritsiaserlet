// authManager.js
// Handles Firebase Initialization, Authentication, and abstracting Firestore calls

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  collectionGroup,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPk75vn7IO1AG_Sg7aBoLcoUsjnRlWgpk",
  authDomain: "aritsia-portfolio-database.firebaseapp.com",
  projectId: "aritsia-portfolio-database",
  storageBucket: "aritsia-portfolio-database.firebasestorage.app",
  messagingSenderId: "36831977897",
  appId: "1:36831977897:web:7aca7c2ff8d16235b7e4b8",
  measurementId: "G-WFT362VWCB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);

let currentUser = null;
const stateChangeCallbacks = [];

// ── Auth Logic ──

export function onUserChange(callback) {
  stateChangeCallbacks.push(callback);
  // trigger immediately with current state if loaded
  if (currentUser !== undefined) callback(currentUser);
}

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  
  if (user) {
    // Check if user document exists, if not create it (Milestone Architecture Rule 5)
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        highScore: 0,
        bestCombo: 0,
        totalScore: 0,
        gamesPlayed: 0,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        lastPlayed: null
      });
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        displayName: user.displayName, // sync in case they changed it
        photoURL: user.photoURL
      });
    }
  }

  // Notify listeners
  stateChangeCallbacks.forEach(cb => cb(currentUser));
});

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Login failed", error);
    // Show a non-blocking in-page error message
    const code = error.code || '';
    let msg = 'Login failed. Please try again.';
    if (code === 'auth/unauthorized-domain') {
      msg = '⚠ This domain is not authorized in Firebase.\nPlease add it to Firebase Console → Authentication → Authorized Domains.';
    } else if (code === 'auth/popup-closed-by-user') {
      return; // User closed popup — not an error
    } else if (code === 'auth/popup-blocked') {
      msg = '⚠ Popup was blocked by your browser. Please allow popups for this site.';
    }
    // Show a toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
      background:#c0392b;color:#fff;padding:12px 24px;
      font-family:'VT323',monospace;font-size:22px;z-index:9999;
      border:3px solid #7b241c;box-shadow:4px 4px 0 rgba(0,0,0,0.5);
      max-width:90vw;text-align:center;white-space:pre-line;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 6000);
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed", error);
  }
}

export function getCurrentUser() {
  return currentUser;
}

// ── Likes System ──
// Source of truth: users/{uid}/likes/{workId}
// works.likes is a derived field — only a Cloud Function should write it.

export async function fetchLikeCounts() {
  // Count likes per workId by querying the collectionGroup 'likes'.
  // This avoids reading works.likes directly (which is a client-untrusted aggregation).
  try {
    const snap = await getDocs(collectionGroup(db, 'likes'));
    const likeData = {};
    snap.forEach(docSnap => {
      // Document ID is the workId
      const workId = docSnap.id;
      likeData[workId] = (likeData[workId] || 0) + 1;
    });
    return likeData;
  } catch (error) {
    console.error("Failed to fetch like counts", error);
    return {};
  }
}

export async function fetchUserLikes(uid) {
  try {
    const likesSnap = await getDocs(collection(db, `users/${uid}/likes`));
    const userLikes = {};
    likesSnap.forEach(docSnap => {
      userLikes[docSnap.id] = true;
    });
    return userLikes;
  } catch (error) {
    console.error("Failed to fetch user likes", error);
    return {};
  }
}

export async function toggleLike(workId, isLiking) {
  if (!currentUser) return false;
  
  const uid = currentUser.uid;
  // SECURITY: Only write to users/{uid}/likes/{workId}.
  // Never write to works/{workId}.likes — that's the Cloud Function's job.
  const userLikeRef = doc(db, `users/${uid}/likes`, workId);

  try {
    if (isLiking) {
      await setDoc(userLikeRef, { createdAt: serverTimestamp() });
    } else {
      await deleteDoc(userLikeRef);
    }
    return true;
  } catch (error) {
    console.error("Failed to toggle like", error);
    return false;
  }
}
