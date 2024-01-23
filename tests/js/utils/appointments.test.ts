import { isTimeRangeInAvailableRange } from "~/utils/appointments";

test('test', () => {
  const test = isTimeRangeInAvailableRange(
    [new Date(2021, 1, 1), new Date(2021, 1, 2)],
    [new Date(2021, 1, 1), new Date(2021, 1, 2)]
  );

  expect(test).toBe(true);
});

test('test 2', () => {
  expect(2).toBe(2);
});