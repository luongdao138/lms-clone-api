export const authOptions = {
  tokens: {
    accessExpiresIn: 5 * 60,
    refreshExpiresIn: 30 * 24 * 60 * 60,
    whiteListAccessTokenPrefix: 'WHITE_LIST_AT_',
    whiteListRefreshTokenPrefix: 'WHITE_LIST_RT_',
  },
};
