const accountingService = require('../services/accountingService');
const catchAsync = require('../utils/catchAsync');

const getAccountingSummary = catchAsync(async (req, res, next) => {
  const summary = await accountingService.getFinancialSummary(req.tenantId, req.query);
  res.json(summary);
});

module.exports = {
  getAccountingSummary
};
