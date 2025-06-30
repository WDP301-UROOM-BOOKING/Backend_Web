const express = require("express");
const FeedbackRouter = express.Router();
const FeedbackController = require('./FeedbackController');
const checkCustomer = require('../../middlewares/checkCustomer');
const { isAdmin } = require("../../middlewares/checkAdmin");


FeedbackRouter.get('/get-feedback-hotel/:hotelId', FeedbackController.getAllFeedBackByHotelId)
FeedbackRouter.post("/like/:id",checkCustomer, FeedbackController.likeFeedback);
FeedbackRouter.post("/dislike/:id",checkCustomer, FeedbackController.dislikeFeedback);

FeedbackRouter.get("/my-feedbacks", checkCustomer, FeedbackController.getFeedbackByUserId);
FeedbackRouter.put('/update-feedback/:feedbackId', checkCustomer, FeedbackController.updateFeedback);
FeedbackRouter.delete('/delete-feedback/:feedbackId', checkCustomer, FeedbackController.deleteFeedback);
// tạo mới feedback
FeedbackRouter.post("/create-feedback", checkCustomer, FeedbackController.createFeedback);
FeedbackRouter.get("/getFeedbackById/:feedbackId",  FeedbackController.getFeedbackById);
FeedbackRouter.put("/updateStatusFeedback/:feedbackId",isAdmin, FeedbackController.updateFeedbackStatus);
module.exports = FeedbackRouter;

