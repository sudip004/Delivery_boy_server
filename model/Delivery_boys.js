const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
        
    },
    longitude: {
      type: Number,
      
    }
  },
  { _id: false } 
);

const DeliveryBoySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
        trim: true,
    },
    password:{
        type:String,
        required:true
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    vehicleNumber: {
      type: String,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    currentLocation: {
      type: LocationSchema,
      default:{}
    },
    orders: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true, 
    minimize: false
  }
);

// Indexes for fast lookups
DeliveryBoySchema.index({ isActive: 1 });

const deliveryModel = mongoose.model(
  "DeliveryBoy",
  DeliveryBoySchema,
  "delivery_boys" 
);

module.exports={deliveryModel}






