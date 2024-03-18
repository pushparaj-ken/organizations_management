const catchAsync = require('../utils/catchAsync');
const Assessment = require('../models/assessment')


const ListAssessment = catchAsync(async (req, res) => {
  try {
    let values = req.user
    let query = {}
    if (values.userId != '' && values.id != null && values.id != undefined) {
      query.id = values.assessmentId;
    }
    const Results = await Assessment.find(query, { _id: 0, "question._id": 0, "question.option._id": 0 }).sort({ createdBy: -1 }).lean().exec();
    if (Results.length > 0) {
      res.send({
        success: true,
        code: 200,
        status: "Data retrieved successfully",
        Data: Results,
        "timestamp": new Date()
      });
    } else {
      res.send({
        success: false,
        code: 201,
        status: "No Records Found!",
        totalpage: 0,
        Data: [],
        "timestamp": new Date()
      });
    }

  } catch (err) {
    logger1.errorWithLineNumber('An error occurred:', err);
    emailError.sendErrorEmail(err.stack);
    console.error('Database Error');
    console.error(err);
    res.send({
      success: false,
      code: 201,
      status: err.stack,
      Data: {},
      "timestamp": new Date()
    });
  }
})


module.exports = {
  ListAssessment
}