import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const nextConfig = {
  outputFileTracingRoot: repoRoot,
  outputFileTracingIncludes: {
    '/api/analyze': [
      '../configuration.js',
      '../deterministicTranscriptParser.js',
      '../societyRules.js',
      '../societyUtils.js',
      '../SocietyLogic/*.js'
    ]
  },
  turbopack: {
    root: repoRoot
  }
};

export default nextConfig;
