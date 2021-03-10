const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash'); // pop-ups related to session data
const Campground = require('./models/campground');
const Review = require('./models/review');
const methodOverride = require('method-override'); // to be able to send other types of requests than GET/POST from the form
//const catchAsync = require('./utils/catchAsync'); // function catching errors used instead of try/catch block 
const ExpressError = require('./utils/ExpressError') // used for validating Reviews middleware
//const Joi = require('joi'); // a package used for validating data (not required when we import the Schema from another file - here: schemas.js)
const {campgroundSchema, reviewSchema} = require('./schemas.js');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); // to tell express to serve PUBLIC Dierectory

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());

// middleware to show flash messages; on every single request we gonna have access to whatever is in flash

app.use((req,res,next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

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

const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


// to use routes from another file (all routes beginning with /campgrounds)
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
    res.render('home');
})

// campground routes moved to 'routes' folder

// review routes moved to 'routes' folder

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