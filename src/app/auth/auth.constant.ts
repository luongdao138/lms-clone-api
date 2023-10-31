import { isDev } from 'src/utils/env';

export const authOptions = {
  tokens: {
    accessExpiresIn: isDev ? 2 * 60 * 60 : 5 * 60,
    refreshExpiresIn: 30 * 24 * 60 * 60, // 30 days
    whiteListAccessTokenPrefix: 'WHITE_LIST_AT_',
    whiteListRefreshTokenPrefix: 'WHITE_LIST_RT_',
    otpExpiresIn: 5 * 60, // 5 minutes
  },
};

export enum USER_EVENT {
  SIGNUP = 'signup',
}
