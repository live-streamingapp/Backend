import Course from "../../model/CourseModel.js";

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({
      status: "true",
      code: "200",
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      status: "false",
      code: "500",
      message: "Failed to fetch courses",
      data: {},
      error: error.message,
    });
  }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        status: "false",
        code: "404",
        message: "Course not found",
        data: {},
      });
    }

    res.status(200).json({
      status: "true",
      code: "200",
      message: "Course fetched successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      status: "false",
      code: "500",
      message: "Failed to fetch course",
      data: {},
      error: error.message,
    });
  }
};
