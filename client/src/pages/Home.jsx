<nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md border-b border-gray-800 z-50">
  <div className="container mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* MECS Logo */}
        <img 
          src="https://i.ibb.co/sptF2qvk/mecs-logo.jpg" 
          alt="MECS Logo" 
          className="w-12 h-12 rounded-lg object-contain"
        />
        {/* Club Info */}
        <div>
          <div className="text-xl font-bold">Science & Tech Club</div>
          <div className="text-xs text-gray-500">MALLA REDDY ENGINEERING COLLEGE</div>
        </div>
      </div>
      <div className="hidden md:flex gap-6">
        <a href="#home" className="text-gray-400 hover:text-white transition">Home</a>
        <a href="#about" className="text-gray-400 hover:text-white transition">About</a>
        <a href="#features" className="text-gray-400 hover:text-white transition">Features</a>
        <a href="#team" className="text-gray-400 hover:text-white transition">Team</a>
      </div>
      <Link to="/login" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition">
        Login
      </Link>
    </div>
  </div>
</nav>
