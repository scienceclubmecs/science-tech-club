import { useState, useEffect } from 'react'
import { Settings, Palette } from 'lucide-react'
import api from '../services/api'

export default function AdminPanel() {
  const [config, setConfig] = useState({
    site_name: 'Science & Tech Club',
    logo_url: '',
    mecs_logo_url: '',
    theme_mode: 'dark', // dark, light, auto
    primary_color: '#3b82f6',
    watermark_opacity: '0.25'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/config')
      setConfig({ ...config, ...data })
    } catch (error) {
      console.error('Failed to fetch config:', error)
    }
  }

  const handleConfigSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await api.put('/config', config)
      setMessage('Configuration updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update config:', error)
      setMessage('Failed to update configuration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Panel</h1>

        {/* Site Configuration */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-white">Site Configuration</h2>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('success') ? 'bg-green-900/20 border border-green-800 text-green-400' : 'bg-red-900/20 border border-red-800 text-red-400'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleConfigSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Site Name</label>
                <input
                  type="text"
                  value={config.site_name}
                  onChange={(e) => setConfig({...config, site_name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  placeholder="Science & Tech Club"
                />
              </div>

              <div>
                <label className="block text-white mb-2 text-sm font-medium">Theme Mode</label>
                <select
                  value={config.theme_mode}
                  onChange={(e) => setConfig({...config, theme_mode: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                >
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
            </div>

            {/* Logos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Club Logo URL</label>
                <input
                  type="url"
                  value={config.logo_url}
                  onChange={(e) => setConfig({...config, logo_url: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  placeholder="https://your-logo-url.com/logo.png"
                />
                {config.logo_url && (
                  <div className="mt-2 p-2 bg-gray-800 rounded-lg inline-block">
                    <img src={config.logo_url} alt="Club Logo Preview" className="h-12 w-auto" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white mb-2 text-sm font-medium">MECS College Logo URL</label>
                <input
                  type="url"
                  value={config.mecs_logo_url}
                  onChange={(e) => setConfig({...config, mecs_logo_url: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  placeholder="https://mecs-logo-url.com/logo.png"
                />
                {config.mecs_logo_url && (
                  <div className="mt-2 p-2 bg-gray-800 rounded-lg inline-block">
                    <img src={config.mecs_logo_url} alt="MECS Logo Preview" className="h-12 w-auto" />
                  </div>
                )}
              </div>
            </div>

            {/* Theme Customization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.primary_color}
                    onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                    className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primary_color}
                    onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2 text-sm font-medium">Watermark Opacity (0.1 - 0.5)</label>
                <input
                  type="number"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={config.watermark_opacity}
                  onChange={(e) => setConfig({...config, watermark_opacity: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 py-3 rounded-lg font-medium transition"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>

        {/* Other admin sections... */}
      </div>
    </div>
  )
}
