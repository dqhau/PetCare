import express from "express";
import userRouter from "./users.js";
import petRouter from "./pets.js";
import serviceRouter from "./service.js";
import bookingRouter from "./booking.js";
import timeslotRouter from "./timeslot.js";
import notificationRouter from "./notification.js";
import statisticsRouter from "./statistics.js";
import uploadRouter from "./upload.js";
import vaccinationRouter from "./vaccination.js";

const router = express.Router();
router.use("/pets", petRouter);
router.use("/users", userRouter);
router.use("/service", serviceRouter);
router.use("/booking", bookingRouter);
router.use("/timeslots", timeslotRouter);
router.use("/notifications", notificationRouter);
router.use("/statistics", statisticsRouter);
router.use("/upload", uploadRouter);
router.use("/vaccination", vaccinationRouter);

export default router;
