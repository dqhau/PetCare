import express from "express";
import {
  verifyRefreshToken,
  verifyAccessToken,
} from "../middleware/authMiddleware.js";
import { userController, authController } from "../controllers/index.js";
import jwt from "jsonwebtoken";
import VaccinationHistory from "../models/VaccinationHistory.js";
import dotenv from 'dotenv';
import User from "../models/user.js";
import createError from "http-errors";

// Cấu hình dotenv
dotenv.config();

const usersRouter = express.Router();

// Các route sử dụng controller
usersRouter.get('/', userController.getAllUsers);
usersRouter.put('/:username', userController.updateUser);
usersRouter.get("/:username", userController.getUserByUserName);
usersRouter.put("/changepass/:username", userController.changePass);
usersRouter.post("/forgot-password", userController.forgetPass);
usersRouter.delete("/delete/:id", verifyAccessToken, userController.deleteUser);

// Đặt lại mật khẩu - Sử dụng authController
usersRouter.post("/reset-password/:id/:token", authController.resetPassword);


usersRouter.get("/pet/:userId", async (req, res, next) => {
 try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("pets");
    if (!user) return next(createError(404, "User not found"));

    res.json(user.pets);
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/vacxin/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const history = await VaccinationHistory
      .find({ userId })
      .sort({ date: -1 })   
       .populate({
        path: "bookingId",
        populate: {
            path: "service_type",
            model: "Service"
          }
      })    
      .lean();

    res.json(history);
  } catch (err) {
    next(err);
  }
});

// Đăng ký người dùng mới - Sử dụng authController
usersRouter.post("/register", authController.register);

// Đăng nhập - Sử dụng authController
usersRouter.post("/login", authController.login);


usersRouter.post("/add-pet", async (req, res, next) => {
  try {
    const petData = req.body;
    // validate required fields
    if (!petData.name || !petData.species) {
      return next(createError(400, "Missing required fields: name, species"));
    }

    const user = await User.findById(petData.userId);
    if (!user) return next(createError(404, "User not found"));

    // Mongoose sẽ tự generate _id cho subdoc
    const newPet = user.pets.create(petData);
    user.pets.push(newPet);
    await user.save();

    res.status(201).json(newPet);
  } catch (err) {
    next(err);
  }
});

usersRouter.put("/pet/:petId/:userId", async (req, res, next) => {
  try {
    const { userId, petId } = req.params;

    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));

    const pet = user.pets.id(petId);
    if (!pet) return next(createError(404, "Pet not found"));

    // Áp dụng updates
    Object.assign(pet, req.body);
    await user.save();

    res.json(pet);
  } catch (err) {
    next(err);
  }
});

usersRouter.delete("/pet/:petId/:userId", async (req, res, next) => {
  try {
    const { userId, petId } = req.params;
   
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));

    const pet = user.pets.id(petId);
    if (!pet) return next(createError(404, "Pet not found"));

    user.pets.pull(petId);
    await user.save();

    res.json({ message: "Pet deleted successfully", petId });
  } catch (err) {
    next(err);
  }
});

usersRouter.delete("/logout", async (req, res, next) => {
  res.send("Đường dẫn Đăng xuất");
});

usersRouter.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      throw createError.BadRequest("Refresh token không hợp lệ");
    const userId = await verifyRefreshToken(refreshToken);
    if (userId) {
      const accessToken = await signAccessToken(userId);
      const newRefreshToken = await signRefreshToken(userId);
      res.send({ accessToken, refreshToken: newRefreshToken });
    }
  } catch (error) {
    next(error);
  }
});// Trong file usersRouter.js




export default usersRouter;
