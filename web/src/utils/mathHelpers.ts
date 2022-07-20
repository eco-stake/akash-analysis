import { Coin } from "@src/types";

export function nFormatter(num: number, digits: number) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

export function udenomToDemom(_amount: string | number, precision = 3, decimals: number = 1_000_000) {
  const amount = typeof _amount === "string" ? parseInt(_amount) : _amount;
  return roundDecimal(amount / decimals, precision);
}

export function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function roundDecimal(value: number, precision = 2) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

export function ceilDecimal(value: number) {
  return Math.ceil((value + Number.EPSILON) * 100) / 100;
}

export function uaktToAKT(amount: number, precision = 2) {
  return roundDecimal(amount / 1000000, precision);
}

export function coinsToAmount(coins: Coin[] | Coin, denom: string, precision: number) {
  const currentCoin = (coins as any).length !== undefined ? (coins as Coin[]).find(c => c.denom === denom) : (coins as Coin);
  if (!currentCoin) return 0;
  else return udenomToDemom(currentCoin.amount, precision);
}

export function percIncrease(a: number, b: number) {
  let percent: number;
  if (b !== 0) {
    if (a !== 0) {
      percent = (b - a) / a;
    } else {
      percent = b;
    }
  } else {
    percent = -a;
  }
  return roundDecimal(percent, 4);
}
