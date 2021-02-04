const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const methodOverride = require('method-override'); // to be able to send other types of requests than GET/POST from the form
const catchAsync = require('./utils/catchAsync'); // function catching errors used instead of try/catch block 
const ExpressError = require('./utils/ExpressError')
//const Joi = require('joi'); // a package used for validating data (not required when we import the Schema from another file - here: schemas.js)
const {campgroundSchema} = require('./schemas.js');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelpcampDb', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Successfully connected to the database')
    })
    .catch(err => {
        console.log('Database connection failed');
        console.log(err)
    })
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

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

app.get('/', (req, res) => {
    res.render('home');
})
// listing all camps
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})
// adding a new campground(form route)
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
// adding a new campground (POST request)
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
        // if(!req.body.campground) throw new ExpressError ('Invalid Campgound Data'); // instead we gonna use 'Joi'
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);

}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    //const {id} = req.params;
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground })
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params.id;
    //const campground = await Campground.find({id});
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); // (Ep. 411)
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (e) {
        next(e);
    }
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds/');
}))

app.all('*', (req,res,next) => {
    //res.send('404!');
    next(new ExpressError('Page Not Found', 404))
})
//error handler
app.use((err, req, res, next) => {
    //-1- res.send('Something WENT WRONG :O');
    //-2- const {statusCode = 500, message = 'Something went wrong'} = err;
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong';
    //-2- res.status(statusCode).send(message);
    //-2- res.status(statusCode).render('error');
    res.status(statusCode).render('error', {err});
})

app.listen(3000, () => {
    console.log('Server started on port 3000!')
})