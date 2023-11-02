import * as dayjs from 'dayjs';
import { DateTime } from '../types/common';

export const TimeUtil = {
  isBefore(time: DateTime, comparedTime: DateTime) {
    return dayjs(time).isBefore(comparedTime);
  },
  add(
    value: number,
    from: DateTime = new Date(),
    unit: dayjs.ManipulateType = 'millisecond',
  ) {
    return dayjs(from).add(value, unit);
  },
  diff(
    day1: DateTime,
    day2: DateTime,
    unit?: dayjs.QUnitType | dayjs.OpUnitType,
  ) {
    return Math.abs(dayjs(day1).diff(day2, unit));
  },
};
