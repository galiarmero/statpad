const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2')
const User = require('../models/user-model')
const axios = require('axios')
const vars = require('./vars')
const YAHOO_CLIENT_ID = vars.YAHOO_CLIENT_ID
const YAHOO_CLIENT_SECRET = vars.YAHOO_CLIENT_SECRET

passport.use('yahoo', new OAuth2Strategy({
        authorizationURL: 'https://api.login.yahoo.com/oauth2/request_auth',
        tokenURL: 'https://api.login.yahoo.com/oauth2/get_token',
        clientID: YAHOO_CLIENT_ID,
        clientSecret: YAHOO_CLIENT_SECRET,
        callbackURL: 'http://127.0.0.1/auth/yahoo/callback'
    },
    (accessToken, refreshToken, params, profile, done) => {
        axios.get(`https://social.yahooapis.com/v1/user/${params.xoauth_yahoo_guid}/profile`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            },
            responseType: 'json'
        }).then(response => {
            let newUser = response.data.profile;
            // Check if user already logged in before
            User.findByProviderAndProfileId('yahoo', newUser.guid).then(oldUser => {
                if (oldUser) {
                    updateUserLoginStats(oldUser, done);
                } else {
                    createNewUser(newUser, done);
                }
            })
        }).catch(err => {
            console.log(`Error fetching user profile for ${params.xoauth_yahoo_guid}`)
            console.log(err)
            return done()
        })
    })
)

const updateUserLoginStats = (user, done) => {
    user.set({ lastLogin: Date.now(), loginCount: user.loginCount + 1 });
    user.save().then(updatedUser => {
        console.log(`Updated login stats for ${updatedUser.profileId}`);
        return done(null, updatedUser);
    }).catch(err => {
        console.log('Error updating user login stats');
        console.log(err);
        return done(null, user);
    })
}

const createNewUser = (user, done) => {
    new User({
        provider: 'yahoo',
        profileId: user.guid,
        name: user.nickname,
        imageUrl: user.image.imageUrl,
    }).save().then(newUser => {
        console.log(`New ${newUser.provider} user '${newUser.profileId}' inserted`);
        return done(null, newUser);
    }).catch(err => {
        console.log('Error creating user');
        console.log(err);
        return done(err);
    })
}

