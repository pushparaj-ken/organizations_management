
const catchAsync = require('../utils/catchAsync');
const Users = require('../models/userModel')
const Jobs = require('../models/jobdetails')
const AssessmentResult = require('../models/assessmentresult')
const Services = require('../services/excel')

const Register = catchAsync(async (req, res, next) => {
  try {
    let values = req.body;
    if (values.username != '' && values.username != null && values.username != undefined) {
      let UsersDetails = await Users.findOne({ status: 0, $or: [{ username: values.username }] })
      if (UsersDetails != null) {
        const errcode = new Error('Email Or Mobile are Already Exists!.');
        errcode.statusCode = 201;
        return next(errcode);
      } else {
        let Data = {
          username: values.username,
          password: values.password,
          organization: values.organization,
          role: values.role,
        }
        Users(Data).save().then((Result) => {
          const errcode = new Error('Data Saved Success.');
          errcode.statusCode = 200;
          errcode.success = true;
          return next(errcode);
        }).catch((err) => {
          const errcode = new Error(err.stack);
          errcode.statusCode = 201;
          errcode.success = false;
          return next(errcode);

        })
      }
    } else {
      const errcode = new Error("All Fields are Mandatory");
      errcode.statusCode = 201;
      errcode.success = false;
      return next(errcode);
    }
  } catch (err) {
    const errcode = new Error(err.stack);
    errcode.statusCode = 201;
    errcode.success = false;
    return next(errcode);
  }
});

const Login = catchAsync(async (req, res, next) => {
  try {
    const values = req.body;
    console.log("TCL: Login -> values", values)
    if (values.email != '' && values.email != null && values.email != undefined && values.password != '' && values.password != null && values.password != undefined) {
      const query = {};
      query.email = values.email;
      const UsersDetails = await Jobs.findOne(query)
      // console.log("TCL: Login -> UsersDetails", UsersDetails)
      if (UsersDetails != null) {
        const isPasswordMatched = await UsersDetails.comparePassword(values.password);
        if (!isPasswordMatched) {
          const errcode = new Error('Password mismatch.');
          errcode.statusCode = 201;
          return next(errcode);
        } else {
          const Assessments = await AssessmentResult.findOne({ userId: UsersDetails.id, status: 0 })
          if (Assessments != null) {
            let TokenRecord = { assessmentId: Assessments.id }
            let Response = {
              userId: UsersDetails.id,
              email: UsersDetails.email,
              assessmentId: Assessments.id,
            }
            const token = await UsersDetails.getJWTToken(TokenRecord);
            res.send({
              success: true,
              code: 200,
              Data: Response,
              Token: token,
              status: "Data Saved Success",
            });

          } else {
            const errcode = new Error('Assesment not Assigned.');
            errcode.statusCode = 201;
            return next(errcode);
          }
        }
      } else {
        const errcode = new Error('Email or Password mismatch.');
        errcode.statusCode = 201;
        return next(errcode);
      }
    } else {
      const errcode = new Error("All Fields are Mandatory");
      errcode.statusCode = 201;
      return next(errcode);
    }
  } catch (err) {
    const errcode = new Error(err.stack);
    errcode.statusCode = 201;
    return next(errcode);
  }
});

const UpdateUsers = catchAsync(async (req, res, next) => {
  try {
    const values = req.body;
    const params = req.params;
    if (params.id != '' && params.id != null && params.id != undefined) {
      const query = {
        id: params.id
      }
      const changes = {
        $set: values
      }
      Users.findOneAndUpdate(query, changes).lean().exec().then((UpdateStatus) => {
        const errcode = new Error('Data Saved Success.');
        errcode.statusCode = 200;
        return next(errcode);
      }).catch((err) => {
        const errcode = new Error(err.stack);
        errcode.statusCode = 201;
        return next(errcode);
      })
    } else {
      const errcode = new Error('Id required to Update Users.');
      errcode.statusCode = 201;
      return next(errcode);
    }
  } catch (err) {
    const errcode = new Error(err.stack);
    errcode.statusCode = 201;
    return next(errcode);
  }
});

const DeleteUsers = catchAsync(async (req, res, next) => {
  try {
    const params = req.params;
    const values = req.body
    if (params.id != '' && params.id != null && params.id != undefined) {
      const query = {
        id: params.id
      }
      const changes = {
        $set: values
      }
      Users.findOneAndUpdate(query, changes).lean().exec().then((UpdateStatus) => {
        const errcode = new Error('Data Saved Success.');
        errcode.statusCode = 200;
        return next(errcode);
      }).catch((err) => {
        const errcode = new Error(err.stack);
        errcode.statusCode = 201;
        return next(errcode);
      })
    } else {
      const errcode = new Error('Id required to Delete User.');
      errcode.statusCode = 201;
      return next(errcode);
    }
  } catch (err) {
    const errcode = new Error(err.stack);
    errcode.statusCode = 201;
    return next(errcode);
  }
});

const ListAllUsers = catchAsync(async (req, res, next) => {
  try {
    let values = req.query
    let query = {}
    if (values.id != '' && values.id != null && values.id != undefined) {
      query.id = values.id
    }
    if (values.name != '' && values.name != null && values.name != undefined) {
      query.name = { $regex: values.name, $options: "i" }
    }
    if (values.status != '' && values.status != null && values.status != undefined) {
      query.status = parseInt(values.status)
    }
    if (values.mobile != '' && values.mobile != null && values.mobile != undefined) {
      query.mobile = parseInt(values.mobile)
    }
    const totalpage = await Users.countDocuments(query)
    const pipeline = [];
    let skip = 0;
    let page1 = values.page - 1;
    if (values.hasOwnProperty("page") && values.page !== '' && values.page !== undefined && values.page !== null) {
      if (page1 > 0) {
        skip = skip + (parseInt(values.limit) * page1);
        const skipstage = {
          $skip: skip
        }
        pipeline.push(skipstage)
      }
    }
    if (values.limit !== undefined && values.limit !== null) {
      const limit = {
        $limit: parseInt(values.limit)
      }
      pipeline.push(limit)
    }

    pipeline.unshift(
      {
        $match: query
      },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "RolesDetails"
        }
      },
      {
        $lookup: {
          from: "organizations",
          localField: "organization",
          foreignField: "_id",
          as: "organizationsDetails"
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
          userName: 1,
          role: 1,
          organization: 1,
          RoleName: {
            $arrayElemAt: ["$RolesDetails.name", 0],
          },
          organizationsName: {
            $arrayElemAt: ["$organizationsDetails.name", 0],
          },
          status: 1,
          Status: {
            $cond: {
              if: { $eq: ["$status", 0] },
              then: "Active",
              else: "In Active",
            },
          },
          CreatedAt: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M:%S",
              date: {
                $toDate: {
                  $dateToString: {
                    format: "%Y-%m-%dT%H:%M:%S.%LZ",
                    date: "$createdAt",
                    timezone: "Asia/Kolkata", // Set the desired timezone (India Standard Time)
                  },
                },
              }, // Convert string to date using $toDate
            },
          },
          UpdatedAt: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M:%S",
              date: {
                $toDate: {
                  $dateToString: {
                    format: "%Y-%m-%dT%H:%M:%S.%LZ",
                    date: "$updatedAt",
                    timezone: "Asia/Kolkata", // Set the desired timezone (India Standard Time)
                  },
                },
              }, // Convert string to date using $toDate
            },
          },
        }
      },
    );
    const Results = await Users.aggregate(pipeline);
    if (Results.length > 0) {
      const Records = Results.map(({ id, role, organization, status, ...rest }) => rest);
      let filePath = await Services.ExportCommonExcel(Records, "AdminUsers_list");
      var fullPublicUrl = process.env.fullPublicUrl;
      let downloadurl = `${fullPublicUrl}${filePath}`
      res.send({
        success: true,
        code: 200,
        status: "Users Lists retrieved successfully",
        downloadurl: downloadurl,
        totalpage: totalpage,
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
    const errcode = new Error(err.stack);
    errcode.statusCode = 201;
    return next(errcode);
  }
});


module.exports = {
  Register,
  Login,
  UpdateUsers,
  DeleteUsers,
  ListAllUsers,
}