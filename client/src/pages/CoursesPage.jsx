import { useState, useEffect } from 'react'
import { Upload, Play, MessageCircle, ThumbsUp, Heart, Laugh, Send, User } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function CoursesPage() {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [comments, setComments] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  useEffect(() => {
    if (selectedVideo) {
      fetchComments(selectedVideo.id)
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

    setUploading(true)
    const formData = new FormData()
    formData.append('video', file)
    formData.append('title', file.name.split('.')[0])

    try {
      const { data } = await api.post('/courses/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setVideos([data, ...videos])
      alert('Video uploaded successfully!')
      e.target.value = null // Reset file input
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const { data } = await api.post(`/courses/videos/${selectedVideo.id}/comments`, {
        content: newComment.trim()
      })
      setComments([data, ...comments])
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

  const getReactionCount = (comment) => {
    const counts = {}
    comment.reactions?.forEach(r => {
      counts[r.reaction] = (counts[r.reaction] || 0) + 1
    })
    return counts
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-20 px-4 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Upload className="w-24 h-24 mx-auto mb-6 text-gray-700" />
          <h2 className="text-2xl font-bold mb-2">No Videos Yet</h2>
          <p>Upload your first course video to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-white">Courses</h1>
          {user && (
            <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl cursor-pointer transition">
              <Upload className="w-5 h-5" />
              <span>Upload Video</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleUploadVideo}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {videos.map((video) => (
            <div
              key={video.id}
              className={`bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-600 transition cursor-pointer ${
                selectedVideo?.id === video.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              }`}
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative pt-[56.25%] bg-gradient-to-r from-gray-900 to-black">
                <video
                  src={`https://${process.env.REACT_APP_SUPABASE_URL?.replace('https://', '')}/storage/v1/object/public/course-videos/${video.video_url}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                >
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div className="flex items-center gap-2">
                    <Play className="w-8 h-8 text-white bg-white bg-opacity-20 p-2 rounded-lg" />
                    <div>
                      <h3 className="font-bold text-white line-clamp-2">{video.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{video.views} views</span>
                        <span>•</span>
                        <span>{new Date(video.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {video.uploader && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <User className="w-4 h-4" />
                    <span>{video.uploader.username}</span>
                  </div>
                )}
                {video.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{video.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedVideo && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Video Player */}
            <div className="relative pt-[56.25%] bg-black">
              <video
                controls
                className="absolute inset-0 w-full h-full object-contain"
                src={`https://${process.env.REACT_APP_SUPABASE_URL?.replace('https://', '')}/storage/v1/object/public/course-videos/${selectedVideo.video_url}`}
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
                <span>{selectedVideo.views} views</span>
                <span>•</span>
                <span>{new Date(selectedVideo.created_at).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            {/* Comments */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="w-6 h-6 text-gray-500" />
                <h3 className="text-xl font-bold text-white">
                  Comments ({comments.length})
                </h3>
              </div>

              {user && (
                <form onSubmit={handleAddComment} className="mb-6 p-4 bg-gray-800 rounded-xl">
                  <div className="flex gap-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-transparent border-none outline-none resize-none h-16 text-white placeholder-gray-500"
                      rows="2"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-3 rounded-xl flex items-center gap-2 transition"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              )}

              {loadingComments ? (
                <div className="text-center py-12 text-gray-500">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-800 rounded-xl p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {comment.commenter.profile_photo_url ? (
                          <img
                            src={comment.commenter.profile_photo_url}
                            alt={comment.commenter.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {comment.commenter.username?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">
                              {comment.commenter.full_name || comment.commenter.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-white mb-3">{comment.content}</p>
                        </div>
                      </div>

                      {/* Reactions */}
                      <div className="flex items-center gap-2">
                        {user && (
                          <>
                            <button
                              onClick={() => handleReaction(comment.id, 'like')}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span>Like</span>
                            </button>
                            <button
                              onClick={() => handleReaction(comment.id, 'love')}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition"
                            >
                              <Heart className="w-4 h-4" />
                              <span>Love</span>
                            </button>
                            <button
                              onClick={() => handleReaction(comment.id, 'haha')}
                              className="flex
