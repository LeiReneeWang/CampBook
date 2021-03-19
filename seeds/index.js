const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const { users, complaints, compliments } = require('./users');
const { images } = require('./images');
const Campground = require('../models/campground');
const Review = require('../models/review');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Mongo connection open!');
    })
    .catch(err => {
        console.log('Mongo error connecting!');
        console.log(err);
    })

const sample = arr => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: `${sample(users)}`,
            location: {
                city: `${cities[random1000].city}`,
                state: `${cities[random1000].state}`
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugiat aliquid corporis labore iure voluptatibus rerum commodi voluptatem, fugit ipsa error iusto quis officia, cum soluta id? Officia laudantium voluptates aspernatur!',
            price,
            geometry: {
                type: 'Point' , 
                coordinates: [ 
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ] 
            },
            // images: [
            //     {
            //       url: 'https://res.cloudinary.com/dsnmr8l28/image/upload/v1615061351/YelpCamp/pmm8jqhusk3yyk8vzjr0.jpg',
            //       filename: 'YelpCamp/pmm8jqhusk3yyk8vzjr0'
            //     },
            //     {
            //       url: 'https://res.cloudinary.com/dsnmr8l28/image/upload/v1615061352/YelpCamp/y7floqigujrmfotoah7f.jpg',
            //       filename: 'YelpCamp/y7floqigujrmfotoah7f'
            //     }
            // ]
        });

        const posNum = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < posNum; j++) {
            const random46 = Math.floor(Math.random() * 46);
            await camp.images.push(images[random46]);
        }

        for (let j = 0; j < posNum; j++) {
            const posReview = new Review({
                body: `${sample(compliments)}`,
                rating: Math.floor(Math.random() * 2) + 3,
                author: `${sample(users)}`
            });
            await posReview.save();
            await camp.reviews.push(posReview);
        }
        
        const negNum = Math.round(Math.random());
        if (negNum) {
            const negReview = new Review({
                body: `${sample(complaints)}`,
                rating: Math.floor(Math.random() * 3) + 1,
                author: `${sample(users)}`
            });
            await negReview.save();
            await camp.reviews.push(negReview);
        }

        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})