export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'rider' | 'driver';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  VerifyOTP: { email: string };
  Home: undefined;
};
