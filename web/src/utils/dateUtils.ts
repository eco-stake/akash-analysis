export const epochToDate = (epoch: number) => {
  // The 0 sets the date to the epoch
  const d = new Date(0);
  d.setUTCSeconds(epoch);

  return d;
};
