const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
    const page = req.query.p ? parseInt(req.query.p) : 1;
    const campgroundsPerPage = 10;
    const allCampgrounds = await Campground.find({});
    const campgrounds = await Campground.find({})
                                        .skip(page > 0 ? ( ( page - 1 ) * campgroundsPerPage ) : 0 )
                                        .limit(campgroundsPerPage);
    if (campgrounds.length === 0) {
        req.flash('error', 'No more campgrounds!');
        return res.redirect('/campgrounds');
    }
    const maxPage = allCampgrounds.length / campgroundsPerPage;
    res.render('campgrounds/index', { allCampgrounds, campgrounds, page, maxPage });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const city = req.body.campground.location.city;
    const state = req.body.campground.location.state;
    const location = city + ", " + state;
    const geoData = await geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', "Successfully made a new campground");
    res.redirect(`campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await (await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author'));
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted a campground");
    res.redirect('/campgrounds');
};