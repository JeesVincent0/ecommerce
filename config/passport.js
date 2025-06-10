import passport from "passport";
import { Strategy as googleStratergy } from "passport-google-oauth20";
import User from '../models/userSchema.js'
import process from "process";


passport.use(new googleStratergy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://yourdomain.com/auth/google/callback'
        : 'http://localhost:8000/auth/google/callback'
},

    async (accessToken, refreshToken, profile, done) => {

        const referalCode = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
        const referralUrl = "http://shoppi.fun/signup?ref=" + referalCode;

        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                referralUrl,
                referalCode
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