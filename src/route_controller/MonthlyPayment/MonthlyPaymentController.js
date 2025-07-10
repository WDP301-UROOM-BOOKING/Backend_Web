const MonthlyPayment = require('../../models/monthlyPayment');

exports.getPayments = async (req, res) => {
    try {
        const user = req.user;
        console.log("catched me: ", JSON.stringify(user));
        const { year } = req.query;
        const hotelId = user.ownedHotels[0];
        const filter = { hotel: hotelId };
        if (year) filter.year = parseInt(year);

        const payments = await MonthlyPayment.find(filter)
            .populate('hotel', 'hotelName')
            .sort({ month: 1 });

        res.status(200).json({
            success: true,
            data: payments,
        });
    } catch (err) {
        console.error('Error fetching payments:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// API cho admin lấy tất cả monthly payments
exports.getAllPaymentsForAdmin = async (req, res) => {
    try {
        const { month, year, status } = req.query;
        console.log('Admin getAllPaymentsForAdmin called with query:', { month, year, status });
        
        const filter = {};
        
        if (month !== undefined && month !== '') {
            filter.month = parseInt(month);
        }
        if (year !== undefined && year !== '') {
            filter.year = parseInt(year);
        }
        if (status && status !== '') {
            filter.status = status;
        }

        console.log('Final filter:', filter);

        // Kiểm tra xem có dữ liệu không trước khi query
        const totalCount = await MonthlyPayment.countDocuments(filter);
        console.log('Total matching records:', totalCount);

        const payments = await MonthlyPayment.find(filter)
            .populate({
                path: 'hotel',
                select: 'hotelName address phoneNumber email',
                model: 'Hotel'
            })
            .sort({ createdAt: -1 });

        console.log('Found payments:', payments.length);

        // Log một vài payments để debug
        if (payments.length > 0) {
            console.log('First payment sample:', {
                id: payments[0]._id,
                hotel: payments[0].hotel,
                amount: payments[0].amount,
                month: payments[0].month,
                year: payments[0].year,
                status: payments[0].status
            });
        }

        res.status(200).json({
            success: true,
            data: payments,
            total: totalCount
        });
    } catch (err) {
        console.error('Error fetching all payments for admin:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
};

// API cho admin cập nhật trạng thái thanh toán
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status } = req.body;

        console.log('Updating payment status:', { paymentId, status });

        if (!['PENDING', 'PAID'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be PENDING or PAID',
            });
        }

        const updateData = { status };
        if (status === 'PAID') {
            updateData.paymentDate = new Date();
        }

        const payment = await MonthlyPayment.findByIdAndUpdate(
            paymentId,
            updateData,
            { new: true }
        ).populate('hotel', 'hotelName');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        console.log('Payment updated successfully:', payment._id);

        res.status(200).json({
            success: true,
            data: payment,
            message: 'Payment status updated successfully',
        });
    } catch (err) {
        console.error('Error updating payment status:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// API lấy chi tiết payment theo ID
exports.getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;
        console.log('Getting payment by ID:', paymentId);

        const payment = await MonthlyPayment.findById(paymentId)
            .populate('hotel', 'hotelName address phoneNumber email');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        console.log('Payment found:', payment._id);

        res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (err) {
        console.error('Error fetching payment by ID:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};