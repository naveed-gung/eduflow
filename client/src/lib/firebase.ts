import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDK-Avats0D5qNVsdESnpkbgLHykShsbA0",
  authDomain: "eduflow-6a918.firebaseapp.com",
  projectId: "eduflow-6a918",
  storageBucket: "eduflow-6a918.firebasestorage.app",
  messagingSenderId: "123456789012", // Replace with actual messagingSenderId when available
  appId: "1:123456789012:web:abc123def456", // Replace with actual appId when available
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, storage, googleProvider };
export default app; 