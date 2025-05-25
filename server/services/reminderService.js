import Booking from '../models/booking.js';
import Service from '../models/service.js';
import Timeslot from '../models/timeslot.js';
import { sendReminderEmail } from '../helpers/reminder_helper.js';

/**
 * Service xu1eed lu00fd gu1eedi nhu1eafc lu1ecbch hu1eb9n
 */
const reminderService = {
  /**
   * Tu00ecm cu00e1c lu1ecbch hu1eb9n cu1ea7n gu1eedi nhu1eafc
   * @param {Number} daysBeforeAppointment - Su1ed1 ngu00e0y tru01b0u1edbc lu1ecbch hu1eb9n cu1ea7n gu1eedi nhu1eafc
   * @returns {Promise<Array>} - Danh su00e1ch cu00e1c lu1ecbch hu1eb9n cu1ea7n gu1eedi nhu1eafc
   */
  async findAppointmentsToRemind(daysBeforeAppointment = 1) {
    try {
      // Tu00ednh ngu00e0y cu1ea7n gu1eedi nhu1eafc
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysBeforeAppointment);
      
      // Tu00ecm cu00e1c lu1ecbch hu1eb9n vu00e0o ngu00e0y targetDate vu00e0 cu00f3 tru1ea1ng thu00e1i lu00e0 'Pending' hou1eb7c 'Processing'
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      return await Booking.find({
        appointment_date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        order_status: { $in: ['Pending', 'Processing'] },
        email: { $exists: true, $ne: '' } // Chu1ec9 lu1ea5y cu00e1c booking cu00f3 email
      }).populate('service_type').populate('timeslot');
    } catch (error) {
      console.error('Lu1ed7i khi tu00ecm lu1ecbch hu1eb9n cu1ea7n gu1eedi nhu1eafc:', error);
      throw error;
    }
  },
  
  /**
   * Gu1eedi email nhu1eafc lu1ecbch cho tu1ea5t cu1ea3 cu00e1c lu1ecbch hu1eb9n trong ngu00e0y mai
   * @returns {Promise<Object>} - Ku1ebft quu1ea3 gu1eedi email
   */
  async sendDailyReminders() {
    try {
      // Tu00ecm cu00e1c lu1ecbch hu1eb9n vu00e0o ngu00e0y mai
      const appointments = await this.findAppointmentsToRemind(1);
      
      console.log(`Tu00ecm thu1ea5y ${appointments.length} lu1ecbch hu1eb9n cu1ea7n gu1eedi nhu1eafc`);
      
      // Ku1ebft quu1ea3 gu1eedi email
      const results = {
        total: appointments.length,
        success: 0,
        failed: 0,
        details: []
      };
      
      // Gu1eedi email cho tu1eebng lu1ecbch hu1eb9n
      for (const booking of appointments) {
        try {
          const result = await sendReminderEmail(
            booking,
            booking.service_type,
            booking.timeslot
          );
          
          if (result) {
            results.success++;
            results.details.push({
              bookingId: booking._id,
              customerName: booking.customer_name,
              email: booking.email,
              status: 'success'
            });
          } else {
            results.failed++;
            results.details.push({
              bookingId: booking._id,
              customerName: booking.customer_name,
              email: booking.email,
              status: 'failed'
            });
          }
        } catch (error) {
          console.error(`Lu1ed7i khi gu1eedi email nhu1eafc lu1ecbch cho booking ${booking._id}:`, error);
          results.failed++;
          results.details.push({
            bookingId: booking._id,
            customerName: booking.customer_name,
            email: booking.email,
            status: 'failed',
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Lu1ed7i khi gu1eedi email nhu1eafc lu1ecbch hu00e0ng ngu00e0y:', error);
      throw error;
    }
  }
};

export default reminderService;
