// @ts-nocheck
import accountingService from '../services/accountingService';
import catchAsync from '../utils/catchAsync';

const getAccountingSummary = catchAsync(async (req, res, next) => {
  const summary = await accountingService.getFinancialSummary(req.tenantId, req.query);
  res.json(summary);
});

export default { 
  getAccountingSummary
 };
