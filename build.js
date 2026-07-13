const fs = require('fs');
const path = require('path');

const filesToCopy = [
  'index.html',
  'index.css',
  'index.js',
  'download.svg',
  'mindmap_process.png',
  'outcast_brand_story.docx'
];

const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy each file
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Copied ${file} to dist/`);
  } else {
    console.log(`⚠ Warning: ${file} not found, skipping.`);
  }
});

console.log('Build completed successfully!');
