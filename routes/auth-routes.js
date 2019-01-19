const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../config/passport')

router.get('/yahoo', passport.authenticate('yahoo'));

router.get('/yahoo/callback', (req, res, next) => {
    console.log("In callback")
    passport.authenticate('yahoo', (err, user, info) => {
        if (err) { return next(err); }
        
        res.send(user)
    })(req, res, next);
})


// Handle errors
router.use((err, req, res, next) => {
    if (err) {
        if (err.name === 'InternalOAuthError' && 
            err.oauthError &&
            err.oauthError.code === 'ETIMEDOUT') {
            res.send('Failed to obtain access token. Connection timed out.')
        }
    }
})

module.exports = router;