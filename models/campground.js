const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
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
campgroundSchema.post('findOneAndDelete', async function(doc) {
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