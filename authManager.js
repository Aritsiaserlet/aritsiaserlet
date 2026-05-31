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
  increment, 
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
    const worksSnap = await getDocs(collection(db, 'works'));
    const likeData = {};
    worksSnap.forEach(docSnap => {
      likeData[docSnap.id] = docSnap.data().likes || 0;
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
  const workRef = doc(db, 'works', workId);
  const userLikeRef = doc(db, `users/${uid}/likes`, workId);

  try {
    if (isLiking) {
      // Create user like doc first
      await setDoc(userLikeRef, { createdAt: serverTimestamp() });
      // Then increment global likes
      await setDoc(workRef, { likes: increment(1) }, { merge: true });
    } else {
      // Remove user like doc
      await deleteDoc(userLikeRef);
      // Decrement global likes
      await setDoc(workRef, { likes: increment(-1) }, { merge: true });
    }
    return true;
  } catch (error) {
    console.error("Failed to toggle like", error);
    return false;
  }
}
