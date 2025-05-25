import Booking from "../models/booking.js";
import Timeslot from "../models/timeslot.js";
import Service from "../models/service.js";
import Notification from "../models/notification.js";
import User from "../models/user.js";
import bookingService from "../services/bookingService.js";
import notificationService from "../services/notificationService.js";
import createError from "http-errors";

// Lấy tổng số dịch vụ đã book
const getTotalServices = async (req, res) => {
  try {
    const totalservicesBooked = await bookingService.getTotalServices();
    return res.status(200).json({ totalservicesBooked });
  } catch (error) {
    res.status(500).json({ message: error.toString() });
  }
};

// Tính tổng tiền tất cả services ở trạng thái completed
const getRevenueServices = async (req, res, next) => {
  try {
    const totalAmount = await bookingService.getRevenueServices();
    res.status(200).json({ totalAmount });
  } catch (error) {
    next(error);
  }
};

// Tổng tiền theo từng loại dịch vụ
const getRevenueByServiceType = async (req, res, next) => {
  try {
    const revenueByServiceType = await bookingService.getRevenueByServiceType();
    res.status(200).json({ revenueByServiceType });
  } catch (error) {
    next(error);
  }
};

// Lấy số lượng giống đực và cái làm dịch vụ
const getPetBreeds = async (req, res) => {
  try {
    const { maleCount, femaleCount } = await bookingService.getPetBreeds();
    return res.status(200).json({ maleCount, femaleCount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách tất cả các booking theo user
const getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('getBookingsByUser called with userId:', userId);
    
    if (!userId) {
      console.log('UserId không được cung cấp');
      return res.status(400).json({ message: "UserId không được cung cấp" });
    }

    console.log('Fetching bookings for userId:', userId);
    const bookings = await bookingService.getBookingsByUser(userId);
    
    // Trả về kết quả với các trường đã được populate
    const formattedBookings = bookings.map(booking => {
      const { service_type, petId, timeslot, ...rest } = booking.toObject();
      
      return {
        ...rest,
        service_type: service_type ? {
          _id: service_type._id,
          name: service_type.name,
          price: service_type.price
        } : null,
        petId: petId ? {
          _id: petId._id,
          name: petId.name,
          species: petId.species,
          breed: petId.breed
        } : null,
        timeslot: timeslot ? {
          _id: timeslot._id,
          start_time: timeslot.start_time,
          end_time: timeslot.end_time
        } : null
      };
    });

    res.status(200).json(formattedBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin booking theo ID
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const booking = await bookingService.getBookingById(id);
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking details:', error);
    if (error.status === 404) {
      return res.status(404).json({ error: "Không tìm thấy thông tin đặt lịch" });
    }
    res.status(500).json({ 
      error: "Không thể lấy thông tin đặt lịch", 
      message: error.message 
    });
  }
};

// Lấy tổng số đặt lịch theo trạng thái
const getBookingStatsByStatus = async (req, res, next) => {
  try {
    const stats = await bookingService.getBookingStatsByStatus();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách các booking (admin lấy tất cả, user chỉ lấy của mình)
const getAllBookings = async (req, res, next) => {
  try {
    // Lấy thông tin người dùng từ token
    const userId = req.payload?.aud;
    
    // Lấy thông tin role từ database
    const User = await import("../models/user.js").then(m => m.default);
    const user = await User.findById(userId);
    const userRole = user ? user.role : null;
    
    console.log('getAllBookings called with userRole:', userRole);
    console.log('getAllBookings called with userId:', userId);
    
    let bookings;
    
    // Nếu là admin, lấy tất cả booking
    if (userRole === 'admin') {
      console.log('Getting all bookings for admin');
      bookings = await bookingService.getAllBookings();
      console.log(`Found ${bookings.length} bookings for admin`);
    } 
    // Nếu là user, chỉ lấy booking của user đó
    else if (userId) {
      console.log('Getting bookings for user:', userId);
      bookings = await bookingService.getBookingsByUser(userId);
      console.log(`Found ${bookings.length} bookings for user ${userId}`);
    } 
    // Nếu không có thông tin xác thực
    else {
      console.log('No authentication information found');
      return res.status(403).json({ error: "Bạn không có quyền truy cập" });
    }
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: "Không thể lấy danh sách đặt lịch", message: error.message });
  }
};

// Cập nhật trạng thái booking và tạo lịch sử tiêm chủng - API dành cho admin
const updateBookingStatus = async (req, res, next) => {
  try {
    // Kiểm tra quyền admin
    if (!req.payload || !req.payload.user) {
      throw createError(401, "Bạn chưa đăng nhập");
    }
    
    // Lấy role trực tiếp từ token
    const userRole = req.payload.user.role;
    
    if (userRole !== 'admin') {
      throw createError(403, "Bạn không có quyền thực hiện hành động này");
    }
    
    // Lấy dữ liệu cập nhật từ request body
    const { order_status, cancel_reason } = req.body;
    
    // Nếu cập nhật thành 'Cancel', yêu cầu lý do hủy
    if (order_status === 'Cancel' && !cancel_reason) {
      throw createError(400, "Vui lòng cung cấp lý do hủy lịch");
    }
    
    // Gọi service để cập nhật trạng thái và tạo lịch sử tiêm chủng nếu cần
    const result = await bookingService.updateBookingStatusWithHistory(req.params.id, req.body);
    
    // Chỉ tạo thông báo cho user khi admin cập nhật trạng thái booking
    if (result) {
      // Lấy thông tin dịch vụ
      const serviceInfo = await Service.findById(result.service_type);
      const serviceName = serviceInfo ? serviceInfo.name : 'Không xác định';
      
      // Lấy thông tin ngày và giờ
      const bookingDate = new Date(result.appointment_date).toLocaleDateString('vi-VN');
      const timeslot = await Timeslot.findById(result.timeslot);
      const bookingTime = timeslot ? timeslot.time : '';
      
      let message = '';
      
      // Tạo nội dung thông báo dựa trên trạng thái mới
      if (order_status === "Processing") {
        message = `Lịch đặt dịch vụ ${serviceName} vào ngày ${bookingDate} lúc ${bookingTime}h của bạn đã được xác nhận`;
      } else if (order_status === "Completed") {
        message = `Dịch vụ ${serviceName} vào ngày ${bookingDate} lúc ${bookingTime}h của bạn đã được hoàn thành`;
      } else if (order_status === "Cancel") {
        const reason = cancel_reason ? ` với lý do: ${cancel_reason}` : '';
        message = `Lịch đặt dịch vụ ${serviceName} vào ngày ${bookingDate} lúc ${bookingTime}h của bạn đã bị hủy${reason}`;
      }
      
      // Chỉ tạo thông báo nếu có nội dung và userId
      if (message && result.userId) {
        const notificationData = {
          type: order_status === "Cancel" ? 'cancellation' : 
                (order_status === "Completed" ? 'completion' : 'booking'),
          message: message,
          relatedId: result._id,
          userId: result.userId // Thông báo cho user cụ thể
        };
        
        await notificationService.createNotification(notificationData);
      }
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách booking theo userId và trạng thái
const getBookingsByUserAndStatus = async (req, res, next) => {
  try {
    const { userId, status } = req.params;
    
    const bookings = await bookingService.getBookingsByUserAndStatus(userId, status);
    
    // Xử lý dữ liệu trước khi trả về
    const processedBookings = bookings.map(booking => {
      // Đảm bảo các trường cần thiết đề hiển thị
      return {
        ...booking.toObject(),
        // Thêm các trường mặc định nếu không có
        order_status: booking.order_status || status,
        petId: booking.petId || { name: 'Không có thông tin' }
      };
    });
    
    res.status(200).json(processedBookings || []);
  } catch (error) {
    console.error("Error fetching user bookings by status:", error);
    res.status(500).json({ 
      error: "Không thể lấy danh sách đặt lịch", 
      message: error.message 
    });
  }
};

// Lấy danh sách booking theo userId


// Thêm booking mới
const createBooking = async (req, res, next) => {
  try {
    // Lấy userId từ token nếu có, nếu không thì lấy từ request body
    const tokenUserId = req.payload ? req.payload.aud : null;
    
    const {
      userId: bodyUserId,
      service_type,
      customer_name,
      phone_number,
      email,
      address,
      appointment_date,
      timeslotId,
      order_status,
      petId,
      pet_info: petInfoPayload,
    } = req.body;
    
    // Ưu tiên sử dụng userId từ token, nếu không có thì sử dụng userId từ request body
    const userId = tokenUserId || bodyUserId;
    
    console.log('Creating booking with userId:', userId);
    console.log('Token userId:', tokenUserId);
    console.log('Body userId:', bodyUserId);

    // 1. Validate bắt buộc

    if (!timeslotId) {
      return res.status(400).json({ error: "Missing timeslotId" });
    }
    
    // Kiểm tra ngày đặt lịch
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const appointmentDay = new Date(appointment_date);
    appointmentDay.setHours(0, 0, 0, 0);
    
    // Kiểm tra đặt lịch trong quá khứ
    if (appointmentDay < today) {
      return res.status(400).json({ error: "Không thể đặt lịch cho ngày trong quá khứ" });
    }
    
    // Kiểm tra đặt lịch quá xa trong tương lai (tối đa 3 tháng)
    const maxDate = new Date(today);
    maxDate.setMonth(today.getMonth() + 3);
    
    if (appointmentDay > maxDate) {
      return res.status(400).json({ error: "Chỉ có thể đặt lịch tối đa 3 tháng trước" });
    }

    // 2. Kiểm slot
    const timeslot = await Timeslot.findById(timeslotId);
    if (!timeslot) {
      return res.status(400).json({ error: "Timeslot not found" });
    }
    if (timeslot.availableSlots <= 0) {
      return res.status(400).json({ error: "No available slots" });
    }

    // 3. Xác định pet_info
    let pet_info;
    if (petId) {
      // Nếu gửi petId, lookup pet từ collection pets
      const Pet = await import("../models/pet.js").then(m => m.default);
      const pet = await Pet.findOne({ _id: petId, userId });
      
      if (!pet) {
        return res.status(404).json({ error: "Pet not found or does not belong to user" });
      }
      
      // Build đúng theo schema booking.pet_info
      pet_info = {
        pet_name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
        notes: pet.notes || "",
      };
    } else {
      // Nếu không có petId, sử dụng pet_info từ payload
      if (!petInfoPayload) {
        return res.status(400).json({ error: "Missing pet information" });
      }
      pet_info = petInfoPayload;
    }

    // 4. Tạo booking
    const bookingData = {
      userId,
      service_type,
      customer_name,
      phone_number,
      email,
      address,
      appointment_date,
      timeslot: timeslotId,
      order_status,
      pet_info,
      petId: petId || null,  // lưu petId nếu có
    };

    const savedBooking = await bookingService.createBooking(bookingData, timeslot);
    
    // 6. Chỉ tạo thông báo cho admin
    const serviceInfo = await Service.findById(service_type);
    const serviceName = serviceInfo ? serviceInfo.name : 'Không xác định';
    const bookingDate = new Date(appointment_date).toLocaleDateString('vi-VN');
    const bookingTime = timeslot.time;
    
    // Tạo thông báo cho admin (userId = null)
    const notificationData = {
      type: 'booking',
      message: `Đặt lịch mới: ${customer_name} đã đặt lịch dịch vụ ${serviceName} vào ngày ${bookingDate} lúc ${bookingTime}h`,
      relatedId: savedBooking._id,
      userId: null // Thông báo cho admin có userId = null
    };
    
    await notificationService.createNotification(notificationData);
    
    // Tạo thông báo cho user nếu đã đăng nhập
    if (userId) {
      try {
        const userNotificationData = {
          type: 'booking',
          message: `Bạn đã đặt lịch dịch vụ ${serviceName} vào ngày ${bookingDate} lúc ${bookingTime}h thành công. Chúng tôi sẽ xử lý lịch của bạn sớm nhất có thể.`,
          relatedId: savedBooking._id,
          userId: userId // Thông báo cho user
        };
        
        await notificationService.createNotification(userNotificationData);
        console.log(`Đã gửi thông báo xác nhận đặt lịch đến user ${userId}`);
      } catch (notificationError) {
        console.error('Lỗi khi tạo thông báo cho user:', notificationError);
        // Không throw error để không ảnh hưởng đến việc tạo booking
      }
    }

    res.status(201).json(savedBooking);
  } catch (err) {
    next(err);
  }
};

// Sửa thông tin booking theo ID
const updateBooking = async (req, res, next) => {
  try {
    const {
      service_type,
      customer_name,
      phone_number,
      email,
      address,
      appointment_date,
      timeslotId,
      order_status,
      pet_info,
    } = req.body;
    
    const bookingData = {
      service_type,
      customer_name,
      phone_number,
      email,
      address,
      appointment_date,
      timeslot: timeslotId,
      order_status,
      pet_info,
    };
    
    const booking = await bookingService.updateBooking(req.params.id, bookingData);
    if (!booking) {
      throw createError(404, "Không tìm thấy booking");
    }

    res.send(booking);
  } catch (error) {
    next(error);
  }
};

// Xóa booking theo ID
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.deleteBooking(req.params.id);
    if (!booking) {
      throw createError(404, "Không tìm thấy booking");
    }

    res.send(booking);
  } catch (error) {
    next(error);
  }
};

// Cập nhật trạng thái booking - API dành cho user hủy lịch
const updateBookingStatusWithHistory = async (req, res, next) => {
  try {
    // Kiểm tra booking có tồn tại không
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      throw createError(404, "Không tìm thấy booking");
    }
    
    // Kiểm tra trạng thái hiện tại của booking
    if (booking.order_status === 'Completed') {
      throw createError(400, "Không thể hủy lịch đã hoàn thành");
    }
    
    if (booking.order_status === 'Cancel') {
      throw createError(400, "Lịch đã bị hủy trước đó");
    }
    
    // Kiểm tra thời gian hẹn
    const appointmentDate = new Date(booking.appointment_date);
    const today = new Date();
    
    // Tính số ngày còn lại trước ngày hẹn
    const timeDiff = appointmentDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Nếu còn ít hơn 1 ngày trước hẹn, không cho phép hủy
    if (daysDiff < 1) {
      throw createError(400, "Chỉ có thể hủy lịch trước ngày hẹn ít nhất 1 ngày");
    }
    
    // Lấy lý do hủy từ request body
    const { cancel_reason } = req.body;
    if (!cancel_reason) {
      throw createError(400, "Vui lòng cung cấp lý do hủy lịch");
    }
    
    // Cập nhật trạng thái thành 'Cancel'
    const updatedBooking = await bookingService.updateBookingStatus(req.params.id, "Cancel", cancel_reason);
    if (!booking) {
      throw createError(404, "Không tìm thấy booking");
    }

    // Tạo thông báo cho admin khi người dùng hủy lịch
    try {
      // Lấy thông tin dịch vụ
      const serviceInfo = await Service.findById(updatedBooking.service_type);
      const serviceName = serviceInfo ? serviceInfo.name : 'Không xác định';
      
      // Lấy thông tin thời gian
      const bookingDate = new Date(updatedBooking.appointment_date).toLocaleDateString('vi-VN');
      const timeslotInfo = await Timeslot.findById(updatedBooking.timeslot);
      const bookingTime = timeslotInfo ? `${timeslotInfo.time}:00` : 'Không xác định';
      
      // Tạo thông báo cho admin (userId = null)
      const notificationData = {
        type: 'cancellation', // Sử dụng loại thông báo hợp lệ
        message: `Hủy đặt lịch: ${updatedBooking.customer_name} đã hủy lịch dịch vụ ${serviceName} vào ngày ${bookingDate} lúc ${bookingTime}. Lý do: ${cancel_reason}`,
        relatedId: updatedBooking._id,
        userId: null // Thông báo cho admin có userId = null
      };
      
      await notificationService.createNotification(notificationData);
      console.log('Notification sent to admin for booking cancellation');
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Không throw error để không ảnh hưởng đến việc hủy lịch
    }

    res.send(booking);
  } catch (error) {
    next(error);
  }
};

// API để chuyển đổi timeslot cho booking
const changeTimeslot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newTimeslotId } = req.body;
    
    if (!newTimeslotId) {
      return res.status(400).json({ error: "Vui lòng cung cấp ID timeslot mới" });
    }
    
    const result = await bookingService.changeTimeslot(id, newTimeslotId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error changing timeslot:", error);
    res.status(500).json({ error: error.message || "Lỗi khi chuyển đổi timeslot" });
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
