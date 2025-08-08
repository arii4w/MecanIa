import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import logoBlanco from '../../assets/logo_blanco.svg';
import logoColor from '../../assets/logo_color.svg';
import { useAuth } from '../../hooks/useAuth'; // Agregar este import
import { useNavigate } from 'react-router-dom';
import { chatService } from '../../services/chatService'; // Agregar este import

interface Chat {
  id: string;
  title: string;
  date: string;
  description: string;
  messages: Message[]; // Agregar mensajes al chat
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface SelectedTag {
  id: string;
  type: 'line' | 'plant' | 'machine';
  value: string;
  color: string;
}

interface PendingAction {
  id: string;
  title: string;
  description: string;
  type: 'update' | 'create' | 'delete' | 'maintenance';
  data: Record<string, unknown>;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false); // Agregar este estado
  
  // Estados para el historial de chats - AGREGAR ESTOS ESTADOS
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  
  // Cambiar a arrays para selecciones múltiples
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  
  // Estados para los dropdowns con búsqueda
  const [lineSearch, setLineSearch] = useState('');
  const [plantSearch, setPlantSearch] = useState('');
  const [machineSearch, setMachineSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Etiquetas seleccionadas para mostrar en el input
  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([]);
  
  // Estados para el panel de acciones
  const [actionsVisible, setActionsVisible] = useState(true);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([
    {
      id: '1',
      title: 'Programar Mantenimiento Preventivo',
      description: 'Programar mantenimiento para Máquina CNC-01 el próximo lunes a las 08:00',
      type: 'create',
      data: { 
        scheduleDate: '2024-01-22', 
        time: '08:00', 
        machine: 'CNC-01',
        priority: 'medium'
      },
      timestamp: '14:30',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Crear Orden de Trabajo',
      description: 'Generar orden de trabajo urgente para revisión de componentes críticos en Línea 2',
      type: 'create',
      data: { 
        priority: 'high', 
        category: 'repair',
        line: 'Línea 2 - Soldadura Automática',
        estimatedTime: '4 horas'
      },
      timestamp: '14:25',
      status: 'pending'
    },
    {
      id: '3',
      title: 'Actualizar Estado de Máquina',
      description: 'Marcar Prensa-01 como "En Mantenimiento" en el sistema',
      type: 'update',
      data: { 
        status: 'maintenance', 
        machine: 'Prensa-01 - Hidráulica 500T',
        reason: 'Fuga detectada en sistema hidráulico'
      },
      timestamp: '14:20',
      status: 'pending'
    },
    {
      id: '4',
      title: 'Calibración de Sensores',
      description: 'Ejecutar calibración automática de sensores de precisión en Línea 3',
      type: 'maintenance',
      data: { 
        line: 'Línea 3 - Pintura y Acabado',
        sensors: ['Sensor-01', 'Sensor-03', 'Sensor-07'],
        calibrationType: 'automatic'
      },
      timestamp: '14:15',
      status: 'pending'
    },
    {
      id: '5',
      title: 'Eliminar Registro Obsoleto',
      description: 'Eliminar registros de temperatura antiguos (>30 días) de la base de datos',
      type: 'delete',
      data: { 
        dataType: 'temperature_logs',
        cutoffDate: '2023-12-15',
        affectedRecords: 15420
      },
      timestamp: '14:10',
      status: 'pending'
    }
  ]);
  
  // Estados simplificados para eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  
  // Referencia para el auto-scroll del área de mensajes
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Agregar el hook de autenticación
  const { logout, user } = useAuth();

  // Función para hacer scroll automático al final del área de mensajes
  const scrollToBottom = () => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    }
  };

  // Auto-scroll cuando se agregan nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Datos de ejemplo - expandidos para mostrar la funcionalidad de búsqueda
  const productionLines = [
    'Línea 1 - Ensamblaje Principal',
    'Línea 2 - Soldadura Automática', 
    'Línea 3 - Pintura y Acabado',
    'Línea 4 - Control de Calidad',
    'Línea 5 - Empaque Final',
    'Línea 6 - Proceso Térmico'
  ];
  
  const plants = [
    'Planta Norte - Producción Principal',
    'Planta Sur - Manufactura Avanzada',
    'Planta Este - Logística Central',
    'Planta Oeste - I+D e Innovación',
    'Planta Central - Administración',
    'Planta Industrial - Maquinaria Pesada'
  ];
  
  const machines = [
    'Máquina CNC-01 - Torno Automático',
    'Máquina CNC-02 - Fresadora Universal',
    'Máquina CNC-03 - Centro de Mecanizado',
    'Máquina CNC-04 - Rectificadora de Precisión',
    'Robot-01 - Brazo Soldador',
    'Robot-02 - Manipulador de Carga',
    'Prensa-01 - Hidráulica 500T',
    'Prensa-02 - Neumática 200T'
  ];

  // Claves para localStorage
  const CHAT_STORAGE_KEY = 'mecania_chat_history';
  const CURRENT_CHAT_KEY = 'mecania_current_chat';

  // Función para cargar chats desde localStorage
  const loadChatsFromStorage = (): Chat[] => {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al cargar chats desde localStorage:', error);
      return [];
    }
  };

  // Función para guardar chats en localStorage
  const saveChatsToStorage = (chats: Chat[]) => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('Error al guardar chats en localStorage:', error);
    }
  };

  // Función para generar título automático basado en el primer mensaje
  const generateChatTitle = (firstMessage: string): string => {
    // Tomar las primeras 50 caracteres y agregar puntos suspensivos si es necesario
    const title = firstMessage.length > 50 
      ? firstMessage.substring(0, 47) + '...' 
      : firstMessage;
    return title;
  };

  // Función para crear un nuevo chat
  const createNewChat = (firstMessage: string, firstResponse: string): Chat => {
    const now = new Date();
    const chatId = `chat_${now.getTime()}`;
    
    const userMessage: Message = {
      id: `msg_${now.getTime()}`,
      text: firstMessage,
      isUser: true,
      timestamp: now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    };

    const botMessage: Message = {
      id: `msg_${now.getTime() + 1}`,
      text: firstResponse,
      isUser: false,
      timestamp: new Date(now.getTime() + 1000).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    };

    const newChat: Chat = {
      id: chatId,
      title: generateChatTitle(firstMessage),
      date: now.toLocaleDateString('es-ES', { 
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }),
      description: firstMessage.length > 100 
        ? firstMessage.substring(0, 97) + '...' 
        : firstMessage,
      messages: [userMessage, botMessage]
    };

    return newChat;
  };

  // Función para actualizar el chat actual con nuevos mensajes
  const updateCurrentChatMessages = (newMessages: Message[]) => {
    if (currentChat) {
      const updatedChat: Chat = {
        ...currentChat,
        messages: newMessages
      };
      
      // Actualizar en el estado
      setCurrentChat(updatedChat);
      
      // Actualizar en el historial
      const updatedHistory = chatHistory.map((chat: Chat) => 
        chat.id === currentChat.id ? updatedChat : chat
      );
      setChatHistory(updatedHistory);
      saveChatsToStorage(updatedHistory);
      
      // Guardar chat actual
      localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(updatedChat));
    }
  };

  // Cargar datos al inicializar el componente
  useEffect(() => {
    const loadedChats = loadChatsFromStorage();
    setChatHistory(loadedChats);
    
    // Cargar chat actual si existe
    try {
      const currentChatStored = localStorage.getItem(CURRENT_CHAT_KEY);
      if (currentChatStored) {
        const parsedChat = JSON.parse(currentChatStored);
        setCurrentChat(parsedChat);
        setMessages(parsedChat.messages || []);
      }
    } catch (error) {
      console.error('Error al cargar chat actual:', error);
    }
  }, []);

  // Actualizar mensajes cuando cambia el chat actual
  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages || []);
      localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(currentChat));
    }
  }, [currentChat]);

  // Actualizar chat actual cuando cambian los mensajes
  useEffect(() => {
    if (currentChat && messages.length > 0) {
      updateCurrentChatMessages(messages);
    }
  }, [messages]);

  // Función para agregar etiquetas al input
  const addTag = (type: 'line' | 'plant' | 'machine', value: string) => {
    const colors = {
      line: '#5560AB',     // primary-light
      plant: '#846BAE',    // accent-purple  
      machine: '#A692C1'   // accent-light
    };
    
    const newTag: SelectedTag = {
      id: `${type}-${Date.now()}`,
      type,
      value,
      color: colors[type]
    };
    
    setSelectedTags(prev => [...prev, newTag]);
    
    // Actualizar el estado correspondiente
    if (type === 'line') {
      setSelectedLines(prev => [...prev, value]);
    } else if (type === 'plant') {
      setSelectedPlants(prev => [...prev, value]);
    } else if (type === 'machine') {
      setSelectedMachines(prev => [...prev, value]);
    }
    
    // Limpiar búsqueda y cerrar dropdown
    if (type === 'line') setLineSearch('');
    if (type === 'plant') setPlantSearch('');
    if (type === 'machine') setMachineSearch('');
    setOpenDropdown(null);
  };

  // Función para remover etiquetas
  const removeTag = (tagId: string) => {
    const tag = selectedTags.find(t => t.id === tagId);
    if (!tag) return;
    
    setSelectedTags(prev => prev.filter(t => t.id !== tagId));
    
    // Actualizar el estado correspondiente
    if (tag.type === 'line') {
      setSelectedLines(prev => prev.filter(line => line !== tag.value));
    } else if (tag.type === 'plant') {
      setSelectedPlants(prev => prev.filter(plant => plant !== tag.value));
    } else if (tag.type === 'machine') {
      setSelectedMachines(prev => prev.filter(machine => machine !== tag.value));
    }
  };

  // Función para filtrar opciones según la búsqueda
  const filterOptions = (options: string[], search: string, selected: string[]) => {
    return options.filter(option => 
      option.toLowerCase().includes(search.toLowerCase()) && 
      !selected.includes(option)
    );
  };

  // Componente de selector múltiple con búsqueda
  const MultiSelector: React.FC<{
    type: 'line' | 'plant' | 'machine';
    label: string;
    options: string[];
    selected: string[];
    search: string;
    setSearch: (value: string) => void;
    placeholder: string;
  }> = ({ type, label, options, selected, search, setSearch, placeholder }) => {
    const isOpen = openDropdown === type;
    const filteredOptions = filterOptions(options, search, selected);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      if (!isOpen) {
        setOpenDropdown(type);
      }
    };

    const handleInputClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenDropdown(type);
    };

    const handleContainerClick = () => {
      if (!isOpen) {
        setOpenDropdown(type);
      }
    };

    const getDisplayText = () => {
      if (search && isOpen) {
        return search;
      }
      if (selected.length > 0) {
        return `${selected.length} seleccionado(s)`;
      }
      return '';
    };

    return (
      <div className="selector-group">
        <label>{label}:</label>
        <div className="multi-selector">
          <div 
            className={`selector-input ${isOpen ? 'open' : ''}`}
            onClick={handleContainerClick}
          >
            <input
              type="text"
              value={getDisplayText()}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="search-input"
              onClick={handleInputClick}
              onFocus={() => setOpenDropdown(type)}
              readOnly={!isOpen && selected.length > 0}
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
              <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          
          {isOpen && (
            <div className="dropdown-options">
              <div className="dropdown-search-container">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Buscar ${label.toLowerCase()}...`}
                  className="dropdown-search-input"
                  autoFocus
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="search-icon">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              
              <div className="dropdown-options-list">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map(option => (
                    <div
                      key={option}
                      className="dropdown-option"
                      onClick={() => addTag(type, option)}
                    >
                      {option}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-option disabled">
                    {search ? 'No se encontraron resultados' : 'Todas las opciones seleccionadas'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Función para agregar acciones pendientes (simulación de respuestas del bot)
  const addPendingAction = (action: Omit<PendingAction, 'id' | 'timestamp' | 'status'>) => {
    const newAction: PendingAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: 'pending'
    };
    setPendingActions(prev => [...prev, newAction]);
  };

  // Función para aceptar una acción
  const acceptAction = (actionId: string) => {
    setPendingActions(prev => 
      prev.map(action => 
        action.id === actionId 
          ? { ...action, status: 'accepted' as const }
          : action
      )
    );
    
    // Aquí iría la lógica para enviar al backend
    console.log('Acción aceptada:', actionId);
    
    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now().toString(),
        text: 'Perfecto! He ejecutado la acción solicitada. Los cambios han sido aplicados correctamente.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  // Función para rechazar una acción
  const rejectAction = (actionId: string) => {
    setPendingActions(prev => 
      prev.map(action => 
        action.id === actionId 
          ? { ...action, status: 'rejected' as const }
          : action
      )
    );
    
    console.log('Acción rechazada:', actionId);
    
    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now().toString(),
        text: 'Entendido. He cancelado la acción. ¿Te gustaría que proponga una alternativa?',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  // Función para limpiar acciones procesadas
  const clearProcessedActions = () => {
    setPendingActions(prev => prev.filter(action => action.status === 'pending'));
  };

  // Modificar handleSendMessage para simular acciones pendientes
  const handleSendMessage = async () => {
    const fullText = getFullMessageText();
    if (fullText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: fullText,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })
      };
      
      // Si no hay chat actual, este será el primer mensaje de un nuevo chat
      const isNewChat = !currentChat;
      
      // Agregar mensaje del usuario
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      setSelectedTags([]);
      setSelectedLines([]);
      setSelectedPlants([]);
      setSelectedMachines([]);
      
      // Mostrar indicador de escritura
      setIsTyping(true);
      
      try {
        // Llamar al servicio de chat
        const response = await chatService.sendMessage(fullText);
        
        // Crear respuesta del bot
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.answer,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })
        };
        
        // Si es un nuevo chat, crearlo
        if (isNewChat) {
          const newChat = createNewChat(fullText, response.answer);
          
          // Actualizar estados
          setCurrentChat(newChat);
          setMessages(newChat.messages);
          
          // Agregar al historial
          const updatedHistory = [newChat, ...chatHistory];
          setChatHistory(updatedHistory);
          saveChatsToStorage(updatedHistory);
        } else {
          // Agregar respuesta del bot al chat existente
          setMessages(prev => [...prev, botResponse]);
        }
        
        // Procesar acciones si las hay
        if (response.actions && response.actions.length > 0) {
          response.actions.forEach((action: unknown) => {
            addPendingAction({
              title: (action as { title: string }).title || 'Acción sugerida',
              description: (action as { description: string }).description || 'El asistente sugiere realizar esta acción',
              type: (action as { type: 'update' | 'create' | 'delete' | 'maintenance' }).type || 'update',
              data: (action as { data: Record<string, unknown> }).data || {}
            });
          });
        }
        
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Modificar el handleInputChange para incluir las etiquetas
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  // Función para obtener el texto completo incluyendo etiquetas
  const getFullMessageText = () => {
    const tagText = selectedTags.map(tag => `@${tag.value}`).join(' ');
    return tagText ? `${tagText} ${inputMessage}` : inputMessage;
  };

  // Función simplificada para iniciar eliminación
  const handleDeleteClick = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chat);
    setShowDeleteConfirm(chat.id);
  };

  // Modificar confirmDeleteChat para eliminar del localStorage
  const confirmDeleteChat = () => {
    if (chatToDelete) {
      // Eliminar del historial
      const updatedHistory = chatHistory.filter((chat: Chat) => chat.id !== chatToDelete.id);
      setChatHistory(updatedHistory);
      saveChatsToStorage(updatedHistory);
      
      // Si es el chat actual, limpiar selección
      if (currentChat?.id === chatToDelete.id) {
        setCurrentChat(null);
        setMessages([]);
        localStorage.removeItem(CURRENT_CHAT_KEY);
      }
      
      // Limpiar estados del modal
      setShowDeleteConfirm(null);
      setChatToDelete(null);
    }
  };

  // Función para cancelar eliminación
  const cancelDeleteChat = () => {
    setShowDeleteConfirm(null);
    setChatToDelete(null);
  };

  // Función para seleccionar un chat del historial
  const selectChat = (chat: Chat) => {
    setCurrentChat(chat);
    setMessages(chat.messages || []);
    // Limpiar selecciones
    setSelectedTags([]);
    setSelectedLines([]);
    setSelectedPlants([]);
    setSelectedMachines([]);
  };

  // Modificar startNewChat para limpiar el chat actual
  const startNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setSelectedTags([]);
    setSelectedLines([]);
    setSelectedPlants([]);
    setSelectedMachines([]);
    localStorage.removeItem(CURRENT_CHAT_KEY);
  };

  // Cerrar dropdown y modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.multi-selector')) {
        setOpenDropdown(null);
      }
      if (!target.closest('.delete-confirm-modal') && !target.closest('.delete-btn')) {
        setShowDeleteConfirm(null);
        setChatToDelete(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para manejar logout - MODIFICADA
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true }); // Forzar redirección al login
  };

  return (
    <div className={`chatbot-container`}>
      <div className="watermark-logo">
        <img src={logoColor} alt="MecanIA Watermark" />
      </div>
      <div className="chatbot-wrapper">
        {/* Panel Lateral */}
        <div className={`sidebar ${sidebarVisible ? 'visible' : 'hidden'}`}>
          {/* Logo y Nombre */}
          <div className="logo-section">
            <div className="logo">
              <img src={logoBlanco} alt="MecanIA Logo" width="40" height="40" />
            </div>
            <h1 className="app-name">MecanIA</h1>
          </div>

          {/* Historial */}
          <div className="history-section">
            <div className="section-header">
              <h2>HISTORIAL</h2>
              <button className="new-chat-btn" onClick={startNewChat}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="chat-list">
              {chatHistory.map((chat: Chat) => (
                <div 
                  key={chat.id} 
                  className={`chat-item ${currentChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => selectChat(chat)}
                >
                  <div className="chat-info">
                    <h3>{chat.title}</h3>
                    <p>{chat.description}</p>
                    <span className="chat-date">{chat.date}</span>
                  </div>
                  <div className="chat-actions">
                    <button 
                      className="delete-btn simple"
                      onClick={(e) => handleDeleteClick(chat, e)}
                      title="Eliminar chat"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M9 6v12a3 3 0 0 0 6 0V6" stroke="currentColor" strokeWidth="2"/>
                        <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuración - Actualizada con info del usuario y logout */}
          <div className="config-section">
            <h2>USUARIO</h2>
            <div className="config-options">
              <div className="user-info-card">
                <div className="user-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="user-details">
                  <span className="username">{user?.username}</span>
                  <span className="user-id">ID: {user?.id}</span>
                </div>
              </div>
              
              {/*<div className="switcher-container">
                <span>Modo Oscuro</span>
                <button 
                  className={`theme-switcher ${darkMode ? 'active' : ''}`}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <div className="switcher-thumb"></div>
                </button>
              </div>*/}

              <button className="logout-btn" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>

        {/* Área Principal */}
        <div className="main-content">
          {/* Header */}
          <div className="chat-header">
            <button 
              className="toggle-sidebar-btn"
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            
            <div className="chat-title">
              <h1>{currentChat?.title || 'Nuevo Chat'}</h1>
              <div className="chat-tags">
                <span className="tag">Líneas: {selectedLines.length || 'Ninguna'}</span>
                <span className="tag">Plantas: {selectedPlants.length || 'Ninguna'}</span>
                <span className="tag">Máquinas: {selectedMachines.length || 'Ninguna'}</span>
              </div>
            </div>
            
            <div className="header-actions">
              {/* Mostrar contador de acciones pendientes si las hay */}
              {pendingActions.filter(action => action.status === 'pending').length > 0 && (
                <div className="pending-actions-indicator">
                  <span className="pending-count">
                    {pendingActions.filter(action => action.status === 'pending').length}
                  </span>
                </div>
              )}
              
              {/* Botón para mostrar/ocultar panel de acciones */}
              <button 
                className="toggle-actions-btn"
                onClick={() => setActionsVisible(!actionsVisible)}
                title={actionsVisible ? 'Ocultar panel de acciones' : 'Mostrar panel de acciones'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {!actionsVisible && pendingActions.filter(action => action.status === 'pending').length > 0 && (
                  <span className="action-badge">
                    {pendingActions.filter(action => action.status === 'pending').length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="messages-area" ref={messagesAreaRef}>
            {messages.length === 0 ? (
              <div className="welcome-message">
                <div className="bot-message">
                  <div className="message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="message-content">
                    <p>¡Hola! Soy MecanIA, tu asistente especializado en maquinaria industrial. ¿En qué puedo ayudarte?</p>
                    <span className="message-time">8:33:03</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.isUser ? 'user' : 'bot'}`}>
                    {!message.isUser && (
                      <div className="message-avatar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                        </svg>
                      </div>
                    )}
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                    {message.isUser && (
                      <div className="message-avatar user-avatar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Indicador de escritura */}
                {isTyping && (
                  <div className="message bot">
                    <div className="message-avatar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="message-content typing">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Área de Entrada Modificada */}
          <div className="input-area">
            <div className="input-container">
              <div className="input-wrapper">
                {/* Etiquetas seleccionadas */}
                {selectedTags.length > 0 && (
                  <div className="input-tags">
                    {selectedTags.map(tag => (
                      <div 
                        key={tag.id} 
                        className="input-tag"
                        style={{ backgroundColor: tag.color }}
                      >
                        <span>@{tag.value}</span>
                        <button
                          className="tag-remove"
                          onClick={() => removeTag(tag.id)}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe el problema o haz una pregunta..."
                  className="message-input"
                />
              </div>
              
              <div className="input-actions">
                <button className="attachment-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59717 21.9983 8.005 21.9983C6.41283 21.9983 4.88579 21.3658 3.76 20.24C2.63421 19.1142 2.00171 17.5872 2.00171 15.995C2.00171 14.4028 2.63421 12.8758 3.76 11.75L12.95 2.56C13.7006 1.80943 14.7167 1.3877 15.78 1.3877C16.8433 1.3877 17.8594 1.80943 18.61 2.56C19.3606 3.31057 19.7823 4.32667 19.7823 5.39C19.7823 6.45333 19.3606 7.46943 18.61 8.22L9.41 17.41C9.03472 17.7853 8.52647 17.9961 8 17.9961C7.47353 17.9961 6.96528 17.7853 6.59 17.41C6.21472 17.0347 6.00391 16.5265 6.00391 16C6.00391 15.4735 6.21472 14.9653 6.59 14.59L15.07 6.11" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                <button 
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!getFullMessageText().trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Selectores de Configuración Modificados */}
            <div className="config-selectors">
              <MultiSelector
                type="line"
                label="Línea de Producción"
                options={productionLines}
                selected={selectedLines}
                search={lineSearch}
                setSearch={setLineSearch}
                placeholder="Buscar líneas..."
              />
              
              <MultiSelector
                type="plant"
                label="Planta"
                options={plants}
                selected={selectedPlants}
                search={plantSearch}
                setSearch={setPlantSearch}
                placeholder="Buscar plantas..."
              />
              
              <MultiSelector
                type="machine"
                label="Maquinaria"
                options={machines}
                selected={selectedMachines}
                search={machineSearch}
                setSearch={setMachineSearch}
                placeholder="Buscar máquinas..."
              />
            </div>
          </div>
        </div>

        {/* Panel de Acciones (Derecho) - Siempre visible si actionsVisible es true */}
        {actionsVisible && (
          <div className={`actions-panel ${actionsVisible ? 'visible' : 'hidden'}`}>
            <div className="actions-header">
              <div className="actions-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h2>Panel de Acciones</h2>
              </div>
              <button 
                className="close-actions-btn"
                onClick={() => setActionsVisible(false)}
                title="Ocultar panel"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <div className="actions-content">
              {pendingActions.filter(action => action.status === 'pending').length === 0 ? (
                <div className="no-actions">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="no-actions-icon">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 12H16M12 8V16" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <p>No hay acciones pendientes</p>
                  <span>Las sugerencias del asistente aparecerán aquí</span>
                </div>
              ) : (
                <div className="actions-list">
                  {pendingActions.filter(action => action.status === 'pending').map(action => (
                    <div key={action.id} className="action-item">
                      <div className="action-header">
                        <div className="action-type">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            {action.type === 'create' && <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2"/>}
                            {action.type === 'update' && <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>}
                            {action.type === 'delete' && <path d="M3 6h18M9 6v12a3 3 0 0 0 6 0V6" stroke="currentColor" strokeWidth="2"/>}
                            {action.type === 'maintenance' && <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2"/>}
                          </svg>
                          <span className={`action-type-text ${action.type}`}>
                            {action.type === 'create' && 'Crear'}
                            {action.type === 'update' && 'Actualizar'}
                            {action.type === 'delete' && 'Eliminar'}
                            {action.type === 'maintenance' && 'Mantenimiento'}
                          </span>
                        </div>
                        <span className="action-time">{action.timestamp}</span>
                      </div>
                      
                      <div className="action-content">
                        <h3>{action.title}</h3>
                        <p>{action.description}</p>
                      </div>
                      
                      <div className="action-buttons">
                        <button 
                          className="action-btn reject"
                          onClick={() => rejectAction(action.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Rechazar
                        </button>
                        <button 
                          className="action-btn accept"
                          onClick={() => acceptAction(action.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Aceptar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {pendingActions.filter(action => action.status !== 'pending').length > 0 && (
                <div className="actions-footer">
                  <button 
                    className="clear-actions-btn"
                    onClick={clearProcessedActions}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M9 6v12a3 3 0 0 0 6 0V6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Limpiar procesadas
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && chatToDelete && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="warning-icon">
                <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 0 0 3.64 21H20.36A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <h3>Eliminar Chat</h3>
            </div>
            
            <div className="modal-content">
              <p>¿Estás seguro de que quieres eliminar el chat:</p>
              <span className="chat-title-highlight">"{chatToDelete.title}"</span>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={cancelDeleteChat}
              >
                Cancelar
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={confirmDeleteChat}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
