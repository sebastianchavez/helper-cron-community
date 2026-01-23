const { execSync } = require('child_process');
const path = require('path');

// Generar timestamp para directorio único
const outputDir = `release`;

console.log(`Building with output directory: ${outputDir}`);

try {
  // Kill any electron processes
  console.log('Killing Electron processes...');
  try {
    execSync('taskkill /F /IM electron.exe /T 2>nul || taskkill /F /IM brodapp.exe /T 2>nul', { stdio: 'inherit' });
  } catch (e) {
    // Ignore if no processes found
  }

  // Build Electron backend
  console.log('Building Electron backend...');
  execSync('npm run electron:build', { stdio: 'inherit' });

  // Build Angular frontend
  console.log('Building Angular frontend...');
  execSync('ng build --configuration production', { stdio: 'inherit' });

  // Build with electron-builder using unique output directory
  console.log('Building with electron-builder...');
  const builderCommand = `electron-builder --win --config.directories.output="${outputDir}"`;
  execSync(builderCommand, { stdio: 'inherit' });

  console.log(`\nBuild completed successfully!`);
  console.log(`Output directory: ${outputDir}`);

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}