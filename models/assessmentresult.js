var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ResultSchema = new Schema({
  id: { type: String, default: "", required: false },
  questionId: { type: String, default: "", required: true },
  answerId: { type: String, default: "", required: true },
  isCorrect: { type: Boolean, default: false, required: true },
});

var assessmentResultSchema = new Schema({
  id: { type: String, default: "", required: false },
  assessmentId: { type: String, default: "", required: true },
  userId: { type: String, default: "", required: true },
  result: [ResultSchema],
  status: { type: Number, default: 0, required: false },
  createdBy: { type: String, default: "Admin", required: false },
  updatedBy: { type: String, default: "Admin", required: false },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

assessmentResultSchema.pre('save', function (next) {
  this.id = this._id;
  return next();
});



module.exports = mongoose.model('assessmentresult', assessmentResultSchema);