cat > build.sh << 'EOF'
#!/bin/bash
set -e

echo "📦 Installing root dependencies..."
npm install

echo "🔨 Building client..."
cd client
npm install
npm run build
echo "✅ Client build complete"
ls -la dist/
cd ..

echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

echo "✅ Build complete!"
EOF

chmod +x build.sh
