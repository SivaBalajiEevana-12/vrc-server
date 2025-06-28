const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true, // Optional: remove if not mandatory
  },
  location: {
    type: String,
    required: true, // Optional: remove if not mandatory
    trim: true,
  },
});

// Virtuals for reverse population (optional)
projectSchema.virtual('volunteers', {
  ref: 'ProjectVolunteer',
  localField: '_id',
  foreignField: 'project',
});

projectSchema.virtual('managers', {
  ref: 'ProjectManager',
  localField: '_id',
  foreignField: 'project',
});

projectSchema.set('toObject', { virtuals: true });
projectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
