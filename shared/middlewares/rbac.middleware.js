import { messages, roles, statusCodes } from "../constants/index.js";

/* ================= PERMISSION BASED ================= */
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(statusCodes.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: messages.UNAUTHORIZED,
        });
      }

      const userRole = user.role?.toLowerCase();
      const adminRole = roles.ADMIN?.toLowerCase();
      const vendorRole = roles.VENDOR?.toLowerCase();

      // Admin and Manager have access to all routes
      if (userRole === adminRole || userRole === "manager") {
        return next();
      }

      // Vendor has access to CATEGORY_, BLOG_, PRODUCT_, and CMS_ permissions
      if (
        (userRole === "vendor" || userRole === vendorRole) &&
        requiredPermission &&
        (requiredPermission.startsWith("CATEGORY_") ||
          requiredPermission.startsWith("BLOG_") ||
          requiredPermission.startsWith("PRODUCT_") ||
          requiredPermission.startsWith("CMS_"))
      ) {
        return next();
      }

      if (requiredPermission === "*") {
        return next();
      }

      if (Array.isArray(user.permissions) && user.permissions.includes(requiredPermission)) {
        return next();
      }

      return res.status(statusCodes.HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: messages.FORBIDDEN,
      });
    } catch (error) {
      return res.status(statusCodes.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  };
};

/* ================= ROLE BASED ================= */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(statusCodes.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: messages.UNAUTHORIZED,
        });
      }

      const userRole = user.role?.toLowerCase();
      const rolesList = allowedRoles.map(r => r.toLowerCase());
      if (rolesList.includes("admin") && !rolesList.includes("manager")) {
        rolesList.push("manager");
      }

      if (!rolesList.includes(userRole)) {
        return res.status(statusCodes.HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: messages.FORBIDDEN,
        });
      }

      return next();
    } catch (error) {
      return res.status(statusCodes.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  };
};