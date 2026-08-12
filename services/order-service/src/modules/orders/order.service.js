import { models } from "../../../../../shared/index.js";
import axios from "axios";
import { ENV } from "../../config/env.js";

const { Order, User, Product, Payment } = models;

const findOrderQuery = (id) => {
  const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
  return isObjectId ? { $or: [{ _id: id }, { id: id }] } : { id: id };
};

const buildOrderItems = async (productsArray) => {
  if (!productsArray || !Array.isArray(productsArray)) return [];
  
  return await Promise.all(productsArray.map(async (pItem) => {
    if (typeof pItem === 'object' && pItem !== null) return pItem;
    const prod = await Product.findOne({ name: pItem });
    return {
      productId: prod?._id,
      name: prod?.name || pItem,
      image: prod?.images?.[0] || "",
      price: prod?.basePrice || 0,
      quantity: 1,
      vendorId: prod?.vendorId
    };
  }));
};

const syncPaymentRecord = async (order) => {
  try {
    if (!order) return;

    let numericAmount = 0;
    if (order.totalAmount) {
      const cleaned = String(order.totalAmount).replace(/[^0-9.]/g, "");
      numericAmount = parseFloat(cleaned) || 0;
    }

    const statusMap = {
      "paid": "captured",
      "Paid": "captured",
      "failed": "failed",
      "Failed": "failed",
      "refunded": "refunded",
      "Refunded": "refunded",
      "pending": "created",
      "Pending": "created"
    };

    const payStatus = statusMap[order.paymentStatus] || "created";
    const customerId = (order.createdBy && typeof order.createdBy === 'object') ? order.createdBy._id : (order.createdBy || order.userId);

    let existingPayment = await Payment.findOne({ orderId: order._id });
    if (!existingPayment) {
      const lastPayment = await Payment.findOne({ paymentId: /^#PAY-\d{4,}$/ }).sort({ createdAt: -1 });
      let nextNumber = 1001;
      if (lastPayment && lastPayment.paymentId) {
        const match = lastPayment.paymentId.match(/^#PAY-(\d{4,})$/);
        if (match) nextNumber = parseInt(match[1], 10) + 1;
      }
      const paymentId = `#PAY-${nextNumber}`;
      await Payment.create({
        paymentId,
        orderId: order._id,
        customerId,
        amount: numericAmount,
        currency: "INR",
        gateway: order.paymentMethod || "Razorpay",
        paymentMethod: order.paymentMethod || "Razorpay",
        status: payStatus,
        razorpayOrderId: order.razorpayOrderId,
        gatewayOrderId: order.razorpayOrderId || order.gatewayOrderId,
        ...(payStatus === "captured" ? { paidAt: new Date() } : {})
      });
    } else {
      existingPayment.customerId = customerId;
      existingPayment.amount = numericAmount;
      existingPayment.gateway = order.paymentMethod || existingPayment.gateway || "Razorpay";
      existingPayment.paymentMethod = order.paymentMethod || existingPayment.paymentMethod || "Razorpay";
      existingPayment.status = payStatus;
      if (order.razorpayOrderId) {
        existingPayment.razorpayOrderId = order.razorpayOrderId;
        existingPayment.gatewayOrderId = order.razorpayOrderId;
      }
      if (payStatus === "captured" && !existingPayment.paidAt) existingPayment.paidAt = new Date();
      await existingPayment.save();
    }
  } catch (err) {
    console.error("Failed to sync payment record:", err.message);
  }
};

const transformOrder = (order, userObj = null) => {
  if (!order) return null;
  const obj = order.toObject ? order.toObject() : order;
  
  let formattedDate = obj.date;
  if (!formattedDate && obj.createdAt) {
    const d = new Date(obj.createdAt);
    formattedDate = d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const creator = obj.createdBy && typeof obj.createdBy === 'object' ? obj.createdBy : null;
  
  let productItems = obj.products && obj.products.length > 0 ? obj.products : (obj.items || []);
  const role = userObj?.role?.toLowerCase();
  if (role === "vendor") {
    const vendorId = (userObj._id || userObj.id)?.toString();
    productItems = productItems.filter(item => 
      item.vendorId && item.vendorId.toString() === vendorId
    );
  }
  const productNames = productItems.map(item => typeof item === 'object' && item !== null ? item.name : item);

  let displayTotalAmount = obj.totalAmount !== undefined ? (typeof obj.totalAmount === 'number' ? `₹ ${obj.totalAmount}` : obj.totalAmount) : "₹ 0";
  if (role === "vendor") {
    const vendorTotal = productItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    displayTotalAmount = `₹ ${vendorTotal}`;
  }

  return {
    ...obj,
    id: obj.id || `#ORD-${obj._id.toString().substring(18).toUpperCase()}`,
    customerName: creator ? creator.fullname : (obj.address ? obj.address.fullName : "Guest"),
    phone: creator ? creator.mobile : (obj.address ? obj.address.phone : ""),
    avatar: (creator && creator.image) ? creator.image : (obj.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80'),
    productsText: productNames.join(", "),
    products: productNames,
    totalAmount: displayTotalAmount,
    orderStatus: obj.orderStatus || (obj.status ? capitalize(obj.status) : "Pending"),
    paymentStatus: obj.paymentStatus ? capitalize(obj.paymentStatus) : "Pending",
    paymentMethod: obj.paymentMethod || "Razorpay",
    source: obj.source || "Website",
    date: formattedDate || "",
  };
};

export const createOrderFromCart = async (userId, address, token) => {
  const cartResponse = await axios.get(`${ENV.CART_SERVICE_URL}/api/cart`, {
    headers: { Authorization: token }
  });

  const cart = cartResponse.data.data;
  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const order = await Order.create({
    userId,
    createdBy: userId,
    products: cart.items,
    totalAmount: cart.totalAmount,
    address,
    status: "pending",
    orderStatus: "Pending",
    paymentStatus: "Pending",
    paymentMethod: "Razorpay"
  });

  await axios.delete(`${ENV.CART_SERVICE_URL}/api/cart/clear`, {
    headers: { Authorization: token }
  });

  const populated = await Order.findById(order._id).populate("createdBy");
  await syncPaymentRecord(populated);
  return transformOrder(populated);
};

export const createDashboardOrder = async (userId, data, userObj = null) => {
  const payload = { ...data };
  
  if (data.createdBy) {
    const creatorId = typeof data.createdBy === 'object' && data.createdBy !== null ? data.createdBy._id : data.createdBy;
    payload.createdBy = creatorId;
    payload.userId = creatorId;
  } else if (userId) {
    payload.createdBy = userId;
    payload.userId = userId;
  }

  if (data.products) {
    payload.products = await buildOrderItems(data.products);
  }

  if (data.orderStatus) {
    payload.status = data.orderStatus.toLowerCase();
  }
  if (data.paymentStatus) {
    payload.paymentStatus = data.paymentStatus.toLowerCase();
  }
  if (data.paymentMethod) {
    payload.paymentMethod = data.paymentMethod;
  }

  const order = await Order.create(payload);
  const populated = await Order.findById(order._id).populate("createdBy");
  await syncPaymentRecord(populated);
  return transformOrder(populated, userObj);
};

export const getAllOrders = async (filters = {}, userObj = null) => {
  const query = {};

  const role = userObj?.role?.toLowerCase();
  if (role === "vendor") {
    query["products.vendorId"] = userObj._id || userObj.id;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    const matchingUsers = await User.find({
      $or: [
        { fullname: searchRegex },
        { mobile: searchRegex }
      ]
    }).select("_id");
    
    const userIds = matchingUsers.map(u => u._id);
    query.$or = [
      { id: searchRegex },
      { createdBy: { $in: userIds } },
      { userId: { $in: userIds } },
      { "address.fullName": searchRegex },
      { "address.phone": searchRegex }
    ];
  }

  if (filters.orderStatus && filters.orderStatus !== "All") {
    query.$or = [
      { orderStatus: filters.orderStatus },
      { status: filters.orderStatus.toLowerCase() }
    ];
  }

  if (filters.paymentStatus && filters.paymentStatus !== "All") {
    query.$or = [
      { paymentStatus: filters.paymentStatus },
      { paymentStatus: filters.paymentStatus.toLowerCase() }
    ];
  }

  const orders = await Order.find(query).populate("createdBy").sort({ createdAt: -1 });
  return orders.map(order => transformOrder(order, userObj));
};

export const getOrderById = async (orderId, userObj = null) => {
  const query = findOrderQuery(orderId);
  const role = userObj?.role?.toLowerCase();
  if (role === "vendor") {
    query["products.vendorId"] = userObj._id || userObj.id;
  }
  const order = await Order.findOne(query).populate("createdBy");
  if (!order) throw new Error("Order not found");
  return transformOrder(order, userObj);
};

export const getUserOrders = async (userId) => {
  const orders = await Order.find({ userId }).populate("createdBy").sort({ createdAt: -1 });
  return orders.map(transformOrder);
};

export const updateDashboardOrder = async (id, data, userObj = null) => {
  const query = findOrderQuery(id);
  const role = userObj?.role?.toLowerCase();
  if (role === "vendor") {
    query["products.vendorId"] = userObj._id || userObj.id;
  }
  const payload = { ...data };

  if (data.createdBy) {
    const creatorId = typeof data.createdBy === 'object' && data.createdBy !== null ? data.createdBy._id : data.createdBy;
    payload.createdBy = creatorId;
    payload.userId = creatorId;
  }

  if (data.products) {
    payload.products = await buildOrderItems(data.products);
  }

  if (data.orderStatus) {
    payload.status = data.orderStatus.toLowerCase();
  }
  if (data.paymentStatus) {
    payload.paymentStatus = data.paymentStatus.toLowerCase();
  }
  if (data.paymentMethod) {
    payload.paymentMethod = data.paymentMethod;
  }

  const updatedOrder = await Order.findOneAndUpdate(query, payload, { new: true }).populate("createdBy");
  if (!updatedOrder) throw new Error("Order not found");
  await syncPaymentRecord(updatedOrder);
  return transformOrder(updatedOrder, userObj);
};

export const deleteOrderById = async (id, userObj = null) => {
  const query = findOrderQuery(id);
  const role = userObj?.role?.toLowerCase();
  if (role === "vendor") {
    query["products.vendorId"] = userObj._id || userObj.id;
  }
  const order = await Order.findOneAndDelete(query).populate("createdBy");
  if (!order) throw new Error("Order not found");

  // Also clean up associated payment record if present
  try {
    await Payment.findOneAndDelete({ orderId: order._id });
  } catch (err) {
    console.error("Failed to delete payment record:", err.message);
  }

  return transformOrder(order, userObj);
};

export const cancelOrder = async (orderId, userId) => {
  const query = findOrderQuery(orderId);
  const order = await Order.findOne({ ...query, userId }).populate("createdBy");
  if (!order) throw new Error("Order not found");
  if (order.status !== "pending" && order.status !== "Pending") {
    throw new Error("Order cannot be cancelled");
  }
  
  order.status = "cancelled";
  order.orderStatus = "Cancelled";
  const saved = await order.save();
  await syncPaymentRecord(saved);
  return transformOrder(saved);
};

export const updateOrderStatus = async (orderId, status) => {
  const query = findOrderQuery(orderId);
  const order = await Order.findOne(query).populate("createdBy");
  if (!order) throw new Error("Order not found");
  order.status = status.toLowerCase();
  order.orderStatus = status;
  const saved = await order.save();
  await syncPaymentRecord(saved);
  return transformOrder(saved);
};

export const updatePaymentStatus = async (orderId, paymentStatus, razorpayOrderId, paymentMethod = null) => {
  const query = findOrderQuery(orderId);
  const order = await Order.findOne(query).populate("createdBy");
  if (!order) throw new Error("Order not found");
  order.paymentStatus = paymentStatus.toLowerCase();
  if (razorpayOrderId) order.razorpayOrderId = razorpayOrderId;
  if (paymentMethod) order.paymentMethod = paymentMethod;
  const saved = await order.save();
  await syncPaymentRecord(saved);
  return transformOrder(saved);
};
