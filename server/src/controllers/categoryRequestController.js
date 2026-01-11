import ApprovedCategory from "../models/ApprovedCategory.js";
import CategoryRequest from "../models/CategoryRequest.js";

// ===== CREATE NEW CATEGORY =====
export const createCategoryRequest = async (req, res) => {
  try {
    const { categoryName, skillName } = req.body;

    if (!categoryName || !skillName) {
      return res.status(400).json({
        error: "Category name and skill name are required",
      });
    }

    const existingApproved = await ApprovedCategory.findOne({
      skillName,
      categoryName: categoryName.trim(),
      isActive: true,
    });

    if (existingApproved) {
      return res.status(400).json({
        error: "This category already exists for this skill",
      });
    }

    const existingRequest = await CategoryRequest.findOne({
      skillName,
      categoryName: categoryName.trim(),
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        error: "A request for this category is already pending approval",
      });
    }

    const newRequest = new CategoryRequest({
      categoryName: categoryName.trim(),
      skillName,
      requestedBy: req.user._id,
    });

    await newRequest.save();

    res.status(201).json({
      message: "Category request submitted successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating category request:", error);
    res.status(500).json({ error: "Failed to create category request" });
  }
};

// ===== GET ALL CATEGORIES =====
export const getAllCategoryRequests = async (req, res) => {
  try {
    const requests = await CategoryRequest.find()
      .populate("requestedBy", "firstName lastName username email")
      .populate("reviewedBy", "firstName lastName username")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching category requests:", error);
    res.status(500).json({ error: "Failed to fetch category requests" });
  }
};

// ===== APPROVE CATEGORY REQUEST =====
export const approveCategoryRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await CategoryRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        error: "This request has already been processed",
      });
    }

    const existingCategory = await ApprovedCategory.findOne({
      skillName: request.skillName,
      categoryName: request.categoryName,
      isActive: true,
    });

    if (existingCategory) {
      return res.status(400).json({
        error: "This category already exists",
      });
    }

    const approvedCategory = new ApprovedCategory({
      skillName: request.skillName,
      categoryName: request.categoryName,
      addedBy: req.user._id,
    });

    await approvedCategory.save();

    request.status = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    res.status(200).json({
      message: "Category request approved successfully",
      category: approvedCategory,
    });
  } catch (error) {
    console.error("Error approving category request:", error);
    res.status(500).json({ error: "Failed to approve category request" });
  }
};

// ===== REJECT A CATEGORY =====
export const rejectCategoryRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await CategoryRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        error: "This request has already been processed",
      });
    }

    request.status = "rejected";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    res.status(200).json({
      message: "Category request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting category request:", error);
    res.status(500).json({ error: "Failed to reject category request" });
  }
};

// ===== GET APPROVED CATEGORIES =====
export const getApprovedCategories = async (req, res) => {
  try {
    const categories = await ApprovedCategory.find({ isActive: true })
      .select("skillName categoryName")
      .sort({ skillName: 1, categoryName: 1 });

    const groupedCategories = categories.reduce((acc, cat) => {
      if (!acc[cat.skillName]) {
        acc[cat.skillName] = [];
      }
      acc[cat.skillName].push(cat.categoryName);
      return acc;
    }, {});

    res.status(200).json(groupedCategories);
  } catch (error) {
    console.error("Error fetching approved categories:", error);
    res.status(500).json({ error: "Failed to fetch approved categories" });
  }
};
