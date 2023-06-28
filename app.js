require("dotenv").config();
const express = require("express");
const ejs = require('ejs');
const app = express();
const mongoose = require("mongoose");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/login");
const isAuth = require("./middleware/auth");
const bodyParser = require("body-parser") // for this also
const session = require('express-session');
const { User, validate } = require("./models/user");
const cookieParser = require('cookie-parser');

//middlewares
app.use(express.static('static'));   
app.use(express.urlencoded({ extended: true })); // don't know why but we use
app.use(cookieParser());
app.use(bodyParser.json());


//set view engine
app.set('view engine', 'ejs');


//connecting to mongodb
const dburl = process.env.MongoURI;
mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('DB connected successfully...'))
    .catch((err) => console.log('DB could not connect!\nError: ',err));



app.post('/liked/add/:id',isAuth, async(req,res)=>{
    let value = req.params.id;
    console.log(value);
    // console.log(value);
  const user = await User.findByIdAndUpdate(req.user._id,{$push:{"likedSongs":value}});
})

app.post('/liked/remove/:id',isAuth, async(req,res)=>{
    let value = req.params.id;
    await User.findByIdAndUpdate(req.user._id,{$pull:{"likedSongs":value}});
    const user = await User.findById(req.user._id);
    res.json({list:user.likedSongs});

})

app.get('/', isAuth,async(req, res) => {
    const user = await User.findById(req.user._id);
    res.render('home',{
        title: '',
        hist:user.history,
        takeauth: true
    })
});

app.use("/api/users/", userRoutes);
app.use("/api/login/", authRoutes);


app.get('/queue',isAuth,async(req,res)=>{
    const user = await User.findById(req.user._id); 
    list = user.likedSongs
    res.render('queue',{
        isAuth:false,
        title:"queue |",
        list: list
    })
})

app.post('/addhistory/:id',isAuth,async(req,res)=>{
    let id = req.params.id;
    // console.log(id);
    await User.findByIdAndUpdate({_id:req.user._id},{$pull:{"history":id}});
    const user = User.findOne({_id:req.user._id},(err,user)=>{
        if(err){
            console.log("error in History section of database");
        }
        else{
            user.history.unshift(id);
            if(user.history.length>=16)user.history.pop();
            user.save();
            // console.log(user.history);
            res.json({history:user.history});
        }
    });
});


app.get('/player',isAuth,(req,res)=>{
    res.render('player',{
        isAuth:false,
        title:"queue |"
    })
})

app.get('/dashboard',isAuth,(req,res)=>{
    res.render('dashboard',{
        isAuth:true,
        title:"queue |"
    })
})

app.get('/seeall/:id',isAuth,async (req,res)=>{
    const user = await User.findById(req.user._id);
    res.render('seeall',{
        title:"All songs |",
        id: req.params.id,
        lkSongs : user.likedSongs
    })
})

app.get('/logout', function(req, res) {
    res.clearCookie("token");
    res.redirect('/')
  })




const PORT = process.env.PORT || 8000;
app.listen(PORT,console.log(`Server running on http://localhost:${PORT}/`));