// Run with: pm2 start deploy/ecosystem.config.js (from the repo root)
module.exports = {
  apps: [
    {
      name: 'ovius-server',
      cwd: './server',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
