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
            .populate('hotel', 'name')
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