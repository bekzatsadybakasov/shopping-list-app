const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  uuIdentity: { type: String, required: true },
  isOwner: { type: Boolean, default: false }
}, { _id: false });

const itemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  measure: { type: String, required: true },
  resolved: { type: Boolean, default: false }
}, { _id: false });

const shoppingListSchema = new mongoose.Schema({
  awid: { type: String, required: true },
  name: { type: String, required: true, minlength: 1, maxlength: 100 },
  state: { type: String, enum: ['active', 'archived'], default: 'active' },
  ownerUuIdentity: { type: String, required: true },
  members: [memberSchema],
  items: [itemSchema],
  progress: {
    completed: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  updated: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual для memberCount
shoppingListSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Метод для обновления прогресса
shoppingListSchema.methods.updateProgress = function() {
  this.progress.total = this.items.length;
  this.progress.completed = this.items.filter(item => item.resolved).length;
  this.updated = new Date();
};

module.exports = mongoose.model('ShoppingList', shoppingListSchema);

