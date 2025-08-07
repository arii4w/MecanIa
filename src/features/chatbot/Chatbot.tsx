import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import logoBlanco from '../../assets/logo_blanco.svg';
import logoColor from '../../assets/logo_color.svg';

interface Chat {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const Chatbot: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  //const [language, setLanguage] = useState('ES');
  const [darkMode, setDarkMode] = useState(true);
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [deleteProgress, setDeleteProgress] = useState<{ [key: string]: number }>({});
  const [deleteTimeouts, setDeleteTimeouts] = useState<{ [key: string]: number | null }>({});
  const [contextMenuOpen, setContextMenuOpen] = useState<string | null>(null);
  const [showDeleteButton, setShowDeleteButton] = useState<{ [key: string]: boolean }>({});
  
  // Referencia para el auto-scroll del área de mensajes
  const messagesAreaRef = useRef<HTMLDivElement>(null);

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

  // Datos de ejemplo
  const chatHistory: Chat[] = [
    {
      id: '1',
      title: 'Problema Máquina CNC-01',
      date: '15/1/2024',
      description: 'Ruido extraño en el eje principal...'
    },
    {
      id: '2',
      title: 'Mantenimiento Preventivo',
      date: '14/1/2024',
      description: 'Programación de mantenimiento...'
    },
    {
      id: '3',
      title: 'Optimización Línea 2',
      date: '13/1/2024',
      description: 'Análisis de eficiencia...'
    },
    {
      id: '4',
      title: 'Diagnóstico Sistema Hidráulico',
      date: '12/1/2024',
      description: 'Fuga en tuberías principales...'
    },
    {
      id: '5',
      title: 'Calibración Sensores',
      date: '11/1/2024',
      description: 'Ajuste de precisión en línea 3...'
    },
    {
      id: '6',
      title: 'Revisión Motor Eléctrico',
      date: '10/1/2024',
      description: 'Vibraciones anormales detectadas...'
    },
    {
      id: '7',
      title: 'Actualización Software',
      date: '9/1/2024',
      description: 'Migración a nueva versión...'
    },
    {
      id: '8',
      title: 'Inspección Cintas Transportadoras',
      date: '8/1/2024',
      description: 'Desgaste en rodillos principales...'
    },
    {
      id: '9',
      title: 'Análisis Consumo Energético',
      date: '7/1/2024',
      description: 'Optimización de eficiencia...'
    },
    {
      id: '10',
      title: 'Reparación Panel de Control',
      date: '6/1/2024',
      description: 'Falla en interfaz de usuario...'
    }
  ];

  const productionLines = ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'];
  const plants = ['Planta Norte', 'Planta Sur', 'Planta Este', 'Planta Oeste'];
  const machines = ['Máquina CNC-01', 'Máquina CNC-02', 'Máquina CNC-03', 'Máquina CNC-04'];

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })
      };
      setMessages([...messages, newMessage]);
      setInputMessage('');
      
      // Simular respuesta del bot
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Gracias por tu mensaje. Estoy procesando tu consulta...',
          isUser: false,
          timestamp: new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    // Auto-scroll cuando el usuario está escribiendo
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const handleDeleteStart = (chatId: string) => {
    setDeleteProgress(prev => ({ ...prev, [chatId]: 0 }));
    
    const interval = setInterval(() => {
      setDeleteProgress(prev => {
        const newProgress = (prev[chatId] || 0) + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
          deleteChat(chatId);
          return { ...prev, [chatId]: 0 };
        }
        return { ...prev, [chatId]: newProgress };
      });
    }, 50);
    
    setDeleteTimeouts(prev => ({ ...prev, [chatId]: interval }));
  };

  const handleDeleteEnd = (chatId: string) => {
    if (deleteTimeouts[chatId]) {
      clearInterval(deleteTimeouts[chatId]);
      setDeleteTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[chatId];
        return newTimeouts;
      });
    }
    setDeleteProgress(prev => ({ ...prev, [chatId]: 0 }));
  };

  const deleteChat = (chatId: string) => {
    // Aquí iría la lógica para eliminar el chat
    console.log('Eliminar chat:', chatId);
    // Limpiar estados
    setDeleteProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[chatId];
      return newProgress;
    });
    setDeleteTimeouts(prev => {
      const newTimeouts = { ...prev };
      delete newTimeouts[chatId];
      return newTimeouts;
    });
    setShowDeleteButton(prev => {
      const newShow = { ...prev };
      delete newShow[chatId];
      return newShow;
    });
  };

  const startNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
  };

  // Cerrar el menú contextual al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuOpen(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`chatbot-container ${darkMode ? 'dark' : 'light'}`}>
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
              {chatHistory.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`chat-item ${currentChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => setCurrentChat(chat)}
                >
                  <div className="chat-info">
                    <h3>{chat.title}</h3>
                    <p>{chat.description}</p>
                    <span className="chat-date">{chat.date}</span>
                  </div>
                  <div className="chat-actions">
                    <button 
                      className="menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setContextMenuOpen(contextMenuOpen === chat.id ? null : chat.id);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
                        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                        <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
                      </svg>
                    </button>
                    {contextMenuOpen === chat.id && (
                      <div className="context-menu">
                        <button
                          className="context-menu-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteButton(prev => ({ ...prev, [chat.id]: true }));
                            setContextMenuOpen(null);
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                            <path d="M3 6h18M9 6v12a3 3 0 0 0 6 0V6" stroke="currentColor" strokeWidth="2"/>
                            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Eliminar chat
                        </button>
                        <button
                          className="context-menu-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenuOpen(null);
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Editar
                        </button>
                      </div>
                    )}
                    {showDeleteButton[chat.id] && (
                      <button 
                        className={`delete-btn ${deleteProgress[chat.id] > 0 ? 'deleting' : ''}`}
                        onMouseDown={() => handleDeleteStart(chat.id)}
                        onMouseUp={() => handleDeleteEnd(chat.id)}
                        onMouseLeave={() => handleDeleteEnd(chat.id)}
                        onTouchStart={() => handleDeleteStart(chat.id)}
                        onTouchEnd={() => handleDeleteEnd(chat.id)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {deleteProgress[chat.id] > 0 ? (
                          <div className="delete-progress">
                            <div 
                              className="delete-progress-bar" 
                              style={{ width: `${deleteProgress[chat.id]}%` }}
                            ></div>
                            <span className="delete-text">Mantener para eliminar</span>
                          </div>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M9 6v12a3 3 0 0 0 6 0V6" stroke="#D7465E" strokeWidth="2"/>
                            <path d="M10 11v6M14 11v6" stroke="#D7465E" strokeWidth="2"/>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuración */}
          <div className="config-section">
            <h2>CONFIGURACIÓN</h2>
            <div className="config-options">
              <button className="config-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Perfil</span>
              </button>
              {/*
              <div className="switcher-container">
                <span>ES/EN</span>
                <button 
                  className={`language-switcher ${language === 'ES' ? 'active' : ''}`}
                  onClick={() => setLanguage(language === 'ES' ? 'EN' : 'ES')}
                >
                  <div className="switcher-thumb"></div>
                </button>
              </div>*/}
              
              <div className="switcher-container">
                <span>Modo Oscuro</span>
                <button 
                  className={`theme-switcher ${darkMode ? 'active' : ''}`}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <div className="switcher-thumb"></div>
                </button>
              </div>
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
                <span className="tag">Línea: {selectedLine || 'Seleccionar'}</span>
                <span className="tag">Planta: {selectedPlant || 'Seleccionar'}</span>
                <span className="tag">Maquinaria: {selectedMachine || 'Seleccionar'}</span>
              </div>
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
              </div>
            )}
          </div>

          {/* Área de Entrada */}
          <div className="input-area">
            <div className="input-container">
              <textarea
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Describe el problema o haz una pregunta..."
                className="message-input"
              />
              <div className="input-actions">
                <button className="attachment-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59717 21.9983 8.005 21.9983C6.41283 21.9983 4.88579 21.3658 3.76 20.24C2.63421 19.1142 2.00171 17.5872 2.00171 15.995C2.00171 14.4028 2.63421 12.8758 3.76 11.75L12.95 2.56C13.7006 1.80943 14.7167 1.3877 15.78 1.3877C16.8433 1.3877 17.8594 1.80943 18.61 2.56C19.3606 3.31057 19.7823 4.32667 19.7823 5.39C19.7823 6.45333 19.3606 7.46943 18.61 8.22L9.41 17.41C9.03472 17.7853 8.52647 17.9961 8 17.9961C7.47353 17.9961 6.96528 17.7853 6.59 17.41C6.21472 17.0347 6.00391 16.5265 6.00391 16C6.00391 15.4735 6.21472 14.9653 6.59 14.59L15.07 6.11" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                <button 
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Selectores de Configuración */}
            <div className="config-selectors">
              <div className="selector-group">
                <label>Línea de Producción:</label>
                <select 
                  value={selectedLine} 
                  onChange={(e) => setSelectedLine(e.target.value)}
                  className="config-select"
                >
                  <option value="">Seleccionar línea</option>
                  {productionLines.map(line => (
                    <option key={line} value={line}>{line}</option>
                  ))}
                </select>
              </div>
              
              <div className="selector-group">
                <label>Planta:</label>
                <select 
                  value={selectedPlant} 
                  onChange={(e) => setSelectedPlant(e.target.value)}
                  className="config-select"
                >
                  <option value="">Seleccionar planta</option>
                  {plants.map(plant => (
                    <option key={plant} value={plant}>{plant}</option>
                  ))}
                </select>
              </div>
              
              <div className="selector-group">
                <label>Maquinaria:</label>
                <select 
                  value={selectedMachine} 
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="config-select"
                >
                  <option value="">Seleccionar maquinaria</option>
                  {machines.map(machine => (
                    <option key={machine} value={machine}>{machine}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
