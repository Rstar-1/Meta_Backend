import { models } from "../../../../../shared/index.js";

const { PaymentIntegration } = models;

export const createIntegration = async (data) => {
  const integration = await PaymentIntegration.create(data);
  return integration;
};

export const getAllIntegrations = async () => {
  return await PaymentIntegration.find().sort({ addedOn: -1 });
};

export const getIntegrationById = async (id) => {
  const integration = await PaymentIntegration.findById(id);
  if (!integration) throw new Error("Payment integration not found");
  return integration;
};

export const updateIntegration = async (id, data) => {
  // If data.keySecret or data.webhookSecret are provided, Mongoose setters will automatically encrypt them.
  const integration = await PaymentIntegration.findById(id);
  if (!integration) throw new Error("Payment integration not found");

  Object.assign(integration, data);
  await integration.save();
  return integration;
};

export const deleteIntegration = async (id) => {
  const integration = await PaymentIntegration.findByIdAndDelete(id);
  if (!integration) throw new Error("Payment integration not found");
  return integration;
};

export const updateIntegrationStatus = async (id, status) => {
  if (!["active", "inactive"].includes(status)) {
    throw new Error("Invalid status value");
  }
  const integration = await PaymentIntegration.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!integration) throw new Error("Payment integration not found");
  return integration;
};
