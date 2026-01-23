const fs = require('fs');
const path = require('path');

function deleteFileSync(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      // En Windows, intentar cambiar atributos antes de eliminar
      if (process.platform === 'win32') {
        try {
          fs.chmodSync(filePath, 0o777);
        } catch (err) {
          // Ignorar errores de chmod
        }
      }
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${filePath}`);
    }
  } catch (error) {
    console.warn(`Warning: Could not delete ${filePath}: ${error.message}`);
  }
}

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    try {
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`Deleted folder: ${folderPath}`);
    } catch (error) {
      console.warn(`Warning: Could not delete folder ${folderPath}: ${error.message}`);
    }
  }
}

// Cleanup before build
console.log('Running pre-build cleanup...');

const projectRoot = process.cwd();
const releasePath = path.join(projectRoot, 'release');

// Kill any electron processes
if (process.platform === 'win32') {
  try {
    require('child_process').execSync('taskkill /F /IM electron.exe /T 2>nul || taskkill /F /IM brodapp.exe /T 2>nul', { stdio: 'ignore' });
    console.log('Killed Electron processes');
  } catch (err) {
    // Ignore errors if no processes found
  }
  
  // Wait a bit for processes to fully close
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  sleep(2000).then(() => {
    // Clean release directory
    deleteFolderRecursive(releasePath);
    console.log('Pre-build cleanup completed');
  });
} else {
  // Clean release directory for non-Windows
  deleteFolderRecursive(releasePath);
  console.log('Pre-build cleanup completed');
}