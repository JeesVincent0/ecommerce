import passport from "passport";
import { Strategy as googleStratergy } from "passport-google-oauth20";
import User from '../models/userSchema.js'


passport.use( new googleStratergy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
    
    let user = await User.findOne({ googleId: profile.id });
    if(!user) {
        user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName
        })
    }
    return done(null, user)
}
))

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user)
})