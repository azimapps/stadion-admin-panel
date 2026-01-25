import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/v1/auth';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || 'Login failed';
      } catch (e) {
        // ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    const data: LoginResponse = await response.json();
    Cookies.set('token', data.access_token, { expires: 1, path: '/' });
    return data;
  },

  logout() {
    Cookies.remove('token');
    window.location.href = '/sign-in';
  },

  getToken() {
    return Cookies.get('token');
  },

  isAuthenticated() {
    return !!Cookies.get('token');
  }
};
