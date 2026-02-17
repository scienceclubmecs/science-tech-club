import { useState, useEffect } from 'react'
import { Upload, Play, MessageCircle, ThumbsUp, Heart, Laugh, Send, User } from 'lucide-react'
import api from '../services/api'

export default function CoursesPage() {
  const [user, setUser] = useState(null)
  const [videos, setVideos] = useState([])
  const [comments, setComments] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    // Get current user from localStorage
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchVideos()
  }, [])

  useEffect(() => {
    if (selectedVideo) {
      fetchComments(selectedVideo.id)
      const interval = setInterval(() => fetchComments(selectedVideo.id), 5000)
      return () => clearInterval(interval)
    }
  }, [selectedVideo])

  const fetchVideos = async () => {
    try {
      const { data } = await api.get('/courses/videos')
      setVideos(data || [])
    } catch (error) {
      console.error('Fetch videos error:', error)
    }
  }

  const fetchComments = async (videoId) => {
    setLoadingComments(true)
    try {
      const { data } = await api.get(`/courses/videos/${videoId}/comments`)
      setComments(data || [])
    } catch (error) {
      console.error('Fetch comments error:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const title = prompt('Enter video title:')
    if (!title) return

    const description = prompt('Enter video description (optional):')

    setUploading(true)
    const formData = new FormData()
    formData.append('video', file)
    formData.append('title', title)
    if (description) formData.append('description', description)

    try {
      const { data } = await api.post('/courses/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setVideos([data, ...videos])
      alert('Video uploaded successfully!')
      e.target.value = null
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !selectedVideo) return

    try {
      const { data } = await api.post(`/courses/videos/${selectedVideo.id}/comments`, {
        content: newComment.trim()
      })
      setComments([...comments, data])
      setNewComment('')
    } catch (error) {
      alert('Failed to add comment')
    }
  }

  const handleReaction = async (commentId, reaction) => {
    try {
      await api.post(`/courses/comments/${commentId}/react`, { reaction })
      fetchComments(selectedVideo.id)
    } catch (error) {
      console.error('Reaction error:', error)
    }
  }

  const getReactionCounts = (comment) => {
    const counts = {}
    comment.reactions?.forEach(r => {
      counts[r.reaction] = (counts[r.reaction] || 0) + 1
    })
    return counts
  }

  const hasUserReacted = (comment, reaction) => {
    return comment.reactions?.some(r => r.user_id === user?.id && r.reaction === reaction)
  }

  const reactionIcons = {
    like: { icon: ThumbsUp, color: 'text-blue-400', label: 'Like' },
    love: { icon: Heart, color: 'text-red-400', label: 'Love' },
    haha: { icon: Laugh, color: 'text-yellow-400', label: 'Haha' }
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Courses</h1>
          {user && (
            <label className={`flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer transition ${
              uploading 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}>
              <Upload className="w-5 h-5" />
              <span>{uploading ? 'Uploading...' : 'Upload Video'}</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleUploadVideo}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Upload className="w-24 h-24 mx-auto mb-6 text-gray-700" />
            <h2 className="text-2xl font-bold mb-2">No Videos Yet</h2>
            <p>Upload your first course video to get started</p>
          </div>
        ) : (
          <>
            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`bg-gray-900 border rounded-2xl overflow-hidden hover:border-blue-600 transition cursor-pointer ${
                    selectedVideo?.id === video.id 
                      ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
                      : 'border-gray-800'
                  }`}
                  onClick={() => setSelectedVideo(video)}
                >
                  {/* Video Thumbnail */}
                  <div className="relative pt-[56.25%] bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-16 h-16 text-white opacity-80" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{video.views || 0} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-2 line-clamp-2">{video.title}</h3>
                    {video.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">{video.description}</p>
                    )}
                    {video.uploader && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{video.uploader.full_name || video.uploader.username}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Video Player & Comments */}
            {selectedVideo && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {/* Video Player */}
                <div className="relative pt-[56.25%] bg-black">
                  <video
                    controls
                    autoPlay
                    className="absolute inset-0 w-full h-full object-contain"
                    src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/course-videos/${selectedVideo.video_url}`}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Video Info */}
                <div className="p-6 border-b border-gray-800">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                  {selectedVideo.description && (
                    <p className="text-gray-400 mb-4">{selectedVideo.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{selectedVideo.views || 0} views</span>
                    <span>•</span>
                    <span>{new Date(selectedVideo.created_at).toLocaleDateString('en-IN')}</span>
                    {selectedVideo.uploader && (
                      <>
                        <span>•</span>
                        <span>By {selectedVideo.uploader.full_name || selectedVideo.uploader.username}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <MessageCircle className="w-6 h-6 text-gray-500" />
                    <h3 className="text-xl font-bold text-white">
                      {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                    </h3>
                  </div>

                  {/* Add Comment Form */}
                  {user ? (
                    <form onSubmit={handleAddComment} className="mb-6">
                      <div className="bg-gray-800 rounded-xl p-4">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full bg-transparent border-none outline-none resize-none text-white placeholder-gray-500"
                          rows="3"
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-2 rounded-lg flex items-center gap-2 transition"
                          >
                            <Send className="w-4 h-4" />
                            <span>Comment</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="mb-6 p-4 bg-gray-800 rounded-xl text-center text-gray-500">
                      Please login to comment
                    </div>
                  )}

                  {/* Comments List */}
                  {loadingComments ? (
                    <div className="text-center py-12 text-gray-500">Loading comments...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                      <p>No comments yet. Be the first to comment!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {comments.map((comment) => {
                        const reactionCounts = getReactionCounts(comment)
                        
                        return (
                          <div key={comment.id} className="bg-gray-800 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              {/* Avatar */}
                              {comment.commenter?.profile_photo_url ? (
                                <img
                                  src={comment.commenter.profile_photo_url}
                                  alt={comment.commenter.username}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {comment.commenter?.username?.[0]?.toUpperCase() || '?'}
                                </div>
                              )}

                              {/* Comment Content */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-white">
                                    {comment.commenter?.full_name || comment.commenter?.username || 'Unknown'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleString('en-IN', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="text-white mb-3">{comment.content}</p>

                                {/* Reactions */}
                                <div className="flex items-center gap-4">
                                  {user && Object.entries(reactionIcons).map(([key, { icon: Icon, color, label }]) => {
                                    const count = reactionCounts[key] || 0
                                    const hasReacted = hasUserReacted(comment, key)

                                    return (
                                      <button
                                        key={key}
                                        onClick={() => handleReaction(comment.id, key)}
                                        className={`flex items-center gap-1 text-xs transition ${
                                          hasReacted 
                                            ? `${color} font-semibold` 
                                            : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                      >
                                        <Icon className="w-4 h-4" />
                                        <span>{label}</span>
                                        {count > 0 && <span className="ml-1">({count})</span>}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
