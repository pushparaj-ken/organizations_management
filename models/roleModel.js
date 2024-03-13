var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roleSchema = new Schema({
  id: { type: String, default: "", required: false },
  name: { type: String, default: "", required: true },
  status: { type: Number, default: 0, required: false },
},
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
)

roleSchema.pre('save', function (next) {
  this.id = this._id;
  return next();
});



module.exports = mongoose.model('role', roleSchema);