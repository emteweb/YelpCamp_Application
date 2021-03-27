const express = require('express');
const router = express.Router(); // mergeParams not necessary cause we have the "ids" defined in the routes below (unlike review.js)
const catchAsync = require('../utils/catchAsync'); // function catching errors used instead of try/catch block 
const campgrounds = require('../controllers/campgrounds')
const Campground = require('../models/campground');
//const {campgroundSchema} = require('../schemas.js');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

// middleware functions (validation) moved to a separate file
// we remove '/campgrounds' in the routes path (the beginning of the routes already defined in app.js - app.use())

// listing all camps
router.get('/', catchAsync(campgrounds.index));

// adding a new campground(form route)

// authentication moved to middleware
    /* if(!req.isAuthenticated()){
        req.flash('error', 'Please sign in first!');
        return res.redirect('/login');
    } */
router.get('/new', isLoggedIn, campgrounds.renderNewForm); // logic moved to controllers

// adding a new campground (POST request)
router.post('/',isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

router.get('/:id', catchAsync(campgrounds.showCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground successfully deleted!');
    res.redirect('/campgrounds/');
}))

module.exports = router;