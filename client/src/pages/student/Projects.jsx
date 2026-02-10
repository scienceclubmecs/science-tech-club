import { Download } from 'lucide-react'

// Add state for report format
const [reportFormat, setReportFormat] = useState(null)

// Fetch report format
useEffect(() => {
  fetchReportFormat()
}, [])

const fetchReportFormat = async () => {
  try {
    const { data } = await api.get('/report-formats/active')
    setReportFormat(data)
  } catch (error) {
    console.error('Failed to fetch report format:', error)
  }
}

// In your project card/detail view, add:
{project.status === 'completed' && reportFormat && (
  <a
    href={reportFormat.file_url}
    download={reportFormat.file_name}
    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
  >
    <Download className="w-5 h-5" />
    Download Report Format
  </a>
)}
