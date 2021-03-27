const express = require('express');
const router = express.Router(); // mergeParams not necessary cause we have the "ids" defined in the routes below (unlike review.js)
const catchAsync = require('../utils/catchAsync'); // function catching errors used instead of try/catch block 
const Campground = require('../models/campground');
//const {campgroundSchema} = require('../schemas.js');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

// middleware functions (validation) moved to a separate file
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
        campground.author = req.user._id;
        await campground.save();
        req.flash('success', 'Successfully made a new campground!');
        res.redirect(`/campgrounds/${campground._id}`);

}))

router.get('/:id', catchAsync(async (req, res) => {
    //const {id} = req.params;
    const campground = await Campground.findById(req.params.id).populate(
        //populate all the reviews of a found campground with an author
        {path: 'reviews',
        populate: {
            path: 'author'
        }
        })
        //and then populate the found campground with an author
        .populate('author');
    console.log(campground);
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    //const campground = await Campground.find({id});
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    return res.render('campgrounds/edit', { campground })
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res, next) => {
    try {
        const { id } = req.params;
        // logic checking if the logged user_id is equal to author_id to submit changes - moved to middleware (isAuthor)
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
        //const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); // (Ep. 411) // we change this line to find a campground first, 
                                                                                                              //then check if the user is the author and then update
        req.flash('success', 'Successfully updated the campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (e) {
        next(e);
    }
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground successfully deleted!');
    res.redirect('/campgrounds/');
}))

module.exports = router;