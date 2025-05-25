import Service from "../models/service.js";

/**
 * Dịch vụ xử lý logic liên quan đến dịch vụ (Service)
 */
const serviceService = {
  /**
   * Lấy tất cả dịch vụ
   * @returns {Promise<Array>} Danh sách dịch vụ
   */
  async fetchAllService() {
    try {
      const services = await Service.find({}).exec();
      return services;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Lấy dịch vụ theo ID
   * @param {string} id - ID dịch vụ
   * @returns {Promise<Object>} Dịch vụ
   */
  async getServiceById(id) {
    try {
      const service = await Service.findById(id).exec();
      return service;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Tạo dịch vụ mới
   * @param {Object} serviceData - Dữ liệu dịch vụ
   * @returns {Promise<Object>} Dịch vụ mới
   */
  async createService(serviceData) {
    try {
      const newService = new Service(serviceData);
      const savedService = await newService.save();
      return savedService;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Cập nhật dịch vụ
   * @param {string} id - ID dịch vụ
   * @param {Object} serviceData - Dữ liệu dịch vụ
   * @returns {Promise<Object>} Dịch vụ đã cập nhật
   */
  async updateService(id, serviceData) {
    try {
      const updatedService = await Service.findByIdAndUpdate(id, serviceData, { new: true }).exec();
      return updatedService;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Xóa dịch vụ
   * @param {string} id - ID dịch vụ
   * @returns {Promise<Object>} Dịch vụ đã xóa
   */
  async deleteService(id) {
    try {
      const deletedService = await Service.findByIdAndDelete(id).exec();
      return deletedService;
    } catch (error) {
      throw new Error(error.toString());
    }
  }
};

export default serviceService;
