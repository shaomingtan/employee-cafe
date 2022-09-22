
// Helper function to calculate date from number of days ago.
const getDateXDaysAgo = (numOfDays) => {
  const today = new Date()
  const daysAgo = new Date(today.getTime());

  daysAgo.setDate(today.getDate() - numOfDays);

  return daysAgo;
}

module.exports = {
  getDateXDaysAgo
}