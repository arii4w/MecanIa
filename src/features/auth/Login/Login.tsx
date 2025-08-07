import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'
import { FaEye} from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";

export default function Login() {
  const [email, setEmail] = useState('development_mecanaut@gmail.com')
  const [password, setPassword] = useState('mecanaut123')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'development_mecanaut@gmail.com' && password === 'mecanaut123') {
      navigate('/mecanIA')
    } else {
      alert('Credenciales incorrectas')
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
            <p className={styles.subtitle}>Ingrese su cuenta de Mecanaut</p>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Correo Electrónico</label>
              <div className={styles.inputWrapper}>
              <div className={styles.inputBackLayer} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
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
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
            >
              {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </button>
            </div>
            </div>

              </div>
            
            <button type="submit" className={styles.submitButton}>
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
