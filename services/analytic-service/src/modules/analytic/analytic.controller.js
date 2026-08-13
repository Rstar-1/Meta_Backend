import * as analyticService from "./analytic.service.js";
import { constants } from "../../../../../shared/index.js";
const { statusCodes } = constants;

const handleRequest = (serviceMethod) => async (req, res, next) => {
  try {
    const filters = {
      period: req.query.period,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    const result = await serviceMethod(filters, req.user);
    return res.status(statusCodes.HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
};

export const getArticlesAnalytics = handleRequest(analyticService.getArticlesAnalytics);
export const getProductsAnalytics = handleRequest(analyticService.getProductsAnalytics);
export const getOrdersAnalytics = handleRequest(analyticService.getOrdersAnalytics);
export const getPaymentsAnalytics = handleRequest(analyticService.getPaymentsAnalytics);
export const getUsersAnalytics = handleRequest(analyticService.getUsersAnalytics);
export const getLeadsAnalytics = handleRequest(analyticService.getLeadsAnalytics);
