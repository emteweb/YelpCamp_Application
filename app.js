const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const methodOverride = require('method-override'); // to be able to send other types of requests than GET/POST from the form

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelpcampDb', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true})
.then(()=>{
    console.log('Successfully connected to the database')
})
.catch(err=>{
    console.log('Database connection failed');
    console.log(err)
})

const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

app.get('/', (req,res) => {
    res.render('home');
})
// listing all camps
app.get('/campgrounds', async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
})
// adding a new campground(form route)
app.get('/campgrounds/new', (req,res) => {
    res.render('campgrounds/new');
})
// adding a new campground (POST request)
app.post('/campgrounds', async (req,res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

app.get('/campgrounds/:id', async (req,res) => {
    //const {id} = req.params;
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground})
})

app.get('/campgrounds/:id/edit', async (req,res) => {
    const {id} = req.params.id;
    //const campground = await Campground.find({id});
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground})
})

app.put('/campgrounds/:id', async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground}); // (Ep. 411)
    res.redirect(`/campgrounds/${campground._id}`);
})

app.delete('/campgrounds/:id', async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds/');
})

app.listen(3000, ()=> {
    console.log('Server started on port 3000!')
})