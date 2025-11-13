import CommunityGuidelines from "../models/CommunityGuidelines.js";

// ===== GET ALL ACTIVE GUIDELINES =====
export const getActiveGuidelines = async (req, res) => {
  try {
    const guidelines = await CommunityGuidelines.find({ isActive: true })
      .sort({ order: 1 })
      .select("-__v");

    res.status(200).json({ guidelines });
  } catch (error) {
    console.error("Error fetching guidelines:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch guidelines", error: error.message });
  }
};

// ===== GET ALL GUIDELINES =====
export const getAllGuidelines = async (req, res) => {
  try {
    const guidelines = await CommunityGuidelines.find()
      .sort({ order: 1 })
      .select("-__v");

    res.status(200).json({ guidelines });
  } catch (error) {
    console.error("Error fetching all guidelines:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch guidelines", error: error.message });
  }
};

// ===== GET SINGLE GUIDELINE BY ID =====
export const getGuidelineById = async (req, res) => {
  try {
    const { id } = req.params;
    const guideline = await CommunityGuidelines.findById(id);

    if (!guideline) {
      return res.status(404).json({ message: "Guideline not found" });
    }

    res.status(200).json({ guideline });
  } catch (error) {
    console.error("Error fetching guideline:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch guideline", error: error.message });
  }
};

// ===== CREATE GUIDELINE =====
export const createGuideline = async (req, res) => {
  try {
    const { title, content, order, isActive } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const guideline = new CommunityGuidelines({
      title,
      content,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    await guideline.save();

    res.status(201).json({
      message: "Guideline created successfully",
      guideline,
    });
  } catch (error) {
    console.error("Error creating guideline:", error);
    res
      .status(500)
      .json({ message: "Failed to create guideline", error: error.message });
  }
};

// ===== UPDATE GUIDELINES =====
export const updateGuideline = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, order, isActive } = req.body;

    const guideline = await CommunityGuidelines.findById(id);

    if (!guideline) {
      return res.status(404).json({ message: "Guideline not found" });
    }

    if (title) guideline.title = title;
    if (content) guideline.content = content;
    if (order !== undefined) guideline.order = order;
    if (isActive !== undefined) guideline.isActive = isActive;

    await guideline.save();

    res.status(200).json({
      message: "Guideline updated successfully",
      guideline,
    });
  } catch (error) {
    console.error("Error updating guideline:", error);
    res
      .status(500)
      .json({ message: "Failed to update guideline", error: error.message });
  }
};

// ===== DELETE GUIDELINES =====
export const deleteGuideline = async (req, res) => {
  try {
    const { id } = req.params;

    const guideline = await CommunityGuidelines.findByIdAndDelete(id);

    if (!guideline) {
      return res.status(404).json({ message: "Guideline not found" });
    }

    res.status(200).json({
      message: "Guideline deleted successfully",
      guideline,
    });
  } catch (error) {
    console.error("Error deleting guideline:", error);
    res
      .status(500)
      .json({ message: "Failed to delete guideline", error: error.message });
  }
};

// ===== REORDER GUIDELINES BASED ON NUMBERS =====
export const reorderGuidelines = async (req, res) => {
  try {
    const { guidelines } = req.body;

    if (!Array.isArray(guidelines)) {
      return res.status(400).json({ message: "Guidelines must be an array" });
    }

    const updatePromises = guidelines.map(({ id, order }) =>
      CommunityGuidelines.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    res.status(200).json({ message: "Guidelines reordered successfully" });
  } catch (error) {
    console.error("Error reordering guidelines:", error);
    res
      .status(500)
      .json({ message: "Failed to reorder guidelines", error: error.message });
  }
};
