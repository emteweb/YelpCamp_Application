const express = require('express');
const router = express.Router(); // mergeParams not necessary cause we have the "ids" defined in the routes below (unlike review.js)
const catchAsync = require('../utils/catchAsync'); // function catching errors used instead of try/catch block 
const campgrounds = require('../controllers/campgrounds')
const Campground = require('../models/campground');
//const {campgroundSchema} = require('../schemas.js');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const multer  = require('multer') // for parsing images to objects
const {storage} = require('../cloudinary');
//const upload = multer({ dest: 'uploads/' }); // if we want to keep imgs locally
const upload = multer({ storage});

// middleware functions (validation) moved to a separate file
// we remove '/campgrounds' in the routes path (the beginning of the routes already defined in app.js - app.use())
// authentication moved to middleware
    /* if(!req.isAuthenticated()){
        req.flash('error', 'Please sign in first!');
        return res.redirect('/login');
    } */

router.route('/')
    .get(catchAsync(campgrounds.index)) // listing all camps
    .post(isLoggedIn,upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)); // adding a new campground(form route)

router.get('/new', isLoggedIn, campgrounds.renderNewForm); // logic moved to controllers

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;