const express = require('express');
const router = express.Router(); // mergeParams not necessary cause we have the "ids" defined in the routes below (unlike review.js)
const catchAsync = require('../utils/catchAsync'); // function catching errors used instead of try/catch block 
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema} = require('../schemas.js');
const {isLoggedIn} = require('../middleware');

//middleware function used to validate campgrounds
const validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
    //console.log(result);
}

// we remove '/campgrounds' in the routes path (the beginning of the routes already defined in app.js - app.use())

// listing all camps
router.get('/', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})
// adding a new campground(form route)
router.get('/new', isLoggedIn, (req, res) => {
    // this part is moved to middleware
    /* if(!req.isAuthenticated()){
        req.flash('error', 'Please sign in first!');
        return res.redirect('/login');
    } */
    res.render('campgrounds/new');
})
// adding a new campground (POST request)
router.post('/',isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
        // if(!req.body.campground) throw new ExpressError ('Invalid Campgound Data'); // instead we gonna use 'Joi'
        const campground = new Campground(req.body.campground);
        await campground.save();
        req.flash('success', 'Successfully made a new campground!');
        res.redirect(`/campgrounds/${campground._id}`);

}))

router.get('/:id', catchAsync(async (req, res) => {
    //const {id} = req.params;
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params.id;
    //const campground = await Campground.find({id});
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    return res.render('campgrounds/edit', { campground })
}))

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); // (Ep. 411)
        req.flash('success', 'Successfully updated the campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (e) {
        next(e);
    }
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground successfully deleted!');
    res.redirect('/campgrounds/');
}))

module.exports = router;