// Import the Mongoose library
import mongoose from 'mongoose';

// Define a schema for the Business model
const AnnouncementSchema = new mongoose.Schema({
  
   // Reference to the User model - Ensures each Announcement is linked to a user
   userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true // This field is required to associate the Announcement with a user
  },

  // Announcement Name - Required, must be a string, and trimmed to remove extra spaces
  businessId: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 50 
  },
  title: { 
    type: String, 
    required: true,
    trim: true, // To remove space if it is at the beginning or end of the string  
    maxlength: 50 
  },
  // Content - Main announcement content
  content: { 
    type: String, 
    required: true,
    trim: true, // To remove space if it is at the beginning or end of the string  
    maxlength: 150
  },
// Active - Indicates if the announcement is currently active or not
  active: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Prevent model overwrite during testing
const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

export default Announcement;


