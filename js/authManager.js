// =============================================================================
// ARITSIA PORTFOLIO - Auth Manager
// authManager.js
//
// Handles Firebase initialization, Google Authentication, and Firestore
// operations for the likes system.
//
// Dependencies:
//   Firebase App, Auth, Firestore (loaded from gstatic CDN)
//   Firebase config is embedded inline — see firebaseConfig below.
//
// Exports:
//   loginWithGoogle() / logout() / onUserChange(callback)
//   fetchLikeCounts() — returns { [workId]: count } from Firestore
//   fetchUserLikes(uid) — returns { [workId]: true } set for a user
//   toggleLike(workId, isLiking) — add or remove a like in Firestore
//   db — the Firestore instance (for advanced use)
// =============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
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
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
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
export const storage = getStorage(app);

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
      
      // Dispatch settings if they exist
      const userData = userSnap.data();
      if (userData.settings) {
        window.dispatchEvent(new CustomEvent('firebaseSettingsLoaded', { detail: userData.settings }));
      }
    }
  }

  // Notify listeners
  stateChangeCallbacks.forEach(cb => cb(currentUser));
});

export async function saveUserSettings(settings) {
  if (!currentUser) return false;
  try {
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, { settings });
    return true;
  } catch (error) {
    console.error("Failed to save user settings to Firebase", error);
    return false;
  }
}

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

export async function fetchLikeCounts() {
  try {
    // We use collectionGroup to fetch all 'likes' subcollections across all users.
    // NOTE: This requires a Collection Group Index in Firebase Console.
    const snap = await getDocs(collectionGroup(db, 'likes'));
    const likeData = {};
    snap.forEach(docSnap => {
      const workId = docSnap.id;
      likeData[workId] = (likeData[workId] || 0) + 1;
    });
    return likeData;
  } catch (error) {
    console.error("Failed to fetch like counts via collectionGroup", error);
    // Fallback: If collectionGroup fails due to missing index, manually fetch per user
    try {
      console.log("Attempting manual fetch fallback...");
      const likeData = {};
      const usersSnap = await getDocs(collection(db, 'users'));
      for (const userDoc of usersSnap.docs) {
        const userLikesSnap = await getDocs(collection(db, `users/${userDoc.id}/likes`));
        userLikesSnap.forEach(likeDoc => {
          const workId = likeDoc.id;
          likeData[workId] = (likeData[workId] || 0) + 1;
        });
      }
      return likeData;
    } catch (fallbackError) {
      console.error("Fallback fetch also failed", fallbackError);
      return {};
    }
  }
}

export async function fetchUserLikes(uid) {
  if (!uid) return {};
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
    alert("Firebase Error: " + error.message);
    return false;
  }
}
