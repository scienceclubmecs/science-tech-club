const handleGraduateStudents = async () => {
  if (!confirm('Graduate all students to next year? (4th year students will be removed)')) return
  
  try {
    // Get all students
    const students = allUsers.filter(u => u.role === 'student' && u.year)
    
    for (const student of students) {
      if (student.year === 4) {
        // Delete 4th year students
        await api.delete(`/users/${student.id}`)
      } else {
        // Promote to next year
        await api.put(`/users/${student.id}`, { year: student.year + 1 })
      }
    }
    
    alert('All students graduated successfully!')
    fetchAllUsers()
  } catch (error) {
    alert('Failed to graduate students')
  }
}
