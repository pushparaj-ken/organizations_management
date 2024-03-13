const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const organizationSchema = new Schema({
  id: { type: String, required: false },
  name: { type: String, required: true },
  status: { type: Number, default: 0, required: false },
},
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  });



organizationSchema.pre('save', function (next) {
  this.id = this._id;
  return next();
});



module.exports = mongoose.model('organization', organizationSchema);