import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'
import { FaEye} from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { useAuth } from '../../../hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('mecanaut123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await login({ username, password })
      navigate('/chatbot')
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Error desconocido al iniciar sesión')
      }
    }
  }

  return (
    <>
      <div className={styles.loginBackground}>
        <div className={styles.loginMascot}></div>
        <div className={styles.loginGears}></div>
      </div>
      
      <div className={styles.loginContainer}>
        <div className={styles.loginForm}>
          <div className={styles.formHeader}>
            <h1 className={styles.title}>Iniciar Sesión</h1>
            <p className={styles.subtitle}>Ingrese su cuenta de MecanIA</p>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nombre de Usuario</label>
              <div className={styles.inputWrapper}>
              <div className={styles.inputBackLayer} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
                placeholder="Ingrese su nombre de usuario"
                required
                disabled={isLoading}
              />
              </div>

          <label className={styles.label}>Contraseña</label>
            <div className={styles.inputWrapper}>
              <div className={styles.inputBackLayer} />
              <div className={styles.passwordContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Ingrese su contraseña"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
              disabled={isLoading}
            >
              {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </button>
            </div>
            </div>

              </div>
            
            {error && (
              <div style={{ 
                color: '#ff4444', 
                fontSize: '14px', 
                marginBottom: '16px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 68, 68, 0.3)'
              }}>
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
