import Pet from "../models/pet.js";

/**
 * Dịch vụ xử lý logic liên quan đến thú cưng
 */
const petService = {
  /**
   * Lấy tất cả thú cưng
   * @returns {Promise<Array>} Danh sách thú cưng
   */
  async fetchAllPets() {
    try {
      const allPets = await Pet.find({}).exec();
      return allPets;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Lấy thú cưng theo userId
   * @param {string} userId - ID người dùng
   * @returns {Promise<Array>} Danh sách thú cưng của người dùng
   */
  async getPetsByUserId(userId) {
    try {
      const userPets = await Pet.find({ userId }).exec();
      return userPets;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Lấy thú cưng theo ID
   * @param {string} id - ID thú cưng
   * @returns {Promise<Object>} Thú cưng
   */
  async getPetById(id) {
    try {
      const pet = await Pet.findById(id).exec();
      return pet;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Xóa thú cưng
   * @param {string} id - ID thú cưng
   * @returns {Promise<Object>} Thú cưng đã xóa
   */
  async deletePet(id) {
    try {
      const deletedPet = await Pet.findByIdAndDelete(id).exec();
      return deletedPet;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Lấy thú cưng mới nhất
   * @param {number} limit - Giới hạn số lượng
   * @returns {Promise<Array>} Danh sách thú cưng mới nhất
   */
  async getLatestPets(limit = 4) {
    try {
      const latestPets = await Pet.find({}).sort({ createdAt: -1 }).limit(limit).exec();
      return latestPets;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Cập nhật thú cưng
   * @param {string} id - ID thú cưng
   * @param {Object} petData - Dữ liệu thú cưng
   * @returns {Promise<Object>} Thú cưng đã cập nhật
   */
  async updatePet(id, petData) {
    try {
      const updatedPet = await Pet.findByIdAndUpdate(id, petData, { new: true }).exec();
      return updatedPet;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Tạo thú cưng mới
   * @param {Object} petData - Dữ liệu thú cưng
   * @returns {Promise<Object>} Thú cưng mới
   */
  async createPet(petData) {
    try {
      const newPet = new Pet(petData);
      const savedPet = await newPet.save();
      return savedPet;
    } catch (error) {
      throw new Error(error.toString());
    }
  }
};

export default petService;
