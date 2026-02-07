import { useEffect, useState } from 'react'
import api from '../services/api'
import { Users, Mail, Shield, Award } from 'lucide-react'
import Loading from '../components/Loading'

export default function TeamViewPage() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)

  const postOrder = [
    'Chair',
    'Vice Chair',
    'Secretary',
    'Vice Secretary',
    'CSE Head', 'CSE Vice Head',
    'AIML Head', 'AIML Vice Head',
    'IT Head', 'IT Vice Head',
    'Civil Head', 'Civil Vice Head',
    'ECE Head', 'ECE Vice Head',
    'EEE Head', 'EEE Vice Head',
    'Executive Head',
    'Executive Member',
    'Representative Head',
    'Representative Member',
    'Developer'
  ]

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    try {
      const { data } = await api.get('/users')
      const committeeMembers = data.filter(u => u.is_committee)
      
      // Sort by post order
      committeeMembers.sort((a, b) => {
        const aIndex = postOrder.indexOf(a.committee_post)
        const bIndex = postOrder.indexOf(b.committee_post)
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
      })
      
      setTeam(committeeMembers)
    } catch (error) {
      console.error('Failed to fetch team:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupByCategory = () => {
    const groups = {
      'Core Team': team.filter(m => ['Chair', 'Vice Chair', 'Secretary', 'Vice Secretary'].includes(m.committee_post)),
      'Department Heads': team.filter(m => m.committee_post?.includes('Head') && !['Executive Head', 'Representative Head'].includes(m.committee_post)),
      'Executives': team.filter(m => m.committee_post?.includes('Executive')),
      'Representatives': team.filter(m => m.committee_post?.includes('Representative')),
      'Developers': team.filter(m => m.committee_post === 'Developer')
    }
    return groups
  }

  if (loading) return <Loading />

  const groups = groupByCategory()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-full mb-4">
            <Shield className="w-6 h-6" />
            <span className="font-bold text-lg">Committee Team</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Meet Our Team</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Dedicated members working together to make Science & Tech Club a success
          </p>
        </div>

        {/* Team Groups */}
        {Object.entries(groups).map(([category, members]) => (
          members.length > 0 && (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-400" />
                {category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map(member => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )
        ))}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold">{team.length}</div>
            <div className="text-sm text-gray-400">Total Members</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold">{groups['Core Team'].length}</div>
            <div className="text-sm text-gray-400">Core Team</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold">{groups['Department Heads'].length}</div>
            <div className="text-sm text-gray-400">Dept Heads</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <div className="text-2xl font-bold">
              {groups['Executives'].length + groups['Representatives'].length}
            </div>
            <div className="text-sm text-gray-400">Exec & Reps</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MemberCard({ member }) {
  const getPostColor = (post) => {
    if (post?.includes('Chair')) return 'from-yellow-600 to-yellow-800'
    if (post?.includes('Secretary')) return 'from-blue-600 to-blue-800'
    if (post?.includes('Head')) return 'from-orange-600 to-orange-800'
    if (post?.includes('Executive')) return 'from-purple-600 to-purple-800'
    if (post?.includes('Representative')) return 'from-green-600 to-green-800'
    if (post?.includes('Developer')) return 'from-indigo-600 to-indigo-800'
    return 'from-gray-600 to-gray-800'
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
      <div className="flex items-start gap-4">
        {member.profile_photo_url ? (
          <img
            src={member.profile_photo_url}
            alt={member.username}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getPostColor(member.committee_post)} flex items-center justify-center text-2xl font-bold`}>
            {member.username[0].toUpperCase()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-1">{member.username}</h3>
          <div className={`inline-block px-3 py-1 rounded-full text-xs mb-2 bg-gradient-to-r ${getPostColor(member.committee_post)}`}>
            {member.committee_post}
          </div>
          
          <div className="space-y-1 text-sm text-gray-400">
            {member.department && (
              <div className="flex items-center gap-2">
                <Award className="w-3 h-3" />
                <span>{member.department}</span>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span className="truncate">{member.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
