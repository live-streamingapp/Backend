import Course from "../../model/CourseModel.js";

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params; // course id from URL

    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "Course not found",
        data: null,
      });
    }

    res.status(200).json({
      status: true,
      code: 200,
      message: "Course deleted successfully",
      data: deletedCourse,
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(400).json({
      status: false,
      code: 400,
      message: "Error deleting course",
      error: error.message,
    });
  }
};
