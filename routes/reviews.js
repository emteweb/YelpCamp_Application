const express = require('express');
const router = express.Router({mergeParams: true}); // mergeParams - because Router has its own params, we need to add this option to be able to use params from app.js
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const catchAsync = require('../utils/catchAsync'); // function catching errors used instead of try/catch block 
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const ExpressError = require('../utils/ExpressError') // used for validating Reviews middleware
const {reviewSchema} = require('../schemas.js');

// validateReview moved to middleware

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;