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
            let userProfile = response.data.profile;
            // Check if user already logged in before
            User.findByProviderAndProfileId('yahoo', userProfile.guid).then(currentUser => {
                if (currentUser) {
                    // If old user, update login-related fields
                    updateUserLoginStats(currentUser);
                } else {
                    // If new user, insert in DB
                    createNewUser(userProfile);
                }
            })
        }).catch(err => {
            console.log(err)
        })
    })
)

const updateUserLoginStats = (currentUser) => {
    currentUser.set({ lastLogin: Date.now(), loginCount: currentUser.loginCount + 1 });
    currentUser.save().then(updatedUser => {
        console.log(`Updated login stats for ${updatedUser.profileId}`);
    }).catch(err => {
        console.log('Error updating user login stats');
        console.log(err);
    })
}

const createNewUser = (userProfile) => {
    new User({
        provider: 'yahoo',
        profileId: userProfile.guid,
        name: userProfile.nickname,
        imageUrl: userProfile.image.imageUrl,
    }).save().then(newUser => {
        console.log(`New ${newUser.provider} user '${newUser.profileId}' inserted`);
    }).catch(err => {
        console.log('Error creating user');
        console.log(err);
    })
}

