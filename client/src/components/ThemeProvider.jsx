import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [config, setConfig] = useState({
    theme_mode: 'dark',
    primary_color: '#3b82f6',
    logo_url: '',
    mecs_logo_url: '',
    watermark_opacity: '0.25',
    site_name: 'Science & Tech Club'
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/config')
      setConfig(data)
      applyTheme(data)
    } catch (error) {
      console.error('Failed to fetch config:', error)
    }
  }

  const applyTheme = (cfg) => {
    const root = document.documentElement
    
    // Apply theme mode
    if (cfg.theme_mode === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
    } else if (cfg.theme_mode === 'dark') {
      root.classList.remove('light')
      root.classList.add('dark')
    }

    // Apply primary color
    root.style.setProperty('--primary-color', cfg.primary_color)
    
    // Apply watermark
    root.style.setProperty('--watermark-opacity', cfg.watermark_opacity)
    
    // Apply watermark image if logo exists
    if (cfg.logo_url) {
      root.style.setProperty('--watermark-image', `url(${cfg.logo_url})`)
    }
  }

  return (
    <ThemeContext.Provider value={{ config, refreshConfig: fetchConfig }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
