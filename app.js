const express       = require('express'),
      bodyParser    = require('body-parser'),
      mongoose      = require('mongoose'),
      passport      = require('passport'),
      LocalStrategy = require('passport-local'),
      expressSession= require('express-session'),
      Restaurants   = require('./models/restaurants.js'),
      User          = require('./models/user.js'),
      seed          = require('./seed.js'),
      app           = express();
      PORT          = process.env.PORT || 3000;


//================
//PASSPORT CONFIG
//================
app.use(expressSession({
  secret: 'Mo Salah is the best player in the world',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//===========
//MIDDLEWARE
//===========
app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended: true}));
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
}

// locally
// mongoose.connect('mongodb://localhost/restaurants-review', () => console.log("Connected to Database..."))
// mlab
mongoose.connect('mongodb://ahmedfarag:Af36178000@ds347467.mlab.com:47467/restaurant-reviews', () => console.log("Connected to Database..."));

//=======
//ROUTES
//=======
//sign up form
app.get('/register', (req, res) => {
  res.render('auth/register');
});

//sign up logic
app.post('/register', (req, res) => {
  const newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect('/register');
    }
    passport.authenticate('local')(req, res, () => {
      res.redirect('/restaurants');
    });
  });
});

//login form
app.get('/login', (req, res) => {
  res.render('auth/login');
});

//login logic
app.post('/login', passport.authenticate('local', {
    successRedirect: '/restaurants',
    failureRedirect: '/login'
  }), (req, res) => {
  }
);

//logout logic
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/restaurants');
});

//landing page route
app.get('/', (req, res) => {
      res.render('index');
});

//restaurants show page
app.get('/restaurants', (req, res) => {
  Restaurants.find((err, foundRestaurants) => {
  res.render('restaurants', {restaurants: foundRestaurants});
  });
});

//new restaurant form
app.get('/restaurants/new', (req, res) => {
  res.render('new');
});

//new restaurant logic
app.post('/restaurants', (req, res) => {
  Restaurants.create(req.body.restaurant, (err, newRestaurant) => {
    res.redirect('/restaurants');
  })
});

//restaurant details page
app.get('/restaurants/:id', (req, res) => {
  Restaurants.findById(req.params.id, (err, foundRestaurant) => {
    res.render('show.ejs', {restaurant: foundRestaurant});
  });
});

//new comment form
app.get('/restaurants/:id/comments/new', isLoggedIn, (req, res) => {
  res.render('newComment', {restaurantId: req.params.id});
});

//new comment logic
app.post('/restaurants/:id/comments', isLoggedIn, (req, res) => {
  Restaurants.findById(req.params.id, (err, foundRestaurant) => {
    foundRestaurant.reviews.push(req.body.comment);
    foundRestaurant.save();
    res.redirect(`/restaurants/${req.params.id}`);
  })
});

//seed data route
app.get('/seed', (req, res) => {
  seed();
  res.redirect('/restaurants')
});


app.listen(PORT, () => console.log(`Server has started on port ${PORT}...`));