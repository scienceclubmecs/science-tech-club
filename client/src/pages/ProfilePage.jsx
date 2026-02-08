import { useEffect, useState } from 'react'
import api from '../services/api'
import { Camera, Save, User } from 'lucide-react'
import Loading from '../components/Loading'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    department: '',
    year: 1,
    interests: [],
    research_interests: '',
    profile_photo_url: ''
  })

  const interestOptions = [
    'Web Development', 'Mobile Development', 'AI/ML', 'Data Science',
    'IoT', 'Robotics', 'Cloud Computing', 'Cybersecurity',
    'Blockchain', 'AR/VR', 'Game Development', 'DevOps'
  ]

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile')
      setProfile(data)
      setFormData({
        email: data.email || '',
        department: data.department || '',
        year: data.year || 1,
        interests: data.interests || [],
        research_interests: data.research_interests || '',
        profile_photo_url: data.profile_photo_url || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/users/profile', formData)
      
      // Update profile state
      setProfile(data)
      
      // Update localStorage user data
      const storedUser = JSON.parse(localStorage.getItem('user'))
      const updatedUser = { ...storedUser, ...data }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      alert('Profile updated successfully!')
      setEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleCancel = () => {
    setEditing(false)
    // Reset form to original profile data
    setFormData({
      email: profile.email || '',
      department: profile.department || '',
      year: profile.year || 1,
      interests: profile.interests || [],
      research_interests: profile.research_interests || '',
      profile_photo_url: profile.profile_photo_url || ''
    })
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-4 pb-12">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          {/* Profile Photo */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              {formData.profile_photo_url ? (
                <img
                  src={formData.profile_photo_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-800"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div 
                className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold ${
                  formData.profile_photo_url ? 'hidden' : ''
                }`}
              >
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              {editing && (
                <button 
                  type="button"
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.username}</h2>
              <p className="text-gray-400 capitalize">{profile?.role}</p>
              {profile?.committee_post && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-600 rounded-full text-xs">
                  {profile.committee_post}
                </span>
              )}
              {profile?.roll_number && (
                <p className="text-gray-500 text-sm mt-1">Roll: {profile.roll_number}</p>
              )}
              {profile?.employment_id && (
                <p className="text-gray-500 text-sm mt-1">ID: {profile.employment_id}</p>
              )}
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                />
              ) : (
                <p className="text-white">{profile?.email}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
              {editing ? (
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                >
                  <option value="">Select Department</option>
                  {['CSE', 'AIML', 'CSD', 'IT', 'CME', 'Civil', 'Mech', 'ECE', 'EEE'].map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              ) : (
                <p className="text-white">{profile?.department || 'Not set'}</p>
              )}
            </div>

            {/* Year (Students only) */}
            {profile?.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                {editing ? (
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                ) : (
                  <p className="text-white">Year {profile?.year}</p>
                )}
              </div>
            )}

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Interests</label>
              {editing ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-lg text-sm transition ${
                        formData.interests.includes(interest)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile?.interests?.length > 0 ? (
                    profile.interests.map(interest => (
                      <span key={interest} className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No interests added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Research Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {profile?.role === 'faculty' ? 'Research Interests' : 'Bio / About Me'}
              </label>
              {editing ? (
                <textarea
                  value={formData.research_interests}
                  onChange={(e) => setFormData({ ...formData, research_interests: e.target.value })}
                  placeholder={profile?.role === 'faculty' 
                    ? "Describe your research interests..." 
                    : "Tell us about yourself..."}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white h-24 focus:outline-none focus:border-blue-600"
                />
              ) : (
                <p className="text-white whitespace-pre-wrap">{profile?.research_interests || 'Not set'}</p>
              )}
            </div>

            {/* Profile Photo URL */}
            {editing && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Profile Photo URL</label>
                <input
                  type="url"
                  value={formData.profile_photo_url}
                  onChange={(e) => setFormData({ ...formData, profile_photo_url: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                />
                <p className="text-xs text-gray-500 mt-1">Enter a direct URL to your profile photo</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed px-6 py-2 rounded-lg transition"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
              >
                <User className="w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Completion Alert */}
        {(!profile?.profile_photo_url || !profile?.interests?.length) && (
          <div className="mt-6 bg-yellow-900/20 border border-yellow-700 rounded-xl p-6">
            <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Complete Your Profile</h3>
            <ul className="text-yellow-200 text-sm space-y-1">
              {!profile?.profile_photo_url && <li>• Add a profile photo</li>}
              {!profile?.interests?.length && <li>• Select your interests</li>}
            </ul>
          </div>
        )}

        {/* Account Info */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Account ID:</span>
              <span className="text-white ml-2 font-mono text-xs">{profile?.id}</span>
            </div>
            <div>
              <span className="text-gray-400">Member Since:</span>
              <span className="text-white ml-2">
                {new Date(profile?.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
