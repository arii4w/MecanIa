import { apiRequest } from './api';

// Tipos para el servicio de chat
export interface ChatMessage {
  message: string;
  stream: boolean;
}

export interface ChatResponse {
  answer: string;
  actions: any[] | null;
  predictive: any | null;
  sources: any[] | null;
  limits_hit: boolean;
}

class ChatService {
  private readonly CHAT_ENDPOINT = '/chat/';

  /**
   * Enviar mensaje al chatbot
   */
  async sendMessage(message: string): Promise<ChatResponse> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const payload: ChatMessage = {
      message,
      stream: false
    };

    const response = await apiRequest<ChatResponse>(this.CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return response;
  }
}

// Exportar instancia singleton
export const chatService = new ChatService();
export default chatService;
