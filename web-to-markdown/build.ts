import { copyFile, mkdir } from 'node:fs/promises';
import { build } from 'bun';

async function copyPublicFiles() {
  try {
    // Ensure dist/icons directory exists
    await mkdir('dist/icons', { recursive: true });
    
    // Copy manifest
    await copyFile('public/manifest.json', 'dist/manifest.json');
    
    // Copy icons
    await copyFile('public/icons/icon48.png', 'dist/icons/icon48.png');
    await copyFile('public/icons/icon128.png', 'dist/icons/icon128.png');
  } catch (error) {
    console.error('Error copying public files:', error);
    process.exit(1);
  }
}

async function buildExtension() {
  try {
    // Build TypeScript files
    await build({
      entrypoints: ['./src/content.ts', './src/background.ts'],
      outdir: './dist',
      minify: true,
      target: 'browser',
    });

    // Copy public files
    await copyPublicFiles();

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildExtension();
