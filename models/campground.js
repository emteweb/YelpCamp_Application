const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200,h_200');
})

const campgroundSchema = new Schema({
    title: String,
    /* images: [{
        url: String,
        filename: String
    }], */
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry:{
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId, // reference to Review Model using ObjectId (one to many relationship)
            ref: 'Review'
        }
    ]
})

// using mongoose midleware to remove reviews
campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

// compiling and exporting campgroundSchema
module.exports = mongoose.model('Campground', campgroundSchema);