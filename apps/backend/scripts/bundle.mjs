import { rm } from 'node:fs/promises';
import { build } from 'esbuild';

const entryPoints = [
  'src/handlers/health.ts',
  'src/handlers/profile.ts',
  'src/handlers/chat.ts',
  'src/handlers/transcribe.ts',
  'src/handlers/speak.ts',
];

// Optional MongoDB native/cloud peer dependencies that are dynamically required
// only when their corresponding auth/compression features are enabled.
const optionalMongoExternals = [
  'kerberos',
  '@mongodb-js/zstd',
  '@aws-sdk/credential-providers',
  'snappy',
  'socks',
  'aws4',
  'mongodb-client-encryption',
];

await rm('dist-lambda', { recursive: true, force: true });

await build({
  entryPoints,
  outdir: 'dist-lambda',
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  outExtension: { '.js': '.cjs' },
  external: optionalMongoExternals,
});

console.log('Bundled 5 Lambda handlers into apps/backend/dist-lambda/');
