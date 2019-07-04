const mongoose = require('mongoose');

const restaurantsSchema = new mongoose.Schema({
    name: String,
    neighborhood: String,
    address: String,
    cuisine_type: String,
    operating_hours: {
      Monday: String,
      Tuesday: String,
      Wednesday: String,
      Thursday: String,
      Friday: String,
      Saturday: String,
      Sunday: String
    },
    photos: {
          photoJPG: String,
          photoJPG_400: String,
          photoWebp: String,
          photoWebp_400: String,
          alt: String 
    },
    reviews: [
        {
            name: String,
            date: String,
            comments: String,
            rating: Number
        }
    ]
});
module.exports = mongoose.model('restaurant', restaurantsSchema);