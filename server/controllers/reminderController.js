import reminderService from '../services/reminderService.js';

/**
 * Controller xu1eed lu00fd chu1ee9c nu0103ng gu1eedi nhu1eafc lu1ecbch hu1eb9n
 */
const reminderController = {
  /**
   * API gu1eedi nhu1eafc lu1ecbch hu1eb9n thu1ee7 cu00f4ng
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async sendReminders(req, res, next) {
    try {
      // Kiu1ec3m tra quyu1ec1n admin
      if (!req.payload || !req.payload.user) {
        return res.status(401).json({ message: "Bu1ea1n chu01b0a u0111u0103ng nhu1eadp" });
      }
      
      const userRole = req.payload.user.role;
      
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Bu1ea1n khu00f4ng cu00f3 quyu1ec1n thu1ef1c hiu1ec7n hu00e0nh u0111u1ed9ng nu00e0y" });
      }
      
      // Gu1eedi nhu1eafc lu1ecbch
      const result = await reminderService.sendDailyReminders();
      
      res.status(200).json({
        message: `u0110u00e3 gu1eedi ${result.success}/${result.total} email nhu1eafc lu1ecbch thu00e0nh cu00f4ng`,
        result
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * API kiu1ec3m tra cu00e1c lu1ecbch hu1eb9n cu1ea7n gu1eedi nhu1eafc
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async checkAppointmentsToRemind(req, res, next) {
    try {
      // Kiu1ec3m tra quyu1ec1n admin
      if (!req.payload || !req.payload.user) {
        return res.status(401).json({ message: "Bu1ea1n chu01b0a u0111u0103ng nhu1eadp" });
      }
      
      const userRole = req.payload.user.role;
      
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Bu1ea1n khu00f4ng cu00f3 quyu1ec1n thu1ef1c hiu1ec7n hu00e0nh u0111u1ed9ng nu00e0y" });
      }
      
      // Lu1ea5y su1ed1 ngu00e0y tru01b0u1edbc tu1eeb query (mu1eb7c u0111u1ecbnh lu00e0 1 ngu00e0y)
      const daysBeforeAppointment = parseInt(req.query.days || '1');
      
      // Tu00ecm cu00e1c lu1ecbch hu1eb9n cu1ea7n gu1eedi nhu1eafc
      const appointments = await reminderService.findAppointmentsToRemind(daysBeforeAppointment);
      
      res.status(200).json({
        message: `Tu00ecm thu1ea5y ${appointments.length} lu1ecbch hu1eb9n cu1ea7n gu1eedi nhu1eafc`,
        appointments
      });
    } catch (error) {
      next(error);
    }
  }
};

export default reminderController;
