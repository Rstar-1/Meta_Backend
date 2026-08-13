import { models } from "../../../../../shared/index.js";

const { Order, Lead, Product } = models;

const parseAmount = (val) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
};

export const getTotalLeads = async (userObj = null) => {
  const role = userObj?.role?.toLowerCase();
  const query = { isDeleted: false };
  if (role === "vendor") {
    query.createdBy = userObj._id || userObj.id;
  }
  const totalLeads = await Lead.countDocuments(query);
  return { totalLeads };
};

export const getWeeklyEarnings = async (userObj = null) => {
  const role = userObj?.role?.toLowerCase();
  const orderQuery = { paymentStatus: { $regex: /^paid$/i } };
  
  if (role === "vendor") {
    const vendorId = userObj._id || userObj.id;
    orderQuery.$or = [
      { "products.vendorId": vendorId },
      { createdBy: vendorId },
      { userId: vendorId }
    ];
  }
  const paidOrders = await Order.find(orderQuery);
  
  let overallPaidEarnings = 0;
  if (role === "vendor") {
    const vendorIdStr = (userObj._id || userObj.id)?.toString();
    paidOrders.forEach(order => {
      const createdById = (order.createdBy && typeof order.createdBy === 'object')
        ? order.createdBy._id?.toString()
        : order.createdBy?.toString();
      const orderUserId = order.userId?.toString();

      if (createdById === vendorIdStr || orderUserId === vendorIdStr) {
        overallPaidEarnings += parseAmount(order.totalAmount);
      } else {
        const items = order.products || [];
        items.forEach(item => {
          if (item.vendorId?.toString() === vendorIdStr) {
            overallPaidEarnings += (item.price || 0) * (item.quantity || 1);
          }
        });
      }
    });
  } else {
    overallPaidEarnings = paidOrders.reduce((sum, order) => sum + parseAmount(order.totalAmount), 0);
  }

  const daysMap = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 0: "Sun" };
  const weeklyRevenue = [
    { day: "Mon", amount: 0 },
    { day: "Tue", amount: 0 },
    { day: "Wed", amount: 0 },
    { day: "Thu", amount: 0 },
    { day: "Fri", amount: 0 },
    { day: "Sat", amount: 0 },
    { day: "Sun", amount: 0 }
  ];

  paidOrders.forEach(order => {
    const d = new Date(order.createdAt);
    const dayName = daysMap[d.getDay()];
    let amount = 0;
    if (role === "vendor") {
      const vendorIdStr = (userObj._id || userObj.id)?.toString();
      const createdById = (order.createdBy && typeof order.createdBy === 'object')
        ? order.createdBy._id?.toString()
        : order.createdBy?.toString();
      const orderUserId = order.userId?.toString();

      if (createdById === vendorIdStr || orderUserId === vendorIdStr) {
        amount = parseAmount(order.totalAmount);
      } else {
        const items = order.products || [];
        items.forEach(item => {
          if (item.vendorId?.toString() === vendorIdStr) {
            amount += (item.price || 0) * (item.quantity || 1);
          }
        });
      }
    } else {
      amount = parseAmount(order.totalAmount);
    }
    const entry = weeklyRevenue.find(item => item.day === dayName);
    if (entry) {
      entry.amount += amount;
    }
  });

  return {
    overallPaidEarnings,
    weekly: weeklyRevenue
  };
};

export const getWeeklyLeads = async (userObj = null) => {
  const role = userObj?.role?.toLowerCase();
  const query = { isDeleted: false };
  if (role === "vendor") {
    query.createdBy = userObj._id || userObj.id;
  }
  const allLeads = await Lead.find(query);

  const daysMap = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 0: "Sun" };
  const weeklyLeadsCount = [
    { day: "Mon", count: 0 },
    { day: "Tue", count: 0 },
    { day: "Wed", count: 0 },
    { day: "Thu", count: 0 },
    { day: "Fri", count: 0 },
    { day: "Sat", count: 0 },
    { day: "Sun", count: 0 }
  ];

  allLeads.forEach(lead => {
    const d = new Date(lead.createdAt);
    const dayName = daysMap[d.getDay()];
    const entry = weeklyLeadsCount.find(item => item.day === dayName);
    if (entry) {
      entry.count += 1;
    }
  });

  return {
    totalLeads: allLeads.length,
    weekly: weeklyLeadsCount
  };
};

export const getTopProducts = async (limit = 5, userObj = null) => {
  const role = userObj?.role?.toLowerCase();
  const query = { paymentStatus: { $regex: /^paid$/i } };
  
  if (role === "vendor") {
    const vendorId = userObj._id || userObj.id;
    query.$or = [
      { "products.vendorId": vendorId },
      { createdBy: vendorId },
      { userId: vendorId }
    ];
  }
  const paidOrders = await Order.find(query);
  const productMap = {};

  const vendorIdStr = role === "vendor" ? (userObj._id || userObj.id)?.toString() : null;

  for (const order of paidOrders) {
    const items = order.products || [];
    const createdById = (order.createdBy && typeof order.createdBy === 'object')
      ? order.createdBy._id?.toString()
      : order.createdBy?.toString();
    const orderUserId = order.userId?.toString();

    const isOrderOwner = (createdById === vendorIdStr || orderUserId === vendorIdStr);

    for (const item of items) {
      if (!item.productId) continue;
      if (vendorIdStr && !isOrderOwner && item.vendorId?.toString() !== vendorIdStr) continue;
      
      const pIdStr = item.productId.toString();
      const qty = item.quantity || 1;
      const price = item.price || 0;
      const rev = price * qty;

      if (!productMap[pIdStr]) {
        productMap[pIdStr] = {
          productId: pIdStr,
          name: item.name || "Unknown Product",
          totalSold: 0,
          revenue: 0
        };
      }
      productMap[pIdStr].totalSold += qty;
      productMap[pIdStr].revenue += rev;
    }
  }

  const topProductsList = Object.values(productMap)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);

  // Fetch category and stock info from Product model
  for (const p of topProductsList) {
    try {
      const dbProd = await Product.findById(p.productId).populate("categoryId");
      if (dbProd) {
        p.name = dbProd.name || p.name;
        p.category = dbProd.categoryId?.name || "General";
        p.price = dbProd.basePrice || dbProd.price || 0;
        p.stock = dbProd.totalStock || dbProd.stock || 0;
      } else {
        p.category = "General";
        p.price = 0;
        p.stock = 0;
      }
    } catch (err) {
      p.category = "General";
      p.price = 0;
      p.stock = 0;
    }
  }

  return topProductsList;
};

export const getYearlyRevenue = async (year, userObj = null) => {
  const role = userObj?.role?.toLowerCase();
  const selectedYear = parseInt(year, 10) || new Date().getFullYear();
  const startOfYear = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
  const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

  const query = {
    paymentStatus: { $regex: /^paid$/i },
    createdAt: { $gte: startOfYear, $lte: endOfYear }
  };
  
  if (role === "vendor") {
    const vendorId = userObj._id || userObj.id;
    query.$or = [
      { "products.vendorId": vendorId },
      { createdBy: vendorId },
      { userId: vendorId }
    ];
  }
  const yearlyOrders = await Order.find(query);

  const monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRevenue = monthsList.map(m => ({ month: m, revenue: 0 }));

  yearlyOrders.forEach(order => {
    const d = new Date(order.createdAt);
    const monthName = monthsList[d.getMonth()];
    let amount = 0;
    if (role === "vendor") {
      const vendorIdStr = (userObj._id || userObj.id)?.toString();
      const createdById = (order.createdBy && typeof order.createdBy === 'object')
        ? order.createdBy._id?.toString()
        : order.createdBy?.toString();
      const orderUserId = order.userId?.toString();

      if (createdById === vendorIdStr || orderUserId === vendorIdStr) {
        amount = parseAmount(order.totalAmount);
      } else {
        const items = order.products || [];
        items.forEach(item => {
          if (item.vendorId?.toString() === vendorIdStr) {
            amount += (item.price || 0) * (item.quantity || 1);
          }
        });
      }
    } else {
      amount = parseAmount(order.totalAmount);
    }
    const entry = monthlyRevenue.find(item => item.month === monthName);
    if (entry) {
      entry.revenue += amount;
    }
  });

  return {
    year: selectedYear,
    monthly: monthlyRevenue
  };
};

export const getBestSeller = async (userObj = null) => {
  const role = userObj?.role?.toLowerCase();
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const query = {
    paymentStatus: { $regex: /^paid$/i },
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  };
  
  if (role === "vendor") {
    const vendorId = userObj._id || userObj.id;
    query.$or = [
      { "products.vendorId": vendorId },
      { createdBy: vendorId },
      { userId: vendorId }
    ];
  }
  const monthlyOrders = await Order.find(query);

  let totalOrderAmount = 0;
  if (role === "vendor") {
    const vendorIdStr = (userObj._id || userObj.id)?.toString();
    monthlyOrders.forEach(order => {
      const createdById = (order.createdBy && typeof order.createdBy === 'object')
        ? order.createdBy._id?.toString()
        : order.createdBy?.toString();
      const orderUserId = order.userId?.toString();

      if (createdById === vendorIdStr || orderUserId === vendorIdStr) {
        totalOrderAmount += parseAmount(order.totalAmount);
      } else {
        const items = order.products || [];
        items.forEach(item => {
          if (item.vendorId?.toString() === vendorIdStr) {
            totalOrderAmount += (item.price || 0) * (item.quantity || 1);
          }
        });
      }
    });
  } else {
    totalOrderAmount = monthlyOrders.reduce((sum, order) => sum + parseAmount(order.totalAmount), 0);
  }
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return {
    month: monthNames[today.getMonth()],
    totalOrderAmount
  };
};

export const getOrderStatusStats = async (userObj = null) => {
  const role = userObj?.role?.toLowerCase();
  
  const pendingQuery = { status: { $regex: /^pending$/i } };
  const processingQuery = { status: { $regex: /^(confirmed|processing)$/i } };
  const shippedQuery = { status: { $regex: /^shipped$/i } };
  const deliveredQuery = { status: { $regex: /^delivered$/i } };
  const allQuery = {};

  if (role === "vendor") {
    const vendorId = userObj._id || userObj.id;
    const vendorCondition = {
      $or: [
        { "products.vendorId": vendorId },
        { createdBy: vendorId },
        { userId: vendorId }
      ]
    };
    pendingQuery.$and = [ { status: { $regex: /^pending$/i } }, vendorCondition ];
    processingQuery.$and = [ { status: { $regex: /^(confirmed|processing)$/i } }, vendorCondition ];
    shippedQuery.$and = [ { status: { $regex: /^shipped$/i } }, vendorCondition ];
    deliveredQuery.$and = [ { status: { $regex: /^delivered$/i } }, vendorCondition ];
    allQuery.$and = [ vendorCondition ];
  }

  const pending = await Order.countDocuments(role === "vendor" ? pendingQuery : { status: { $regex: /^pending$/i } });
  const processing = await Order.countDocuments(role === "vendor" ? processingQuery : { status: { $regex: /^(confirmed|processing)$/i } });
  const shipped = await Order.countDocuments(role === "vendor" ? shippedQuery : { status: { $regex: /^shipped$/i } });
  const delivered = await Order.countDocuments(role === "vendor" ? deliveredQuery : { status: { $regex: /^delivered$/i } });
  
  const totalOrders = pending + processing + shipped + delivered;
  
  const allOrders = await Order.find(role === "vendor" ? allQuery : {});
  
  let totalRevenue = 0;
  if (role === "vendor") {
    const vendorIdStr = (userObj._id || userObj.id)?.toString();
    allOrders.forEach(order => {
      const createdById = (order.createdBy && typeof order.createdBy === 'object')
        ? order.createdBy._id?.toString()
        : order.createdBy?.toString();
      const orderUserId = order.userId?.toString();

      if (createdById === vendorIdStr || orderUserId === vendorIdStr) {
        totalRevenue += parseAmount(order.totalAmount);
      } else {
        const items = order.products || [];
        items.forEach(item => {
          if (item.vendorId?.toString() === vendorIdStr) {
            totalRevenue += (item.price || 0) * (item.quantity || 1);
          }
        });
      }
    });
  } else {
    totalRevenue = allOrders.reduce((sum, o) => sum + parseAmount(o.totalAmount), 0);
  }

  return {
    pending,
    processing,
    shipped,
    delivered,
    totalOrders,
    totalRevenue
  };
};
