const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const marketingCategorySchema = new Schema({
  code: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  displayOrder: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('MarketingCategory', marketingCategorySchema, 'marketingCategories');
