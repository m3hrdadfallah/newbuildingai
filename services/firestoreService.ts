import { db } from '../firebase';
import { doc, setDoc, getDoc, enableIndexedDbPersistence } from "firebase/firestore";
import { Project, User as AppUser } from '../types';

// فعال‌سازی ذخیره‌سازی آفلاین برای مقابله با اختلالات اینترنتی در ایران
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn("Persistence failed: multiple tabs open");
    } else if (err.code === 'unimplemented') {
        console.warn("Persistence is not supported in this browser");
    }
  });
} catch(e) {}

export const saveUserData = async (uid: string, data: Partial<AppUser>) => {
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
  } catch (e) {
    // ذخیره در LocalStorage به عنوان پشتیبان در صورت قطع اینترنت
    localStorage.setItem(`user_${uid}`, JSON.stringify(data));
  }
};

export const getUserData = async (uid: string): Promise<AppUser | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppUser;
    }
  } catch (e) {
    const local = localStorage.getItem(`user_${uid}`);
    if (local) return JSON.parse(local);
  }
  return null;
};

export const saveProjectData = async (uid: string, project: Project) => {
  try {
    await setDoc(doc(db, "users", uid, "projects", "default"), project);
  } catch (e) {
    localStorage.setItem(`project_${uid}`, JSON.stringify(project));
  }
};

export const getProjectData = async (uid: string): Promise<Project | null> => {
  try {
    const docRef = doc(db, "users", uid, "projects", "default");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Project;
    }
  } catch (e) {
    const local = localStorage.getItem(`project_${uid}`);
    if (local) return JSON.parse(local);
  }
  return null;
};