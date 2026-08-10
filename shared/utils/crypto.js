import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

export const encrypt = (text) => {
  if (!text) return text;
  const secretKey = crypto.createHash("sha256").update(process.env.JWT_SECRET || "default_secret").digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

export const decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 2) return encryptedText;
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const secretKey = crypto.createHash("sha256").update(process.env.JWT_SECRET || "default_secret").digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err.message);
    return encryptedText;
  }
};
