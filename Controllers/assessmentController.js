const catchAsync = require('../utils/catchAsync');
const Assessment = require('../models/assessment');
var AssessmentResult = require('../models/assessmentresult');


const ListAssessment = catchAsync(async (req, res) => {
  try {
    let values = req.user
    let query = {}
    if (values.userId != '' && values.id != null && values.id != undefined) {
      query.id = values.assessmentId;
    }
    const Results = await Assessment.aggregate([
      {
        $match: query
      },
      {
        $project: {
          _id: 0,
          id: 1,
          assessmentName: 1,
          status: 1,
          createdBy: 1,
          updatedBy: 1,
          question: {
            $filter: {
              input: {
                $map: {
                  input: "$question",
                  as: "que",
                  in: {
                    $cond: {
                      if: {
                        $and: [
                          { $isArray: "$$que.option" },
                          {
                            $in: [
                              "$$que.optionType",
                              [0, 1, 2],
                            ],
                          },
                          {
                            $or: [
                              {
                                $gt: [
                                  {
                                    $size: "$$que.option",
                                  },
                                  0,
                                ],
                              }, // For optionType 0 and 1, check if there are options
                              {
                                $eq: [
                                  "$$que.optionType",
                                  2,
                                ],
                              }, // For optionType 2, check if there are no options
                            ],
                          },
                        ],
                      },
                      then: {
                        id: "$$que.id",
                        questionName:
                          "$$que.questionName",
                        optionType: "$$que.optionType",
                        option: {
                          $filter: {
                            input: {
                              $map: {
                                input: "$$que.option",
                                as: "opt",
                                in: {
                                  id: "$$opt.id",
                                  name: "$$opt.name",
                                  isCorrect:
                                    "$$opt.isCorrect",
                                },
                              },
                            },
                            as: "filopt",
                            cond: {
                              $ne: ["$$filopt", ""],
                            },
                          },
                        },
                      },
                      else: "",
                    },
                  },
                },
              },
              as: "filques",
              cond: {
                $ne: ["$$filques", ""],
              },
            },
          },
          createdAt: 1,
          updatedAt: 1,
        }
      }
    ]);
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

const UpdateAssessment = catchAsync(async (req, res) => {
  try {
    const values = req.body;
    const params = req.user;
    if (params.assessmentId != '' && params.assessmentId != null && params.assessmentId != undefined && params.userId != '' && params.userId != null && params.userId != undefined) {
      const query = {
        assessmentId: params.assessmentId,
        userId: params.userId,
        status: 0
      }
      values.userId = params.userId
      values.assessmentId = params.assessmentId
      const changes = {
        $set: values
      }
      AssessmentResult.findOneAndUpdate(query, changes).lean().exec().then((UpdateStatus) => {
        res.send({
          success: true,
          code: 200,
          status: "Data Saved Success",
          timestamp: new Date()
        });
      }).catch((err) => {
        logger1.errorWithLineNumber('An error occurred:', err);
        emailError.sendErrorEmail(err.stack);
        res.send({
          code: 201,
          success: false,
          status: err.stack,
          timestamp: new Date()
        });
      })
    } else {
      res.send({
        code: 201,
        success: false,
        status: "Id required to Update Assessment.",
        timestamp: new Date()
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
});

module.exports = {
  ListAssessment,
  UpdateAssessment,
}