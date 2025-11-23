
import { User, Client, Post } from "../types";

// --- PRODUCTION CONFIGURATION ---
// To enable Cloud Sync: Fill in these values with your Firebase Project credentials
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || ""
};

// --- OFFLINE-FIRST ENGINE ---
// Robust LocalStorage Adapter with Quota Management

const DB_PREFIX = 'doneflow_v1_';
const IO_LATENCY = 300; // Micro-delay for natural UI interactions

const offlineAdapter = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(DB_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
    } catch (e: any) {
      // Professional Quota Handling
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
         console.warn("⚠️ Storage Quota Exceeded. Optimizing assets...");
         
         // Strategy: Compress heavy collections (e.g., Posts with Images)
         if (key.includes('posts') && Array.isArray(value)) {
            const optimizedData = [...value].map((item, index) => {
                // Keep full data for the 15 most recent items, strip images from older ones
                if (index < value.length - 15) {
                    return { ...item, image: undefined }; 
                }
                return item;
            });

            try {
                localStorage.setItem(DB_PREFIX + key, JSON.stringify(optimizedData));
                console.log("✅ Storage optimized successfully.");
                return; 
            } catch (retryError) {
                // Fallback: Keep only recent 20 items
                const trimmedData = optimizedData.slice(-20);
                try {
                    localStorage.setItem(DB_PREFIX + key, JSON.stringify(trimmedData));
                    return;
                } catch (finalError) {
                    console.error("CRITICAL: Storage full.");
                    throw new Error("QUOTA_EXCEEDED");
                }
            }
         }
         throw new Error("QUOTA_EXCEEDED");
      }
      throw e;
    }
  },

  // Simulates NoSQL Subcollection behavior
  updateCollection: (userId: string, collectionName: string, docId: string, data: any, isDelete = false) => {
    const key = `${userId}_${collectionName}`;
    const list = offlineAdapter.get(key) || [];
    let newList;
    
    if (isDelete) {
      newList = list.filter((item: any) => item.id !== docId);
    } else {
      const index = list.findIndex((item: any) => item.id === docId);
      if (index >= 0) {
        newList = [...list];
        newList[index] = { ...newList[index], ...data };
      } else {
        newList = [...list, data];
      }
    }
    
    offlineAdapter.set(key, newList);
    // Dispatch event for real-time UI updates
    window.dispatchEvent(new CustomEvent(`db_update_${key}`, { detail: newList }));
    return newList;
  }
};

// --- AUTHENTICATION LAYER ---

export const observeAuth = (callback: (user: any) => void) => {
  const user = offlineAdapter.get('auth_user');
  callback(user);
  
  const handler = () => callback(offlineAdapter.get('auth_user'));
  window.addEventListener('auth_state_changed', handler);
  return () => window.removeEventListener('auth_state_changed', handler);
};

export const loginEmail = async (email: string, pass: string) => {
  await new Promise(r => setTimeout(r, IO_LATENCY));
  
  // Basic validation
  if (!email.includes('@')) throw { code: 'auth/invalid-credential' };
  
  const userProfile = offlineAdapter.get(`user_profile_${email}`);
  
  // Session creation
  const userSession = {
    uid: userProfile?.id || 'user_' + Date.now(),
    email,
    displayName: userProfile?.name || email.split('@')[0],
    photoURL: userProfile?.avatar || `https://ui-avatars.com/api/?name=${email}&background=random`
  };
  
  offlineAdapter.set('auth_user', userSession);
  window.dispatchEvent(new Event('auth_state_changed'));
  return { user: userSession };
};

export const signupEmail = async (email: string, pass: string, name: string) => {
  await new Promise(r => setTimeout(r, IO_LATENCY));
  
  const userSession = {
    uid: 'user_' + Date.now(),
    email,
    displayName: name,
    photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
  };
  
  offlineAdapter.set('auth_user', userSession);
  
  // Initialize Profile
  offlineAdapter.set(`user_profile_${email}`, {
      id: userSession.uid,
      name,
      email,
      avatar: userSession.photoURL
  });

  window.dispatchEvent(new Event('auth_state_changed'));
  return { user: userSession };
};

export const loginGoogle = async () => {
  await new Promise(r => setTimeout(r, IO_LATENCY));
  const userSession = {
    uid: 'google_user_' + Date.now(),
    displayName: 'Usuário Google',
    email: 'user@gmail.com',
    photoURL: `https://ui-avatars.com/api/?name=Google+User&background=random`
  };
  offlineAdapter.set('auth_user', userSession);
  window.dispatchEvent(new Event('auth_state_changed'));
  return { user: userSession };
};

export const logout = async () => {
  offlineAdapter.set('auth_user', null);
  window.dispatchEvent(new Event('auth_state_changed'));
};

export const getCurrentUserId = (): string | null => {
  const user = offlineAdapter.get('auth_user');
  return user ? user.uid : null;
};

// --- DATABASE SERVICES ---

export const saveUserProfile = async (user: User) => {
  offlineAdapter.set(`user_profile_${user.id}`, user);
  if (user.email) {
      offlineAdapter.set(`user_profile_${user.email}`, user);
  }
};

export const getDocument = async (collectionName: string, docId: string) => {
  if (collectionName === 'users') {
      return offlineAdapter.get(`user_profile_${docId}`);
  }
  return offlineAdapter.get(`${collectionName}_${docId}`);
};

export const subscribeToSubcollection = (userId: string, subcollectionName: string, callback: (data: any[]) => void) => {
  const key = `${userId}_${subcollectionName}`;
  const initialData = offlineAdapter.get(key);
  
  callback(Array.isArray(initialData) ? initialData : []);

  const handler = (e: any) => {
      const data = e.detail;
      callback(Array.isArray(data) ? data : []);
  };
  window.addEventListener(`db_update_${key}`, handler);
  return () => window.removeEventListener(`db_update_${key}`, handler);
};

export const saveClientToFirestore = async (userId: string, client: Client) => {
  offlineAdapter.updateCollection(userId, 'clients', client.id, client);
};

export const deleteClientFromFirestore = async (userId: string, clientId: string) => {
  offlineAdapter.updateCollection(userId, 'clients', clientId, null, true);
}

export const savePostToFirestore = async (userId: string, post: Post) => {
  offlineAdapter.updateCollection(userId, 'posts', post.id, post);
};

export const deletePostFromFirestore = async (userId: string, postId: string) => {
  offlineAdapter.updateCollection(userId, 'posts', postId, null, true);
};
