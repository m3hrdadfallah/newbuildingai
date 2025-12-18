import { db } from '../firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Project, User as AppUser } from '../types';

// ذخیره اطلاعات پروفایل کاربر
export const saveUserData = async (uid: string, data: Partial<AppUser>) => {
  await setDoc(doc(db, "users", uid), data, { merge: true });
};

// دریافت اطلاعات پروفایل کاربر
export const getUserData = async (uid: string): Promise<AppUser | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as AppUser;
  }
  return null;
};

// ذخیره پروژه کاربر
export const saveProjectData = async (uid: string, project: Project) => {
    // We save the project in a subcollection or a specific document linked to the user
    // For simplicity in this structure, we store it in users/{uid}/projects/default
    await setDoc(doc(db, "users", uid, "projects", "default"), project);
};

// دریافت پروژه کاربر
export const getProjectData = async (uid: string): Promise<Project | null> => {
    const docRef = doc(db, "users", uid, "projects", "default");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as Project;
    }
    return null;
};
