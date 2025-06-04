import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'react-bootstrap';
import { Dropdown } from 'primereact/dropdown';

const BookingTimeslotDialog = ({
  showChangeTimeslotDialog,
  setShowChangeTimeslotDialog,
  availableTimeslots,
  selectedTimeslot,
  setSelectedTimeslot,
  handleChangeTimeslot
}) => {
  const timeslotOptions = availableTimeslots.map(slot => ({
    label: `${slot.time}:00`,
    value: slot._id
  }));

  return (
    <Dialog
      header="Chuyển đổi khung giờ"
      visible={showChangeTimeslotDialog}
      style={{ width: '30vw' }}
      onHide={() => setShowChangeTimeslotDialog(false)}
      footer={
        <div>
          <Button
            variant="secondary"
            onClick={() => setShowChangeTimeslotDialog(false)}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            className="ms-2"
            onClick={handleChangeTimeslot}
            disabled={!selectedTimeslot}
          >
            Xác nhận
          </Button>
        </div>
      }
    >
      <div className="p-3">
        <div className="mb-3">
          <label className="form-label">Chọn khung giờ mới</label>
          <Dropdown
            value={selectedTimeslot}
            options={timeslotOptions}
            onChange={(e) => setSelectedTimeslot(e.value)}
            placeholder="Chọn khung giờ"
            className="w-100"
          />
        </div>
        {availableTimeslots.length === 0 && (
          <div className="alert alert-warning">
            Không có khung giờ trống cho ngày này
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default BookingTimeslotDialog; 