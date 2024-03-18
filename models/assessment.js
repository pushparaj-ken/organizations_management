var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var optionSchema = new Schema({
  id: { type: String, default: "", required: false },
  name: { type: String, default: "", required: true },
  isCorrect: { type: Boolean, default: false, required: true },
});

var questionSchema = new Schema({
  id: { type: String, default: "", required: false },
  questionName: { type: String, default: "", required: true },
  optionType: { type: Number, default: 0, required: true },
  option: [optionSchema],
});

var assessmentSchema = new Schema({
  id: { type: String, default: "", required: false },
  assessmentName: { type: String, default: "", required: true },
  question: [questionSchema],
  status: { type: Number, default: 0, required: false },
  createdBy: { type: String, default: "Admin", required: false },
  updatedBy: { type: String, default: "Admin", required: false },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

assessmentSchema.pre('save', function (next) {
  this.id = this._id;
  return next();
});



assessmentSchema.pre('findOneAndUpdate', async function (next) {
  let assessmentUpdate = this.getUpdate();
  if (assessmentUpdate.$push && assessmentUpdate.$push.question) {
    // Update each subcategory with a new ObjectId
    this.getUpdate().$push.question = assessmentUpdate.$push.question.map(question => {
      const newId = new mongoose.Types.ObjectId()
      return {
        ...question,
        _id: newId,
        id: newId // Assign a new ObjectId
      } // Assign a new ObjectId
    });
  } else if (assessmentUpdate.$push && assessmentUpdate.$push['question.$.option']) {
    const questionUpdate = assessmentUpdate.$push['question.$.option'];
    // Iterate through childcategories and update them with a new ObjectId
    this.getUpdate().$push['question.$.option'] = questionUpdate.map(option => {
      console.log(option);
      const newId = new mongoose.Types.ObjectId();
      return {
        ...option,
        _id: newId,
        id: newId
      };
    });

  }
  next();
});




module.exports = mongoose.model('assessment', assessmentSchema);