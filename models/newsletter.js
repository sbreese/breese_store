const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const newsletterSchema = new Schema({
  email: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Newsletter', newsletterSchema);