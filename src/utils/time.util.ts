import * as dayjs from 'dayjs';

export type DateTime = string | number | Date | dayjs.Dayjs;
export const TimeUtil = {
  isBefore(time: DateTime, comparedTime: DateTime) {
    return dayjs(time).isBefore(comparedTime);
  },
};
