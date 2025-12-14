import { db } from './firebase';
import { doc, setDoc } from "firebase/firestore";

export const saveUserData = async (uid, data) => {
  await setDoc(doc(db, "users", uid), data);
};
