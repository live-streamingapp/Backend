import User from "../../model/UserModel.js";

export const getUsers = async (req, res) => {
  try {
    // Fetch users where role is "student"
    const students = await User.find({ role: "student" }).select("-password");

    res.status(200).json({
      status: true,
      code: 200,
      message: "Students fetched successfully",
      data: {
        count: students.length,
        students,
      },
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error fetching students",
      error: err.message,
    });
  }
};
