import { models } from "../../../../../shared/index.js";
const { Category } = models;

export const createCategory = async (data) => {
  const category = await Category.create(data);
  return category;
};

export const getCategories = async (query = {}) => {
  const filter = { isDeleted: false };
  if (query.parentId) filter.parentId = query.parentId;
  
  const categories = await Category.find(filter).sort({ name: 1 });
  return categories;
};

export const getCategoryById = async (id) => {
  const category = await Category.findOne({ _id: id, isDeleted: false });
  if (!category) throw new Error("Category not found");
  return category;
};

export const updateCategory = async (id, data) => {
  const category = await Category.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true }
  );
  if (!category) throw new Error("Category not found");
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!category) throw new Error("Category not found");
  return { success: true };
};

export const seedCategories = async (createdBy, createdByEmail) => {
  const defaultCategories = [
    {
      name: "PVC Curtain",
      slug: "pvc-curtain",
      icon: "/src/assets/pvc_polar-pvc-strip-curtain_1.webp",
      description: "Flexible and durable PVC curtains (Standard, Supreme, Reliable, Freezer Grade, and Magnetic grades) for temperature control, safety, and dust protection.",
      number: "01",
      accentColor: "#1f5ac0",
      bgColor: "#e8f0fe",
      iconName: "CurtainAlt"
    },
    {
      name: "PVC Transparent Roll",
      slug: "pvc-transparent-roll",
      icon: "/src/assets/pvc_soft-pvc-roll_1.webp",
      description: "Premium transparent PVC rolls available in standard thicknesses (0.15mm to 0.50mm), low gauges (28/30 & 38/40 PHR), and heavy-duty high gauges (0.80mm to 3.0mm).",
      number: "02",
      accentColor: "#7c3aed",
      bgColor: "#f5f3ff",
      iconName: "ClearFilm"
    },
    {
      name: "PVC Colour Clear Film Roll",
      slug: "pvc-color-film",
      icon: "/src/assets/pvc_pvc-rainbow-clear-sheet_1.webp",
      description: "Vibrant color clear films featuring 12 color combinations, fluorescent tones (0.30mm & 0.50mm), solid colors (0.50mm), and rainbow clear options.",
      number: "03",
      accentColor: "#ea580c",
      bgColor: "#fff7ed",
      iconName: "Film"
    },
    {
      name: "PVC Reinforce Sheet",
      slug: "pvc-reinforced-sheet",
      icon: "/src/assets/pvc_pvc-reinforced-sheet_1.webp",
      description: "Heavy-duty reinforced PVC sheets with high tear resistance, featuring 0.35mm thickness, 60\" width, and 100m length; perfect for crate covers and packaging.",
      number: "04",
      accentColor: "#4338ca",
      bgColor: "#e0e7ff",
      iconName: "Sheet"
    },
    {
      name: "Brackets",
      slug: "mounting-brackets",
      icon: "/src/assets/pvc_pvc-strip-curtains-hanger_1.webp",
      description: "Mild steel (MS) and stainless steel (SS 202/304) brackets, bottom sets for magnetic curtains, and track & clip systems (300mm & 350mm).",
      number: "05",
      accentColor: "#c2410c",
      bgColor: "#ffedd5",
      iconName: "Settings"
    }
  ];

  let seededCount = 0;
  for (const cat of defaultCategories) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) {
      await Category.create({
        ...cat,
        createdBy,
        createdByEmail
      });
      seededCount++;
    }
  }
  return seededCount;
};
