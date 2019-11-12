const monthName = [
  `Jan`,
  `Feb`,
  `Mar`,
  `Apr`,
  `May`,
  `Jun`,
  `Jul`,
  `Aug`,
  `Sep`,
  `Oct`,
  `Nov`,
  `Dec`,
];

const isToday = time => {
  const now = new Date();
  const beginOfToday = now.setHours(0, 0, 0, 0);
  const endOfTday = now.setHours(23, 59, 59, 999);
  return time >= beginOfToday && time <= endOfTday;
};

const formatTime = time => {
  time = time.replace(` `, `T`) + `Z`;
  time = new Date(time);
  const hour = time
    .getHours()
    .toString()
    .padStart(2, `0`);
  const min = time
    .getMinutes()
    .toString()
    .padStart(2, `0`);

  if (isToday(time)) return `${hour}:${min}`;

  const month = monthName[time.getMonth()];
  const day = time.getDate();
  return `${month} ${day} - ${hour}:${min}`;
};

export default formatTime;
