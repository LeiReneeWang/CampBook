const express = require('express');
const router = express.Router({ mergeParams: true });
//need to set mergeParams to true so that the params received in routes
//on app.js file will merge over to review.js file
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const { reviewSchema } = require('../validationSchema.js');

const Campground = require('../models/campground');
const Review = require('../models/review');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;