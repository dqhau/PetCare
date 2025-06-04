import VaccinationHistory from "../models/VaccinationHistory.js";
import Pet from "../models/pet.js";
import User from "../models/user.js";
import Booking from "../models/booking.js";

// Get all vaccination records
export const getAllVaccinations = async (req, res) => {
  try {
    const vaccinations = await VaccinationHistory.find()
      .populate("userId", "fullname username")
      .populate("bookingId", "appointment_date time_slot");
    
    res.status(200).json(vaccinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vaccination records by user ID
export const getVaccinationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const vaccinations = await VaccinationHistory.find({ userId })
      .populate("bookingId", "appointment_date time_slot")
      .sort({ date: -1 });
    
    res.status(200).json(vaccinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vaccination records by pet ID
export const getVaccinationsByPet = async (req, res) => {
  try {
    const { petId } = req.params;
    
    // Check if pet exists
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Không tìm thấy thú cưng" });
    }
    
    const vaccinations = await VaccinationHistory.find({ petId })
      .populate("userId", "fullname username")
      .populate("bookingId", "appointment_date time_slot")
      .sort({ date: -1 });
    
    res.status(200).json(vaccinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new vaccination record
export const createVaccination = async (req, res) => {
  try {
    const { userId, petId, bookingId, vaccineType, date, notes } = req.body;
    
    // Validate required fields
    if (!userId || !petId || !vaccineType || !date) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    
    // Check if pet exists
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Không tìm thấy thú cưng" });
    }
    
    // Check if booking exists if provided
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Không tìm thấy lịch đặt" });
      }
    }
    
    // Create new vaccination record
    const newVaccination = new VaccinationHistory({
      userId,
      petId,
      bookingId,
      vaccineType,
      date: new Date(date),
      notes: notes || ""
    });
    
    const savedVaccination = await newVaccination.save();
    
    res.status(201).json(savedVaccination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a vaccination record
export const updateVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    const { vaccineType, date, notes } = req.body;
    
    // Find and update the vaccination record
    const updatedVaccination = await VaccinationHistory.findByIdAndUpdate(
      id,
      { 
        vaccineType,
        date: date ? new Date(date) : undefined,
        notes
      },
      { new: true }
    );
    
    if (!updatedVaccination) {
      return res.status(404).json({ message: "Không tìm thấy lịch sử tiêm phòng" });
    }
    
    res.status(200).json(updatedVaccination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a vaccination record
export const deleteVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedVaccination = await VaccinationHistory.findByIdAndDelete(id);
    
    if (!deletedVaccination) {
      return res.status(404).json({ message: "Không tìm thấy lịch sử tiêm phòng" });
    }
    
    res.status(200).json({ message: "Đã xóa lịch sử tiêm phòng thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
