export const chartPaths = [
  "new-players",
  "total-players",
  "total-in-game-hours-24",
  "total-in-game-hours",
  "taxes-paid-24",
  "total-taxes-paid",
  "dao-revenue-24",
  "total-dao-revenue"
];

export const useChartInfo = (chartPath: string) => {
  const info = {
    "new-players": {title: "New players", showDecimals: false},
    "total-players": {title: "Total players", showDecimals: false},
    "total-in-game-hours-24": {title: "Daily in-game hours", showDecimals: true},
    "total-in-game-hours": {title: "Total in-game hours", showDecimals: true},
    "taxes-paid-24": {title: "Daily taxes paid", showDecimals: false},
    "total-taxes-paid": {title: "Total taxes paid", showDecimals: false},
    "dao-revenue-24": {title: "Daily DAO revenue", showDecimals: false},
    "total-dao-revenue": {title: "Total DAO revenue", showDecimals: false},
  }

  return info[chartPath];
} 