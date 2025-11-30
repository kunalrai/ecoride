import api from './api';

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: 'rider' | 'driver';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: any;
    token?: string;
  };
}

class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', data);
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  }

  async verifyOTP(data: VerifyOTPData): Promise<AuthResponse> {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  }

  async resendOTP(email: string): Promise<AuthResponse> {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  }

  async checkHealth(): Promise<any> {
    const response = await api.get('/auth/health');
    return response.data;
  }
}

export default new AuthService();
