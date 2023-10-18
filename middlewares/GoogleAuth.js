const GoogleStrategy=require("passport-google-oauth2").Strategy
const passport = require("passport");
const dotenv=require('dotenv').config();
const googleUsers=require('../model/googleSchema')


module.exports=(passport)=>{
    passport.use(new GoogleStrategy({
        clientID:process.env.GOOGLE_CLIENT_ID,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:"http://localhost:5000/auth/google/callback",
        passRehttp:true

    },
    async function(request, accessToken, refreshToken, profile, done){
        try{
            const userId=profile.id
            let existingUser=await googleUsers.findOne({userId});
            if(existingUser){
                return done(null,existingUser)
            }else{
                const newUser=new googleUsers({
                    username:profile.displayName,
                    email:profile.email,
                });


                newUser.save()
                .then((user)=>{
                    console.log('user saved',user)
                }).catch((error)=>{
                    console.log("New user cannot save",error);

                })
                return done(null,newUser);
            }


        }catch(error){
            return done(error,false)
        }
    }
    ))
}

passport.serializeUser((user, done) => {
    done(null, user.id)
  });


  passport.deserializeUser((id, done) => {
    googleUsers.findById(id)
    .then((user)=>{
        if(user){
            done(null,user)
        } else{
            done(null,false)
        }
    })
    .catch((err)=>{
        done(err,false)
    })
  })
