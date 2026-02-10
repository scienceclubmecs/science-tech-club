import { useState, useEffect } from 'react'
import { Upload, FileText, Trash2, Check, Download, Calendar } from 'lucide-react'
import api from '../../services/api'

export default function ReportFormats() {
  const [formats, setFormats] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    academic_year: '',
    file: null
  })

  useEffect(() => {
    fetchFormats()
  }, [])

  const fetchFormats = async () => {
    try {
      const { data } = await api.get('/report-formats')
      setFormats(data)
    } catch (error) {
      console.error('Failed to fetch formats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!formData.file) {
      alert('Please select a file')
      return
    }

    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', formData.file)
      data.append('title', formData.title)
      data.append('academic_year', formData.academic_year)

      await api.post('/report-formats/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      alert('Report format uploaded successfully!')
      setFormData({ title: '', academic_year: '', file: null })
      fetchFormats()
    } catch (error) {
      console.error('Upload failed:', error)
      alert(error.response?.data?.message || 'Failed to upload format')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this report format?')) return

    try {
      await api.delete(`/report-formats/${id}`)
      alert('Format deleted successfully')
      fetchFormats()
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete format')
    }
  }

  const handleActivate = async (id) => {
    try {
      await api.put(`/report-formats/${id}/activate`)
      alert('Format activated successfully')
      fetchFormats()
    } catch (error) {
      console.error('Activate failed:', error)
      alert('Failed to activate format')
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Project Report Formats</h1>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Upload New Format</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Format Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., Project Report Format 2026"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Academic Year
            </label>
            <input
              type="text"
              value={formData.academic_year}
              onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., 2025-2026"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Document (.doc or .docx)
            </label>
            <input
              type="file"
              accept=".doc,.docx"
              onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            {formData.file && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {formData.file.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Format'}
          </button>
        </form>
      </div>

      {/* Formats List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Uploaded Formats</h2>
        </div>
        <div className="divide-y">
          {formats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No report formats uploaded yet
            </div>
          ) : (
            formats.map((format) => (
              <div
                key={format.id}
                className="p-6 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{format.title}</h3>
                      {format.is_active && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format.academic_year}
                      </span>
                      <span>{format.file_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={format.file_url}
                    download
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  {!format.is_active && (
                    <button
                      onClick={() => handleActivate(format.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(format.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
