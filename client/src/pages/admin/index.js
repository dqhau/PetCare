export { default as Dashboard } from './DashBoard';
export { default as UserManagement } from './UserManagement';

// Các modules con
import * as BookingManagement from './bookingManagement';
import * as ServiceManagement from './serviceManagement';
import * as TimeslotManagement from './timeslotManagement';
import * as VaccinationManagement from './vaccinationManagement';

export { 
  BookingManagement,
  ServiceManagement,
  TimeslotManagement,
  VaccinationManagement
};
