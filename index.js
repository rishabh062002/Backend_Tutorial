
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cookie_parser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// app.use(express.static(path.join(__dirname,"public")));
// console.log(path.join(__dirname,"public"));
 
// connecting databse --->

mongoose.connect("mongodb://localhost:27017",{
    dbName : "backend",

}).then(()=>
console.log("mondoDB Connected!!!"))
.catch(()=>
console.log(e));

//setting data type and name of variable for database in compaas --->

// const messageSchema = new mongoose.Schema({
//     name:String,
//     email:String
// });


const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
});

// creating model -------->

const User = mongoose.model("User",userSchema);


// setting view engine ---------->

app.use(express.urlencoded({extended:true}));
app.use(cookie_parser());
app.set("view engine","ejs" );

// used to access data from form input ----->

// it is a middleware ---------->
const isAuthenticated = async (req,res,next)=>{
  
    const {token} = req.cookies;
    console.log(token);

if(token){
    console.log("Cookie present = logout")


    // decoding the token --->


    const decoded =  jwt.verify(token,"sdsdsdsdasdsad");
   
   //saving user info----->
   
   req.user = await User.findById(decoded._id);
   next();
   

}
else
{
    console.log("no cookie = login")
    res.redirect("/login");
}

}


// home page of login page
app.get("/",isAuthenticated,(req,res)=>{

// printing user info...after saving it--->


console.log(req.user);
res.render("logout",{name:req.user.name});

});
 
app.post("/login",async (req,res)=>{
    const {email,password} = req.body;
    
    let user = await User.findOne({email});
    // new user
    if(!user)  return res.redirect("/register");
    
    // old user
    const ismatch = await bcrypt.compare(password,user.password);
    if(!ismatch)
    return res.render("login2", {email,message:" Password Doesn't Match"});

    const token = jwt.sign(
        {_id:user._id},
        "sdsdsdsdasdsad"
      );
    
        res.cookie("token",token,{
            // to make more secure httpOnly
               httpOnly:true,
               expires:new Date(Date.now() + 60*1000)
        });
    
        res.redirect("/");


});




app.get("/register",(req,res)=>{
    console.log("registering!!")
    res.render("register2");
}) 


app.get("/login",(req,res)=>{
    res.render("login2");
})

app.get("/add",async (req,res)=>{

    res.send("<h1>Message Sent! Thank You!</h1>");


})


app.post("/register",async (req,res)=>{

   
  console.log(req.body);
 
  const {name,email,password} = req.body;

  let user = await User.findOne({ email });
  if(user){
   return res.redirect("/login");
  }
  const hashed = await bcrypt.hash(password,10);




  
   user = await User.create({
    name,
    email,
    password:hashed,
   });

// Encoding the value of token key with jwt
  const token = jwt.sign(
    {_id:user._id},
    "sdsdsdsdasdsad"
  );

    res.cookie("token",token,{
        // to make more secure httpOnly
           httpOnly:true,
           expires:new Date(Date.now() + 60*1000)
    });

    res.redirect("/");
})










app.get("/logout",(req,res)=>{
    // here we need to destroy our cookie so that we can log-out
    res.cookie("token",null,{
           httpOnly:true,
           expires:new Date(Date.now())
    });

    res.redirect("/");
})






app.listen(2000,()=>{
    console.log("working!!");
})