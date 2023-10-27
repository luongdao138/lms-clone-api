module.exports = {
  apps: [
    {
      name: 'prisma-studio',
      script: 'yarn db:studio',
      watch: './prisma',
    },
    {
      name: 'dev-server',
      script: 'yarn start:dev',
    },
  ],
};
