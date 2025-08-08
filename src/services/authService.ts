import { api } from './api';
import { LoginCredentials, LoginResponse, UserData } from '../types/auth';

class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_ID_KEY = 'userId';
  private readonly USERNAME_KEY = 'username';

  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<UserData> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      // Guardar datos en localStorage
      this.saveAuthData(response);
      
      return response;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.clearAuthData();
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const userId = this.getUserId();
    const username = this.getUsername();
    
    return !!(token && userId && username);
  }

  /**
   * Obtener el token actual
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener el ID del usuario
   */
  getUserId(): number | null {
    const id = localStorage.getItem(this.USER_ID_KEY);
    return id ? parseInt(id, 10) : null;
  }

  /**
   * Obtener el username del usuario
   */
  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  /**
   * Obtener todos los datos del usuario actual
   */
  getCurrentUser(): UserData | null {
    const token = this.getToken();
    const id = this.getUserId();
    const username = this.getUsername();
    
    if (token && id && username) {
      return { id, username, token };
    }
    
    return null;
  }

  /**
   * Guardar datos de autenticación en localStorage
   */
  private saveAuthData(userData: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, userData.token);
    localStorage.setItem(this.USER_ID_KEY, userData.id.toString());
    localStorage.setItem(this.USERNAME_KEY, userData.username);
  }

  /**
   * Limpiar datos de autenticación
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
export default authService;
