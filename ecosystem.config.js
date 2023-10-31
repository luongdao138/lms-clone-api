module.exports = {
  apps: [
    {
      name: 'prisma-studio',
      script: 'yarn db:studio',
      watch: './prisma',
      ignore_watch: ['node_modules', '.git', '*.log'],
    },
    {
      name: 'dev-server',
      script: 'yarn start:dev',
      ignore_watch: ['node_modules', '.git', '*.log'],
    },
  ],
};
