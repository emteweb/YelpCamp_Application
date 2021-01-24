const express = require('express');
const app = express();
const Campground = require('./models/campground');

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
app.set('views', path.join(__dirname, 'views') )

app.get('/', (req,res) => {
    res.render('home');
})

app.get('/makecampground', async (req,res) => {
    const camp = new Campground({title: 'My Backyard', price: 25, description: 'Cheap camping'})
    await camp.save();
    res.send(camp)
})

app.listen(3000, ()=> {
    console.log('Server started on port 3000!')
})