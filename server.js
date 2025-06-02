const { Server } = require("socket.io");
const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const http = require("http");
const errorHandler = require("./src/middlewares/errorHandler");
const connectToDB = require("./src/config/dbConnection");
const authRoute = require("./src/route_controller/Auth/AuthRoute");
const SearchHotelRoute = require("./src/route_controller/Search_Hotel/SearchHotelRoute");
const HotelRouter = require("./src/route_controller/Hotel/HotelRoute");
const FeedbackRouter = require("./src/route_controller/Feedback/FeedbackRoute");
const RoomRouter = require("./src/route_controller/Room/RoomRouter");
const PaymentRouter = require("./src/route_controller/Payment/PaymentRoute");
const ReportedFeedbackRoute = require("./src/route_controller/ReportedFeedback/ReportedFeedbackRoute");
const HotelServiceRoute = require("./src/route_controller/Hotelservices/HotelservicesRoute");
// const cron = require("node-cron");
const ChatRoutes = require("./src/route_controller/ChatMessage/ChatMessageRoute");
require("./src/route_controller/Reservations/ReservationsController");
const ReservationRouter = require("./src/route_controller/Reservations/ReservationsRouter");
const RefundingReservationRouter = require("./src/route_controller/RefundingReservation/RefundingReservationRoute");
const socketHandler = require("./src/route_controller/Socket/socketHandler");
const MonthlyPaymentRoute = require("./src/route_controller/MonthlyPayment/MonthlyPaymentRoute");
const morgan = require("morgan");

const port = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

//from cors
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        process.env.FRONTEND_CUSTOMER_URL_PRODUCT,
        process.env.FRONTEND_OWNER_URL_PRODUCT,
      ]
    : [
        process.env.FRONTEND_CUSTOMER_URL_DEVELOPMENT,
        process.env.FRONTEND_OWNER_URL_DEVELOPMENT,
      ];

// CORS middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Kết nối DB
connectToDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev")); // Log HTTP requests to the console

// Routes
app.use("/api/auth", authRoute);
// app.use("/api/customer", customerRoute);

app.use("/api/search", SearchHotelRoute);

app.use("/api/hotel", HotelRouter);
app.use("/api/room", RoomRouter);

app.use("/api/feedback", FeedbackRouter);
app.use("/api/reservations", ReservationRouter);

app.use("/api/payment", PaymentRouter);
app.use("/api/reportFeedback", ReportedFeedbackRoute);

app.use("/api/refunding_reservation", RefundingReservationRouter);
app.use("/api/hotelservices", HotelServiceRoute);

app.use("/api/chat", ChatRoutes);
app.use("/api/monthly-payment", MonthlyPaymentRoute);

const users = new Map(); // lưu trữ userId -> socketId

//socket.io
io.on("connection", (socket) => {
  socketHandler(io, socket, users);
});

//from errorHandle
app.use(errorHandler);

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
