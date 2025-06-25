const HotelService = require("../../models/hotelService");
const Hotel = require("../../models/hotel");




const mongoose = require("mongoose"); 

exports.updateHotelService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    console.log("Service ID:", serviceId);
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const updatedService = await HotelService.findByIdAndUpdate(
      serviceId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ để cập nhật" });
    }

    res.status(200).json({
      message: "Cập nhật thành công",
      data: updatedService,
    });
  } catch (error) {
    res.status(500).json({ message: "Cập nhật thất bại", error: error.message });
  }
};


