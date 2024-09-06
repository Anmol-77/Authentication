const express=require('express')
const Dbconnection=require("./database/db")
const cors=require("cors")
const dotenv=require("dotenv")
const bcrypt=require("bcrypt")
const User=require("./model/User")
const jwt=require("jsonwebtoken")
const cookieParser = require("cookie-parser");
// const mongoose=require("mongoose")

dotenv.config();

const app=express();

const port=8000;

app.use(cors({
    origin: 'http://localhost:5173', // or whatever port your React app is running on
    credentials: true // This allows cookies to be sent across domains
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

Dbconnection();


app.get("/",(req,res)=>{
    res.send("HELLO WRLD");
})

app.post("/register",async (req,res)=>{
    try{
        const {name,username,email,password}=req.body;

        //to check if data exist or not

        if(!(name && username && email && password)){
            return res.status(400).send("enter all information");
        }

        // check if user already exist

        const existuser=await User.findOne({email});
        if(existuser){
            return res.status(200).send("User already exist");
        }

        //now we know that the user does not exist and we will now encypt password

        const hashedpass= await bcrypt.hash(password,10);

        const user=await User.create({
            name,
            username,
            email,
            password: hashedpass,
        })

        const token= jwt.sign({id:user._id,email},process.env.key,{expiresIn:"1d"});

        user.token=token;
        user.password=undefined;
        
        res
        .status(200)
        .json({ message: "You have successfully registered!", user });

    }
    catch(error){
        console.log(error)
    }
})


app.post("/login",async(req,res)=>{
    try{
        const {email,password}=req.body;

        if(!email && !password){
            return res.status(404).json("FILL IN THE COMPLETE DETAILS");
        }

        const user=await User.findOne({email});

        if(!user){
            return res.status(404).json("User not found");
        }

        const enteredpassword=await bcrypt.compare(password,user.password);

        if(!enteredpassword){
            return res.status(401).json("incorrect password");
        }

        const usertoken=jwt.sign({id:user._id},process.env.key,{expiresIn:"1d"});

        user.token=usertoken;

        user.password=undefined;

        const options={
            expires:new Date(Date.now()+1*24*60*60*1000),
            httpOnly:true
        }
        res.status(200).cookie("token",usertoken,options).json({
            message: "You have successfully logged in!",
            success: true,
            usertoken,
        
        })

    }
    catch(err){
        console.log(err);
    }
})

// Add to your existing backend code
app.get('/checkAuth', async(req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, process.env.key);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('token').status(200).json({ message: "Logged out successfully" });
});



app.listen(port,()=>{
    console.log(`Server is running on PORT ${port}`);
})
