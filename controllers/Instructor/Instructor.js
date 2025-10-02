import Instructor from "../../model/InstructorModel.js";

// CREATE Instructor
export const createInstructor = async (req, res) => {
  try {
    const instructor = new Instructor(req.body);
    await instructor.save();
    res.status(201).json({
      status: "true",
      code: "201",
      message: "Instructor created successfully",
      data: instructor,
    });
  } catch (error) {
    res.status(400).json({
      status: "false",
      code: "400",
      message: error.message,
      data: {},
    });
  }
};

// GET all Instructors
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find();
    res.status(200).json({
      status: "true",
      code: "200",
      message: "Instructors fetched successfully",
      data: instructors,
    });
  } catch (error) {
    res.status(500).json({
      status: "false",
      code: "500",
      message: error.message,
      data: {},
    });
  }
};

// GET single Instructor by ID
export const getInstructorById = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({
        status: "false",
        code: "404",
        message: "Instructor not found",
        data: {},
      });
    }
    res.status(200).json({
      status: "true",
      code: "200",
      message: "Instructor fetched successfully",
      data: instructor,
    });
  } catch (error) {
    res.status(500).json({
      status: "false",
      code: "500",
      message: error.message,
      data: {},
    });
  }
};

// UPDATE Instructor
export const updateInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!instructor) {
      return res.status(404).json({
        status: "false",
        code: "404",
        message: "Instructor not found",
        data: {},
      });
    }
    res.status(200).json({
      status: "true",
      code: "200",
      message: "Instructor updated successfully",
      data: instructor,
    });
  } catch (error) {
    res.status(400).json({
      status: "false",
      code: "400",
      message: error.message,
      data: {},
    });
  }
};

// DELETE Instructor
export const deleteInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndDelete(req.params.id);
    if (!instructor) {
      return res.status(404).json({
        status: "false",
        code: "404",
        message: "Instructor not found",
        data: {},
      });
    }
    res.status(200).json({
      status: "true",
      code: "200",
      message: "Instructor deleted successfully",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      status: "false",
      code: "500",
      message: error.message,
      data: {},
    });
  }
};
