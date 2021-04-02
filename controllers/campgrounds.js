const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError ('Invalid Campgound Data'); // instead we gonna use 'Joi'
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f=> ({url: f.path, filename: f.filename})); // mapping array to object types
    campground.author = req.user._id;
    await campground.save();
    console.log("After save:");
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
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
    //console.log(campground);
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    //const campground = await Campground.find({id});
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    return res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(req.body);
        // logic checking if the logged user_id is equal to author_id to submit changes - moved to middleware (isAuthor)
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
        const imgs = req.files.map(f=> ({url: f.path, filename: f.filename}));
        campground.images.push(...imgs);
        await campground.save();
        if(req.body.deleteImages){
            for(let filename of req.body.deleteImages){
                await cloudinary.uploader.destroy(filename);
            }
            await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
            console.log(campground);
        }
        
        req.flash('success', 'Successfully updated the campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (e) {
        next(e);
    }
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground successfully deleted!');
    res.redirect('/campgrounds/');
}