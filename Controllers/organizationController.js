const catchAsync = require('../utils/catchAsync');
const Organization = require('../models/organizationModel')
const Services = require('../services/excel')

const AddOrganization = catchAsync(async (req, res, next) => {
  try {
    const values = req.body;
    if (values.name != '' && values.name != null && values.name != undefined) {
      const OrganizationDetails = await Organization.findOne({ status: 0, name: values.name })
      if (OrganizationDetails != null) {
        const errcode = new Error('Organization Already Exists!.');
        errcode.statusCode = 201;
        return next(errcode);
      } else {
        const Data = {
          name: values.name,
        }
        Organization(Data).save().then((Result) => {
          const errcode = new Error('Data Saved Success.');
          errcode.statusCode = 200;
          return next(errcode);
        }).catch((err) => {
          const errcode = new Error(err.stack);
          errcode.statusCode = 201;
          return next(errcode);
        })
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


const UpdateOrganization = catchAsync(async (req, res, next) => {
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
      Organization.findOneAndUpdate(query, changes).lean().exec().then((UpdateStatus) => {
        const errcode = new Error('Data Saved Success.');
        errcode.statusCode = 200;
        return next(errcode);
      }).catch((err) => {
        const errcode = new Error(err.stack);
        errcode.statusCode = 201;
        return next(errcode);
      })
    } else {
      const errcode = new Error("Id required to Update Organization.");
      errcode.statusCode = 201;
      return next(errcode);
    }
  } catch (err) {
    const errcode = new Error(err.stack);
    errcode.statusCode = 201;
    return next(errcode);
  }
});

const DeleteOrganization = catchAsync(async (req, res, next) => {
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
      Organization.findOneAndUpdate(query, changes).lean().exec().then((UpdateStatus) => {
        const errcode = new Error('Data Saved Success.');
        errcode.statusCode = 200;
        return next(errcode);
      }).catch((err) => {
        const errcode = new Error(err.stack);
        errcode.statusCode = 201;
        return next(errcode);
      })
    } else {
      const errcode = new Error("Id required to Update Organization.");
      errcode.statusCode = 201;
      return next(errcode);
    }
  } catch (err) {
    const errcode = new Error(err.stack);
    errcode.statusCode = 201;
    return next(errcode);
  }
});

const ListOrganization = catchAsync(async (req, res, next) => {
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
    const totalpage = await Organization.countDocuments(query)
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
        $project: {
          id: 1,
          Name: 1,
          status: 1,
          Status: {
            $cond: {
              if: { $eq: ["$status", 0] },
              then: "Active",
              else: "In Active"
            }
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
          _id: 0,
        }
      },
    );
    const Results = await Organization.aggregate(pipeline);
    if (Results.length > 0) {
      const Records = Results.map(({ id, status, ...rest }) => rest);
      let filePath = await Services.ExportCommonExcel(Records, "Organization_list");
      var fullPublicUrl = process.env.fullPublicUrl;
      let downloadurl = `${fullPublicUrl}${filePath}`
      res.send({
        success: true,
        code: 200,
        status: "Organization Lists retrieved successfully",
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
  AddOrganization,
  UpdateOrganization,
  DeleteOrganization,
  ListOrganization,
}