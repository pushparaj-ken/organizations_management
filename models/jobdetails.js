var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

var JobApplydetailsSchema = new Schema({
  id: { type: String, default: "", required: false },
  fullName: { type: String, default: "", required: false },
  Address: { type: String, default: "", required: false },
  city: { type: Number, default: 0, required: false },
  state: { type: Number, default: 0, required: false },
  pincode: { type: Number, default: 0, required: false },
  phoneNumber: { type: Number, default: 0, required: false },
  password: { type: String, default: "", required: false },
  DOB: { type: Date, default: new Date(), required: false },
  email: { type: String, default: "", required: false },
  linkedInAddress: { type: String, default: "", required: false },
  positionTitle: { type: String, default: "", required: false },
  department: { type: String, default: "", required: false },
  currentNoticePeriod: { type: Number, default: 0, required: false },
  dateAvailableToJoin: { type: Date, default: new Date(), required: false },
  currentSalary: { type: Number, default: 0, required: false },
  expectedSalary: { type: Number, default: 0, required: false },
  totalYearExperience: { type: Number, default: 0, required: false },
  education: [
    {
      name: { type: String, default: "", required: false },
      location: { type: String, default: "", required: false },
      passOutYear: { type: Number, default: 0, required: false },
      Grade: { type: String, default: "", required: false },
      degreeObtained: { type: String, default: "", required: false },
      fieldOfStudy: { type: String, default: "", required: false },
    }
  ],
  technicalSkills: { type: Array, default: [], required: false },
  languagesKnow: [
    {
      name: { type: String, default: "", required: false },
      read: { type: Boolean, default: false, required: false },
      write: { type: Boolean, default: false, required: false },
      speak: { type: Boolean, default: false, required: false },
    }
  ],
  employmentHistory: [
    {
      companyName: { type: String, default: "", required: false },
      jobTitle: { type: String, default: "", required: false },
      startDate: { type: Date, default: new Date(), required: false },
      endDate: { type: Date, default: new Date(), required: false },
      responsibilities: { type: String, default: "", required: false },
      reasonForLeaving: { type: String, default: "", required: false },
    }
  ],
  references: [
    {
      name: { type: String, default: "", required: false },
      relationship: { type: String, default: "", required: false },
      company: { type: String, default: "", required: false },
      phoneNumber: { type: Number, default: 0, required: false },
    }
  ],
  isJobOpening: { type: String, default: "", required: false },
  currentEmployer: { type: String, default: "", required: false },
  Resume: { type: String, default: "", required: false },
  coverLetter: { type: String, default: "", required: false },
  status: { type: Number, default: 0, required: true }, //0 active 1 inactive
},
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
)

JobApplydetailsSchema.pre('save', function (next) {
  this.id = this._id;
  return next();
});

JobApplydetailsSchema.methods.getJWTToken = function () {
  const expiresInMinutes = process.env.JWT_EXPIRE;
  const expirationTimeInSeconds = expiresInMinutes * 60;

  //const expirationTimestamp = Math.floor(Date.now() / 1000) + expirationTimeInSeconds;
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: expirationTimeInSeconds,
  });
};

JobApplydetailsSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('jobapplydetails', JobApplydetailsSchema);