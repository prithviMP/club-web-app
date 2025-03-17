
import { apiClient } from '../utils/api/client';
import { ENDPOINTS } from '../utils/api/config';

class AuthService {
  async resetPassword(code: string, password: string) {
    return apiClient.post(`${ENDPOINTS.AUTH}/reset-password`, {
      code,
      password,
      passwordConfirmation: password
    });
  }
}

export const authService = new AuthService();
