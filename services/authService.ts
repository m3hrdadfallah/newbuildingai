import { registerWithEmail as reg, loginWithEmail as log, logoutUser } from '../auth';

/**
 * این فایل برای حفظ سازگاری با کدهای قدیمی بروزرسانی شده است
 * اما دیگر از firebase/auth استفاده نمی‌کند.
 */

export const registerWithEmail = reg;
export const signIn = log;
export const resetPassword = async (email: string) => {
  console.log("Password reset requested for:", email);
  return Promise.resolve();
};
export const signOut = logoutUser;
