const mongoose = require('mongoose');
const express =  require("express");
const path = require('path');
const ejs = require('ejs');
const app = express()
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const passport = require('passport');
const passportLocal = require("passport-local");
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');

app.set('view engine', "ejs");



//connecting to the database
mongoose.connect("mongodb://localhost:27017/blogsoftware", {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
}).then(()=>{
    console.log("Connected to Database")
}).catch(()=>{
    console.log("Unable to connect to Database")
})

//middleware
app.use(bodyParser.urlencoded({extended: true}));



//authentication config
app.use(methodOverride('_method'));
    app.use(session({
    secret: 'asus',
    resave: false,
    saveUninitialized: true,
  }))



  app.use(passport.initialize());
  app.use(passport.session());

 app.use(function(req,res,next){
      user = req.user
      next();
  })


  //post Schema
const PostSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    tag: String,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments'
    }]
})
const Post = mongoose.model('Post', PostSchema);

//User schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String
})

UserSchema.plugin(passportLocalMongoose)
const User = mongoose.model('Users', UserSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//comment schema
const commentSchema = new mongoose.Schema({
    author: String,
    comment: String,
});

const Comment = mongoose.model('comments', commentSchema);



app.get('/', (req, res) => {
    Post.find({}, (err, posts) => {
        if(err){
            console.log(err)
        } else {
            console.log(posts)
            res.render('home', {posts:posts})
        }
    })
   
})

app.get('/blogs', (req, res) => {
    Post.find({}, (err, posts) => {
        if(err){
            console.log(err)
        } else {
            console.log(posts)
            res.render('home', {posts:posts})
        }
    })
   
})


//display form for adding a new post
//this middleware function will check if user is logged in or not
app.get('/blogs/new', isLoggedIn, (req,res) => {
    res.render('new-post');
})

//add new post to the database.
app.post('/blogs', isLoggedIn, (req,res) =>{
    const title = req.body.title;
    const image = req.body.image;
    const tag = req.body.tag;
    const description = req.body.description;

    const post = new Post({
        title: title,
        image: image,
        tag: tag,
        description: description,
    })
    post.save((err, data)=> {
        if(err){
           console.log(err) 
        } else{
            res.redirect('/');
        }
    })
})

//Show a single post
app.get('/blogs/:id', (req, res) => {
    Post.findById(req.params.id).populate('comments').exec(function(err, post){
        if(err){
            console.log(err);
        } else {
            // console.log(post);
            res.render('post', {post:post})
        }
    });

})


//Form For Edit/Update posts 
app.get('/blogs/:id/edit', (req, res) =>{
    Post.findById(req.params.id, (err, post)=>{
        if(err){
            console.log(err)
        } else {
            res.render('edit-post', {post: post});
        }
    })
    
})
//Editing actual post
app.put('/blogs/:id',  (req,res) =>{
    Post.findByIdAndUpdate(req.params.id,
        {
            title: req.body.title,
            tag: req.body.tag,
            image: req.body.image,
            description: req.body.description
        }, function (err, update){
            if(err){
                console.log(err)
            } else{
                res.redirect('/blogs/' + req.params.id);
            }
        })
})


//delete a single post
app.delete('/blogs/:id',  (req, res) => {
    //delete logic will be in here
   Post.findByIdAndDelete(req.params.id, (err) =>{
       if (err) {
          console.log(err);
       } else{
           res.redirect('/')
       }
   })
});

//Authentication Routes---------------------------
//show registration form
app.get('/register', (req, res) =>{
    res.render('register.ejs')
})

//register user
app.post('/register', (req, res) =>{
    User.register({username:req.body.username}, req.body.password,(err,user) => {
        if(err){
            console.log(err)
        } else {
            passport.authenticate('local')(req,res, function(){
                console.log('user registered');
                console.log(user);
                res.redirect('/');
            })
        }
    })
})

//show login form
app.get('/login', (req, res) => {
res.render('login');
})

//login logic
app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err)
        } else {
            console.log('user logged in')
            console.log(req)
            res.redirect('/');
        }
    })
});


//logout route
app.get('/logout', (req, res) =>{
    req.logout();
    res.redirect('/');
    console.log('user logged out')
})

//comments post route

app.post('/blogs/:id/comments', isLoggedIn, (req,res) =>{

    console.log(req.params.id);
    console.log(req.body.comments);
    const comment = new Comment({
        author: user.username,
        comment: req.body.comment
    })
    comment.save((err, result)=>{
        if(err){
            console.log(err)           
        } else {
            Post.findById(req.params.id, (err, post) => {
                if(err){
                    console.log(err);
                } else {                
                    post.comments.push(result);
                    post.save();
                    console.log('Comment Created!!')
                    console.log(post.comments)
                    res.redirect('/');
                }
            })
            console.log(result)
            
        }
    });
});

//middleware to check authentication. 
//isAuthenticated() is provided by passport. 
function isLoggedIn(req, res, next){
   if(req.isAuthenticated()){
       next() 
   } else {
       res.redirect('/login')
   }
}


//server config
const port = process.env.PORT || 3002

//starting up server
app.listen(port, () => {
    console.log(`App is running at port ${port}`);
})