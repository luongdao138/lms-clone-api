import { isDev } from 'src/utils/env';

export const authOptions = {
  tokens: {
    accessExpiresIn: isDev ? 2 * 60 * 60 : 5 * 60,
    refreshExpiresIn: 30 * 24 * 60 * 60,
    whiteListAccessTokenPrefix: 'WHITE_LIST_AT_',
    whiteListRefreshTokenPrefix: 'WHITE_LIST_RT_',
  },
};
