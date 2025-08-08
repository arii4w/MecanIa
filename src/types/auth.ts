// Tipos para el login
export interface LoginCredentials {
  username: string;
  password: string;
}

// Respuesta del servidor para login
export interface LoginResponse {
  id: number;
  username: string;
  token: string;
}

// Datos del usuario para el localStorage
export interface UserData {
  id: number;
  username: string;
  token: string;
}
