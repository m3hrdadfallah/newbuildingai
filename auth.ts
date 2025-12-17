/**
 * این فایل حالا از سیستم محلی (localStorage) به جای Firebase Auth استفاده می‌کند
 * تا خطای Component auth has not been registered برطرف شود.
 */

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  plan?: 'Free' | 'Pro';
}

export const loginWithEmail = async (email: string, password: string): Promise<MockUser> => {
  // شبیه‌سازی فراخوان API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password.length < 6) {
        reject(new Error("رمز عبور باید حداقل ۶ کاراکتر باشد."));
        return;
      }
      const user: MockUser = {
        uid: btoa(email), // تولید یک آیدی بر اساس ایمیل
        email: email,
        displayName: email.split('@')[0],
        plan: 'Free'
      };
      localStorage.setItem('sazyar_user', JSON.stringify(user));
      resolve(user);
    }, 1000);
  });
};

export const registerWithEmail = async (email: string, password: string, fullName: string): Promise<MockUser> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user: MockUser = {
        uid: btoa(email),
        email: email,
        displayName: fullName,
        plan: 'Free'
      };
      localStorage.setItem('sazyar_user', JSON.stringify(user));
      resolve(user);
    }, 1000);
  });
};

export const loginWithGoogle = async (): Promise<MockUser> => {
  // در نبود Firebase Auth، ورود با گوگل را به صورت نمایشی پیاده‌سازی می‌کنیم
  return new Promise((resolve) => {
    setTimeout(() => {
      const user: MockUser = {
        uid: 'google-user-123',
        email: 'google-user@gmail.com',
        displayName: 'کاربر گوگل',
        photoURL: 'https://www.gstatic.com/images/branding/product/2x/avatar_square_blue_120dp.png',
        plan: 'Free'
      };
      localStorage.setItem('sazyar_user', JSON.stringify(user));
      resolve(user);
    }, 1200);
  });
};

export const logoutUser = async () => {
  localStorage.removeItem('sazyar_user');
  window.location.href = '/login';
};