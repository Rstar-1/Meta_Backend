import { models } from "../../../../../shared/index.js";

const { User, Product, Order, Payment, Lead, Blog } = models;

const parseAmount = (val) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
};

const parseDateRange = (filters) => {
  let start, end;
  if (filters.startDate && filters.endDate) {
    start = new Date(filters.startDate);
    start.setHours(0, 0, 0, 0);
    end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    const days = filters.period === "30d" ? 30 : 7;
    end = new Date();
    start = new Date();
    start.setDate(end.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }
  return { start, end };
};

const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const buildTrendData = (dates, items, dateKey, valueFn) => {
  const map = {};
  dates.forEach(d => { map[d] = []; });

  items.forEach(item => {
    const itemDate = item[dateKey] || item.createdAt;
    if (itemDate) {
      const dStr = new Date(itemDate).toISOString().split('T')[0];
      if (map[dStr] !== undefined) {
        map[dStr].push(item);
      }
    }
  });

  return dates.map(d => ({
    date: d,
    value: valueFn(map[d])
  }));
};

const getVendorOrderIdsAndCustomerIds = async (vendorId) => {
  const orders = await Order.find({
    $or: [
      { "products.vendorId": vendorId },
      { createdBy: vendorId },
      { userId: vendorId }
    ]
  }).select("_id userId");
  
  const orderIds = orders.map(o => o._id);
  const customerIds = orders.map(o => o.userId).filter(Boolean);
  return { orderIds, customerIds };
};

const paymentsQuery = async (query, role, userObj) => {
  if (role === "vendor") {
    const vendorIdStr = (userObj._id || userObj.id)?.toString();
    const list = await Payment.find(query).populate("orderId");
    return list.map(p => {
      const order = p.orderId;
      if (!order) return p;
      const createdById = (order.createdBy && typeof order.createdBy === 'object')
        ? order.createdBy._id?.toString()
        : order.createdBy?.toString();
      const orderUserId = order.userId?.toString();

      if (createdById === vendorIdStr || orderUserId === vendorIdStr) {
        return p;
      }
      
      let vendorAmount = 0;
      const items = order.products || [];
      items.forEach(item => {
        if (item.vendorId?.toString() === vendorIdStr) {
          vendorAmount += (item.price || 0) * (item.quantity || 1);
        }
      });
      
      const pObj = p.toObject ? p.toObject() : { ...p };
      pObj.amount = vendorAmount;
      return pObj;
    });
  }
  return await Payment.find(query);
};

export const getArticlesAnalytics = async (filters, userObj = null) => {
  const { start, end } = parseDateRange(filters);
  const role = userObj?.role?.toLowerCase();
  
  const query = {
    isDeleted: false,
    createdAt: { $gte: start, $lte: end }
  };
  
  if (role === "vendor") {
    query.createdBy = userObj._id || userObj.id;
  }
  
  const blogs = await Blog.find(query);
  
  const totalArticles = blogs.length;
  const activeArticles = blogs.filter(b => b.isActive !== false).length;
  
  let totalReviews = 0;
  let totalReadTime = 0;
  const categoriesMap = new Set();
  
  blogs.forEach(b => {
    totalReviews += b.reviews?.length || 0;
    if (b.category) categoriesMap.add(b.category);
    
    const readTimeStr = b.readTime || "";
    const minutes = parseInt(readTimeStr.replace(/[^0-9]/g, ""), 10);
    totalReadTime += isNaN(minutes) ? 1 : minutes;
  });
  
  const avgReadTime = totalArticles > 0 ? parseFloat((totalReadTime / totalArticles).toFixed(1)) : 0;
  const categoriesUsed = categoriesMap.size;
  
  const dates = getDatesInRange(start, end);
  const trend = buildTrendData(dates, blogs, "createdAt", (arr) => arr.length);
  
  return {
    totalArticles,
    totalReviews,
    avgReadTime,
    activeArticles,
    categoriesUsed,
    trend
  };
};

export const getProductsAnalytics = async (filters, userObj = null) => {
  const { start, end } = parseDateRange(filters);
  const role = userObj?.role?.toLowerCase();
  
  const query = {
    isDeleted: false,
    createdAt: { $gte: start, $lte: end }
  };
  
  if (role === "vendor") {
    query.vendorId = userObj._id || userObj.id;
  }
  
  const products = await Product.find(query);
  
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive !== false).length;
  const outOfStock = products.filter(p => (p.totalStock || 0) === 0).length;
  const lowStock = products.filter(p => {
    const stock = p.totalStock || 0;
    return stock > 0 && stock <= 20;
  }).length;
  
  const catalogValue = products.reduce((sum, p) => sum + (p.basePrice || 0), 0);
  
  const dates = getDatesInRange(start, end);
  const trend = buildTrendData(dates, products, "createdAt", (arr) => arr.length);
  
  return {
    totalProducts,
    activeProducts,
    outOfStock,
    lowStock,
    catalogValue,
    trend
  };
};

export const getOrdersAnalytics = async (filters, userObj = null) => {
  const { start, end } = parseDateRange(filters);
  const role = userObj?.role?.toLowerCase();
  
  const query = {
    createdAt: { $gte: start, $lte: end }
  };
  
  if (role === "vendor") {
    const vendorId = userObj._id || userObj.id;
    query.$or = [
      { "products.vendorId": vendorId },
      { createdBy: vendorId },
      { userId: vendorId }
    ];
  }
  
  const orders = await Order.find(query);
  
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === "Pending" || o.status === "pending").length;
  const processingOrders = orders.filter(o => o.orderStatus === "Processing" || o.status === "processing" || o.status === "confirmed").length;
  const completedOrders = orders.filter(o => o.orderStatus === "Delivered" || o.orderStatus === "Completed" || o.status === "delivered" || o.status === "completed").length;
  
  let totalOrderValue = 0;
  if (role === "vendor") {
    const vendorIdStr = (userObj._id || userObj.id)?.toString();
    orders.forEach(order => {
      const createdById = (order.createdBy && typeof order.createdBy === 'object')
        ? order.createdBy._id?.toString()
        : order.createdBy?.toString();
      const orderUserId = order.userId?.toString();

      if (createdById === vendorIdStr || orderUserId === vendorIdStr) {
        totalOrderValue += parseAmount(order.totalAmount);
      } else {
        const items = order.products || [];
        items.forEach(item => {
          if (item.vendorId?.toString() === vendorIdStr) {
            totalOrderValue += (item.price || 0) * (item.quantity || 1);
          }
        });
      }
    });
  } else {
    totalOrderValue = orders.reduce((sum, o) => sum + parseAmount(o.totalAmount), 0);
  }
  
  const dates = getDatesInRange(start, end);
  const trend = buildTrendData(dates, orders, "createdAt", (arr) => {
    if (role === "vendor") {
      const vendorIdStr = (userObj._id || userObj.id)?.toString();
      let val = 0;
      arr.forEach(order => {
        const createdById = (order.createdBy && typeof order.createdBy === 'object')
          ? order.createdBy._id?.toString()
          : order.createdBy?.toString();
        const orderUserId = order.userId?.toString();

        if (createdById === vendorIdStr || orderUserId === vendorIdStr) {
          val += parseAmount(order.totalAmount);
        } else {
          const items = order.products || [];
          items.forEach(item => {
            if (item.vendorId?.toString() === vendorIdStr) {
              val += (item.price || 0) * (item.quantity || 1);
            }
          });
        }
      });
      return val;
    }
    return arr.reduce((sum, o) => sum + parseAmount(o.totalAmount), 0);
  });
  
  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    completedOrders,
    totalOrderValue,
    trend
  };
};

export const getPaymentsAnalytics = async (filters, userObj = null) => {
  const { start, end } = parseDateRange(filters);
  const role = userObj?.role?.toLowerCase();
  
  const query = {
    createdAt: { $gte: start, $lte: end }
  };
  
  if (role === "vendor") {
    const vendorId = userObj._id || userObj.id;
    const { orderIds } = await getVendorOrderIdsAndCustomerIds(vendorId);
    query.orderId = { $in: orderIds };
  }
  
  const payments = await paymentsQuery(query, role, userObj);
  
  const totalTransactions = payments.length;
  const successfulPayments = payments.filter(p => p.status === "captured").length;
  const failedPayments = payments.filter(p => p.status === "failed").length;
  const totalRevenue = payments.filter(p => p.status === "captured").reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const successRate = totalTransactions > 0 ? Math.round((successfulPayments / totalTransactions) * 100) : 0;
  
  const dates = getDatesInRange(start, end);
  const trend = buildTrendData(dates, payments.filter(p => p.status === "captured"), "createdAt", (arr) => {
    return arr.reduce((sum, p) => sum + (p.amount || 0), 0);
  });
  
  return {
    totalTransactions,
    successfulPayments,
    failedPayments,
    totalRevenue,
    successRate,
    trend
  };
};

export const getUsersAnalytics = async (filters, userObj = null) => {
  const { start, end } = parseDateRange(filters);
  const role = userObj?.role?.toLowerCase();
  
  const query = {
    isDeleted: false,
    createdAt: { $gte: start, $lte: end }
  };
  
  if (role === "vendor") {
    const vendorId = userObj._id || userObj.id;
    const { customerIds } = await getVendorOrderIdsAndCustomerIds(vendorId);
    query._id = { $in: customerIds };
  }
  
  const users = await User.find(query);
  
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status !== false).length;
  const inactiveUsers = totalUsers - activeUsers;
  const administrators = users.filter(u => u.role === "admin").length;
  const vendors = users.filter(u => u.role === "vendor").length;
  
  const dates = getDatesInRange(start, end);
  const trend = buildTrendData(dates, users, "createdAt", (arr) => arr.length);
  
  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    administrators,
    vendors,
    trend
  };
};

export const getLeadsAnalytics = async (filters, userObj = null) => {
  const { start, end } = parseDateRange(filters);
  const role = userObj?.role?.toLowerCase();
  
  const query = {
    isDeleted: false,
    createdAt: { $gte: start, $lte: end }
  };
  
  if (role === "vendor") {
    query.createdBy = userObj._id || userObj.id;
  }
  
  const leads = await Lead.find(query);
  
  const totalLeads = leads.length;
  const pendingLeads = leads.filter(l => l.status === "Pending").length;
  const approvedLeads = leads.filter(l => l.status === "Approved").length;
  const reviewedLeads = leads.filter(l => l.status === "Reviewed").length;
  
  const conversionRatio = totalLeads > 0 ? Math.round((approvedLeads / totalLeads) * 100) : 0;
  
  const dates = getDatesInRange(start, end);
  const trend = buildTrendData(dates, leads, "createdAt", (arr) => arr.length);
  
  return {
    totalLeads,
    pendingLeads,
    approvedLeads,
    reviewedLeads,
    conversionRatio,
    trend
  };
};
