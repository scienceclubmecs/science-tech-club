import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Upload } from 'lucide-react'
import api from '../services/api'
import Loading from '../components/Loading'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile')
      setProfile(data)
      setEditedProfile(data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
    setEditedProfile({ ...profile })
  }

  const handleCancel = () => {
    setEditing(false)
    setEditedProfile({ ...profile })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/users/profile', editedProfile)
      setProfile(data)
      setEditing(false)
      
      // Update local storage
      const user = JSON.parse(localStorage.getItem('user'))
      localStorage.setItem('user', JSON.stringify({ ...user, ...data }))
      
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // In Profile.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Only send fields that have values
    const updateData = {};
    
    if (formData.full_name) updateData.full_name = formData.full_name;
    if (formData.bio) updateData.bio = formData.bio;
    if (formData.department) updateData.department = formData.department;
    if (formData.year) updateData.year = formData.year;
    if (formData.roll_number) updateData.roll_number = formData.roll_number;
    if (formData.phone) updateData.phone = formData.phone;
    if (formData.github_url) updateData.github_url = formData.github_url;
    if (formData.linkedin_url) updateData.linkedin_url = formData.linkedin_url;

    const { data } = await api.put('/users/profile', updateData);
    
    alert('✅ Profile updated successfully!');
    setProfile(data);
  } catch (error) {
    console.error('Profile update failed:', error);
    alert(error.response?.data?.message || 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};

  if (loading) return <Loading />
  if (!profile) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Profile not found</div>

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">My Profile</h1>
          
          {!editing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
            >
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-2 rounded-lg transition"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          {/* Profile Picture */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-800">
            <div className="relative">
              {profile.profile_photo_url ? (
                <img 
                  src={profile.profile_photo_url} 
                  alt={profile.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-bold">
                  {profile.username?.[0]?.toUpperCase()}
                </div>
              )}
              
              {editing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full">
                  <Upload className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-1">{profile.full_name || profile.username}</h2>
              <p className="text-gray-400 mb-2">{profile.email}</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                profile.role === 'admin' ? 'bg-red-600' :
                profile.role === 'faculty' ? 'bg-purple-600' :
                profile.is_committee ? 'bg-blue-600' :
                'bg-green-600'
              }`}>
                {profile.role === 'admin' ? 'Admin' :
                 profile.role === 'faculty' ? 'Faculty' :
                 profile.is_committee ? 'Committee Member' :
                 'Student'}
              </span>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <input
                type="text"
                value={editing ? editedProfile.username : profile.username}
                onChange={(e) => handleChange('username', e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-60 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={editing ? editedProfile.full_name || '' : profile.full_name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-60 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={editing ? editedProfile.email : profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-60 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone
              </label>
              <input
                type="tel"
                value={editing ? editedProfile.phone || '' : profile.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={!editing}
                placeholder="Enter phone number"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-60 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Department (for students) */}
            {profile.role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Department
                  </label>
                  <select
                    value={editing ? editedProfile.department || '' : profile.department || ''}
                    onChange={(e) => handleChange('department', e.target.value)}
                    disabled={!editing}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-60 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">CSE</option>
                    <option value="AIML">AIML</option>
                    <option value="CSD">CSD</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Civil">Civil</option>
                    <option value="Mech">Mechanical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Year
                  </label>
                  <select
                    value={editing ? editedProfile.year || '' : profile.year || ''}
                    onChange={(e) => handleChange('year', parseInt(e.target.value))}
                    disabled={!editing}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-60 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </>
            )}

            {/* Location */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                value={editing ? editedProfile.location || '' : profile.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                disabled={!editing}
                placeholder="Enter your location"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-60 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Bio
              </label>
              <textarea
                value={editing ? editedProfile.bio || '' : profile.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                disabled={!editing}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-60 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Interests */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Interests (comma-separated)
              </label>
              <input
                type="text"
                value={editing 
                  ? (Array.isArray(editedProfile.interests) ? editedProfile.interests.join(', ') : editedProfile.interests || '')
                  : (Array.isArray(profile.interests) ? profile.interests.join(', ') : profile.interests || '')
                }
                onChange={(e) => handleChange('interests', e.target.value.split(',').map(i => i.trim()))}
                disabled={!editing}
                placeholder="e.g., Web Development, AI/ML, Robotics"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-60 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Member Since:</span>
                <p className="text-white mt-1">{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-400">Last Updated:</span>
                <p className="text-white mt-1">{new Date(profile.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
