const express = require('express');
const router = express.Router({mergeParams: true}); // mergeParams - because Router has its own params, we need to add this option to be able to use params from app.js
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const catchAsync = require('../utils/catchAsync'); // function catching errors used instead of try/catch block 
const Campground = require('../models/campground');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError') // used for validating Reviews middleware
const {reviewSchema} = require('../schemas.js');

// validateReview moved to middleware

router.post('/', isLoggedIn, validateReview, catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'You successfully created a review');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req,res) => {
    const{id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;