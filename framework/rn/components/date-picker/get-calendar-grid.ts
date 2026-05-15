export type CalendarCell = {
  date: Date
  current: boolean
}

const buildGrid = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7

  const cells: CalendarCell[] = []

  for (let i = 0; i < startOffset; i++) {
    cells.push({
      date: new Date(year, month, 1 - startOffset + i),
      current: false,
    })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: new Date(year, month, d),
      current: true,
    })
  }
  for (let i = 1; cells.length < 42; i++) {
    cells.push({
      date: new Date(year, month + 1, i),
      current: false,
    })
  }

  return cells
}

const cache = new Map<string, CalendarCell[]>()

const now = new Date()
const thisYear = now.getFullYear()
const thisMonth = now.getMonth()
const thisMonthKey = `${thisYear}-${thisMonth}`
cache.set(thisMonthKey, buildGrid(thisYear, thisMonth))

export const getCalendarGrid = (year: number, month: number) => {
  const key = `${year}-${month}`
  if (!cache.has(key)) {
    cache.set(key, buildGrid(year, month))
  }
  return cache.get(key) as CalendarCell[]
}
