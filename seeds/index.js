const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelpcampDb', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '605a3e81b0a82a2dbc38968e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            //image: 'https://source.unsplash.com/collection/429524/800x600',
            images: [
                {
                    url: 'https://res.cloudinary.com/emtecloud/image/upload/v1618256148/Yelpcamp/wacuvmbufigj9yzjfzlk.jpg',
                    filename: 'Yelpcamp/wacuvmbufigj9yzjfzlk'
                },
                {
                    url: 'https://res.cloudinary.com/emtecloud/image/upload/v1618256149/Yelpcamp/enjetoymqwybisfuxncx.jpg',
                    filename: 'Yelpcamp/enjetoymqwybisfuxncx'
                }
            ],
            geometry: {
                "type": "Point",
                "coordinates": [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin laoreet lacus et malesuada bibendum. Etiam rutrum porta tristique. Nulla non libero mattis, venenatis mi nec, venenatis eros. Vivamus lacinia dictum semper.',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})