import Booking from "../models/booking.js";
import Timeslot from "../models/timeslot.js";
import User from "../models/user.js";
import VaccinationHistory from "../models/VaccinationHistory.js";
import createError from "http-errors";

// Lấy tổng số dịch vụ đã book
const getTotalServices = async () => {
  try {
    return await Booking.countDocuments({
      order_status: { $ne: "Cancel" },
    });
  } catch (error) {
    throw new Error(error.toString());
  }
};

// Tính tổng tiền tất cả services ở trạng thái completed
const getRevenueServices = async () => {
  try {
    const completedBookings = await Booking.find({ order_status: "Completed" })
      .populate("service_type")
      .exec();

    const totalAmount = completedBookings.reduce((total, booking) => {
      if (booking.service_type && booking.service_type.price) {
        return total + booking.service_type.price;
      }
      return total;
    }, 0);

    return totalAmount;
  } catch (error) {
    throw new Error(error.toString());
  }
};

// Tổng tiền theo từng loại dịch vụ
const getRevenueByServiceType = async () => {
  try {
    const completedBookings = await Booking.find({ order_status: "Completed" })
      .populate("service_type")
      .exec();
    
    const revenueByServiceType = completedBookings.reduce(
      (accumulator, booking) => {
        const serviceName = booking.service_type.name;
        const servicePrice = booking.service_type.price;

        if (!accumulator[serviceName]) {
          accumulator[serviceName] = 0;
        }

        accumulator[serviceName] += servicePrice;
        return accumulator;
      },
      {}
    );

    return revenueByServiceType;
  } catch (error) {
    throw new Error(error.toString());
  }
};

// Lấy số lượng giống đực và cái làm dịch vụ
const getPetBreeds = async () => {
  try {
    const bookings = await Booking.find();
    const { maleCount, femaleCount } = bookings.reduce(
      (count, boking) => {
        const breed = boking.pet_info.breed;
        if (breed === "Đực") {
          count.maleCount++;
        } else if (breed === "Cái") {
          count.femaleCount++;
        }
        return count;
      },
      { maleCount: 0, femaleCount: 0 }
    );
    
    return { maleCount, femaleCount };
  } catch (error) {
    throw new Error(error.toString());
  }
};

// Lấy danh sách tất cả các booking theo user
const getBookingsByUser = async (userId) => {
  try {
    return await Booking.find({ userId })
      .populate("service_type")
      .populate("timeslot")
      .sort({ createdAt: -1 })
      .exec();
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw new Error(error.toString());
  }
};



// Lấy thông tin booking theo ID
const getBookingById = async (id) => {
  try {
    return await Booking.findOne({ _id: id })
      .populate("service_type")
<<<<<<< HEAD
      .populate("timeslot")
      .populate("petId"); // Populate thông tin thú cưng
=======
      .populate("timeslot");
>>>>>>> 37b59e38b3e7f9b81d5a57ca12da94b2c3c5f2c5
  } catch (error) {
    throw new Error(error.toString());
  }
};



// Lấy tổng số đặt lịch theo trạng thái
const getBookingStatsByStatus = async () => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: "$order_status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Chuyển đổi kết quả thành đối tượng dễ sử dụng
    const result = {};
    stats.forEach(item => {
      result[item._id] = item.count;
    });
    
    // Đảm bảo tất cả trạng thái đều có trong kết quả
    const allStatuses = ["Pending", "Processing", "Completed", "Cancel"];
    allStatuses.forEach(status => {
      if (!result[status]) result[status] = 0;
    });
    
    // Thêm tổng số đặt lịch
    result.total = await Booking.countDocuments();
    
    return result;
  } catch (error) {
    throw new Error(error.toString());
  }
};

// Lấy danh sách tất cả các booking
const getAllBookings = async () => {
  try {
    return await Booking.find({})
      .populate("service_type")
      .populate("timeslot")
<<<<<<< HEAD
      .populate("petId") // Populate thông tin thú cưng
=======
>>>>>>> 37b59e38b3e7f9b81d5a57ca12da94b2c3c5f2c5
      .sort({ createdAt: -1 })
      .exec();
  } catch (error) {
    throw new Error(error.toString());
  }
};

// Cập nhật trạng thái booking và lý do nếu chuyển thành 'cancel' api cho user
const updateBookingStatus = async (id, status, cancel_reason) => {
  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      throw createError(404, "Không tìm thấy booking");
    }
    
    // Nếu trạng thái mới là Cancel và trạng thái cũ không phải Cancel
    if (status === "Cancel" && booking.order_status !== "Cancel") {
      // Tìm timeslot liên quan và tăng số lượng slot còn trống
      const timeslot = await Timeslot.findById(booking.timeslot);
      if (timeslot) {
        timeslot.availableSlots += 1;
        await timeslot.save();
      }
    }
    
    // Cập nhật trạng thái booking
    booking.order_status = status;
    if (cancel_reason) {
      booking.cancel_reason = cancel_reason;
    }
    
    await booking.save();
    return booking;
  } catch (error) {
    throw new Error(error.toString());
  }
};

// Lấy danh sách booking theo userId và trạng thái
const getBookingsByUserAndStatus = async (userId, status) => {
  try {
    return await Booking.find({ userId, order_status: status })
<<<<<<< HEAD
      .populate("service_type")
      .populate("timeslot")
      .populate("petId") // Populate thông tin thú cưng
=======
      .populate("service_type timeslot")
>>>>>>> 37b59e38b3e7f9b81d5a57ca12da94b2c3c5f2c5
      .exec();
  } catch (error) {
    throw new Error(error.toString());
  }
};



// Thêm booking mới
const createBooking = async (bookingData, timeslot) => {
  try {
    const newBooking = new Booking(bookingData);
    const savedBooking = await newBooking.save();

    // Giảm availableSlots
    timeslot.availableSlots -= 1;
    await timeslot.save();
    
    return savedBooking;
  } catch (error) {
    throw new Error(error.toString());
  }
};

// Sửa thông tin booking theo ID
const updateBooking = async (id, bookingData) => {
  try {
    return await Booking.findByIdAndUpdate(
      id,
      bookingData,
      { new: true }
    );
  } catch (error) {
    throw new Error(error.toString());
  }
};

// Xóa booking theo ID
const deleteBooking = async (id) => {
  try {
    const booking = await Booking.findByIdAndDelete(id);
    
    if (booking) {
      const timeslot = await Timeslot.findById(booking.timeslot);
      if (timeslot) {
        timeslot.availableSlots += 1;
        await timeslot.save();
      }
    }
    
    return booking;
  } catch (error) {
    throw new Error(error.toString());
  }
};

// Cập nhật trạng thái lịch với lịch sử tiêm chủng nếu cần
const updateBookingStatusWithHistory = async (id, updateData) => {
  try {
    // 1. Tìm booking cần cập nhật
    const booking = await Booking.findById(id);
    if (!booking) {
      throw createError(404, "Không tìm thấy booking");
    }
    
    // 2. Nếu trạng thái mới là Cancel và trạng thái cũ không phải Cancel
    if (updateData.order_status === "Cancel" && booking.order_status !== "Cancel") {
      // Tìm timeslot liên quan và tăng số lượng slot còn trống
      const timeslot = await Timeslot.findById(booking.timeslot);
      if (timeslot) {
        timeslot.availableSlots += 1;
        await timeslot.save();
      }
    }
    
<<<<<<< HEAD
    // 3. Cập nhật trạng thái booking sử dụng findByIdAndUpdate
    console.log(`Cập nhật booking ${id} với trạng thái: ${updateData.order_status}`);
    
    // Tạo đối tượng cập nhật
    const updateFields = {};
    
    // Cập nhật trạng thái
    if (updateData.order_status) {
      updateFields.order_status = updateData.order_status;
    }
    
    // Nếu có lý do hủy và trạng thái là Cancel, thêm vào update data
    if (updateData.cancel_reason && updateData.order_status === "Cancel") {
      updateFields.cancel_reason = updateData.cancel_reason;
    }
    
    console.log('Các trường sẽ cập nhật:', updateFields);
    
    // Sử dụng updateOne thay vì findByIdAndUpdate để đảm bảo cập nhật được thực hiện
    const result = await Booking.updateOne(
      { _id: id },
      { $set: updateFields }
    );
    
    console.log('Kết quả cập nhật:', result);
    
    // Lấy booking đã cập nhật để trả về với thông tin đầy đủ
    const updatedBooking = await Booking.findById(id)
      .populate("service_type")
      .populate("timeslot")
      .populate("petId");
    
    if (!updatedBooking) {
=======
    // 3. Cập nhật trạng thái booking
    booking.order_status = updateData.order_status;
    
    // Nếu có lý do hủy và trạng thái là Cancel, thêm vào update data
    if (updateData.cancel_reason && updateData.order_status === "Cancel") {
      booking.cancel_reason = updateData.cancel_reason;
    }
    
    await booking.save();
    
    if (!booking) {
>>>>>>> 37b59e38b3e7f9b81d5a57ca12da94b2c3c5f2c5
      throw createError(404, "Không tìm thấy booking");
    }
    
    // Nếu hủy đặt lịch, tăng số lượng slot trống
<<<<<<< HEAD
    // Lưu ý: Chúng ta đã xử lý điều này ở bước 2 nên có thể bỏ qua đoạn này
    // Giữ lại để đảm bảo tương thích ngược

    // 2. Nếu chuyển sang Completed và service_type là vaccine
    const isVaccineService = updatedBooking.service_type == "668959f11561a7b14634d6e6";
    
    if (updateData.order_status === "Completed" && isVaccineService) {
      try {
        // Lấy user để kiểm pet list
        const user = await User.findById(updatedBooking.userId).select("pets");
        if (!user) {
          console.log("Không tìm thấy user");
          return updatedBooking;
        }
        
        // Sử dụng petId thay vì tìm kiếm trong pets
        if (updatedBooking.petId) {
          // Build lịch sử tiêm
          const hist = {
            userId:    updatedBooking.userId,
            petId:     updatedBooking.petId,
            bookingId: updatedBooking._id,
            vaccineType: updatedBooking.service_type,
            date:        updatedBooking.appointment_date,
            notes:       `Tiêm phòng vào ${new Date(updatedBooking.appointment_date).toLocaleDateString()}`,
          };

          await VaccinationHistory.create(hist);
        }
      } catch (err) {
        console.error("Lỗi khi tạo lịch sử tiêm chủng:", err);
        // Tiếp tục xử lý mà không dừng
      }
    }
    
    return updatedBooking;
=======
    if (updateData.order_status === "Cancel") {
      const timeslot = await Timeslot.findById(booking.timeslot);
      if (timeslot) {
        timeslot.availableSlots += 1;
        await timeslot.save();
      }
    }

    // 2. Nếu chuyển sang Completed và service_type là vaccine
    const isVaccineService = booking.service_type == "668959f11561a7b14634d6e6";
    
    if (updateData.order_status === "Completed" && isVaccineService) {
      // Lấy user để kiểm pet list (nếu cần)
      const user = await User.findById(booking.userId).select("pets");
      if (!user) {
        throw createError(404, "Không tìm thấy user");
      }
      
      const pet = user.pets.find(
        item => item.name === booking.pet_info.pet_name
      );
      
      // Build lịch sử tiêm
      const hist = {
        userId:    booking.userId,
        petId:     pet._id,
        bookingId: booking._id,
        vaccineType: booking.service_type,
        date:        booking.appointment_date,
        notes:       `Tiêm phòng vào ${new Date(booking.appointment_date).toLocaleDateString()}`,
      };

      await VaccinationHistory.create(hist);
    }
    
    return booking;
>>>>>>> 37b59e38b3e7f9b81d5a57ca12da94b2c3c5f2c5
  } catch (error) {
    throw new Error(error.toString());
  }
};

// Chuyển đổi timeslot cho booking
const changeTimeslot = async (id, newTimeslotId) => {
  try {
    // 1. Tìm booking cần cập nhật
    const booking = await Booking.findById(id);
    if (!booking) {
      throw createError(404, "Không tìm thấy booking");
    }
    
    // 2. Tìm timeslot cũ và mới
    const oldTimeslotId = booking.timeslot;
    const oldTimeslot = await Timeslot.findById(oldTimeslotId);
    const newTimeslot = await Timeslot.findById(newTimeslotId);
    
    if (!oldTimeslot) {
      throw createError(404, "Không tìm thấy timeslot cũ");
    }
    
    if (!newTimeslot) {
      throw createError(404, "Không tìm thấy timeslot mới");
    }
    
    // 3. Kiểm tra xem timeslot mới có còn chỗ trống không
    if (newTimeslot.availableSlots <= 0) {
      throw createError(400, "Timeslot mới đã hết chỗ");
    }
    
    // 4. Cập nhật số lượng slot của timeslot cũ và mới
    oldTimeslot.availableSlots += 1;
    newTimeslot.availableSlots -= 1;
    
    // 5. Cập nhật booking với timeslot mới
    booking.timeslot = newTimeslotId;
    
    // 6. Lưu các thay đổi
    await oldTimeslot.save();
    await newTimeslot.save();
    await booking.save();
    
    // 7. Trả về booking đã cập nhật
    return {
      message: "Chuyển đổi timeslot thành công",
      booking
    };
  } catch (error) {
    throw new Error(error.toString());
  }
};

export default {
  getTotalServices,
  getRevenueServices,
  getRevenueByServiceType,
  getPetBreeds,
  getBookingsByUser,
  getBookingById,
  getBookingStatsByStatus,
  getAllBookings,
  updateBookingStatus,
  getBookingsByUserAndStatus,
  createBooking,
  updateBooking,
  deleteBooking,
  updateBookingStatusWithHistory,
  changeTimeslot
};
