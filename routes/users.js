const router = require('express').Router();
const {User,validate} = require('../models/user');
const bcrypt = require('bcrypt');

router.get("/",(req,res)=>{
	res.render('signup',{
		isAuth: false,
		message :"",
		title : "Signup | "
	})
});


//create new user

router.post("/",async (req,res)=>{
	const { error } = validate(req.body);
	// console.log(error);
	if(error){
		return res.render('signup',{
			isAuth: false,
			message :error,
			title : "Signup | "
		})
	}
	const user = await User.findOne({ email: req.body.email });
	if(user){
		return res.render('signup',{
			isAuth: false,
			message :"!! User already exist !!",
			title : "Signup | "
		})
	}
	const salt = await bcrypt.genSalt(Number(process.env.SALT));
	const hashPassword = await bcrypt.hash(req.body.password, salt);
    let newUser = await new User({
		...req.body,
        password:hashPassword
	})
	console.log(newUser);
	await newUser.save();

	const token = await newUser.generateAuthToken();
	res.cookie('token', token, { httpOnly: true });
	res.render('signup',{                     //render dashboard here.
		isAuth: false,
		message :"!! User already exist !!",
	    title : "Signup | "
	});
})

module.exports = router;