import { models } from "../../../../../shared/index.js";

const { PaymentIntegration } = models;

const sanitizePayload = (data) => {
  const payload = { ...data };

  if (payload.supportedMethods) {
    if (typeof payload.supportedMethods === "string") {
      payload.supportedMethods = payload.supportedMethods
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  if (payload.isDefault !== undefined) {
    if (typeof payload.isDefault === "string") {
      payload.isDefault = payload.isDefault === "true";
    }
  }

  return payload;
};

const transformIntegration = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj.keySecret;
  delete obj.webhookSecret;

  return {
    ...obj,
    id: obj._id,
    supportedMethodsText: Array.isArray(obj.supportedMethods) ? obj.supportedMethods.join(", ") : (obj.supportedMethods || ""),
    isDefaultText: obj.isDefault ? "Yes" : "No",
  };
};

export const createIntegration = async (data) => {
  const payload = sanitizePayload(data);
  const integration = await PaymentIntegration.create(payload);
  return transformIntegration(integration);
};

export const getAllIntegrations = async () => {
  const integrations = await PaymentIntegration.find().sort({ addedOn: -1 });
  return integrations.map(transformIntegration);
};

export const getIntegrationById = async (id) => {
  const integration = await PaymentIntegration.findById(id);
  if (!integration) throw new Error("Payment integration not found");
  return transformIntegration(integration);
};

export const updateIntegration = async (id, data) => {
  const integration = await PaymentIntegration.findById(id);
  if (!integration) throw new Error("Payment integration not found");

  const payload = sanitizePayload(data);
  Object.assign(integration, payload);
  await integration.save();
  return transformIntegration(integration);
};

export const deleteIntegration = async (id) => {
  const integration = await PaymentIntegration.findByIdAndDelete(id);
  if (!integration) throw new Error("Payment integration not found");
  return transformIntegration(integration);
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
  return transformIntegration(integration);
};
