import express from "express";
import { calculateNumbers } from "../utils/numerologyCalculator.js";

const numerologyRoutes = express.Router();

numerologyRoutes.get("/", (req, res) => {
  const { fullName, dob } = req.query;

  console.log("Received numerology request:", { fullName, dob });
  if (!fullName || !dob) {
    return res.status(400).json({ message: "fullName and dob are required" });
  }

  const dobRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!dobRegex.test(dob)) {
    return res
      .status(400)
      .json({ message: "DOB must be in DD-MM-YYYY format" });
  }

  try {
    const result = calculateNumbers(fullName, dob);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error calculating numerology:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default numerologyRoutes;
