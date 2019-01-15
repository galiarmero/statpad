const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    profileId: String,
    provider: String,
    name: String,
    imageUrl: String,
    firstLogin: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 1 },
})

userSchema.statics.findByProviderAndProfileId = function(provider, profileId) {
    return this.findOne({ provider, profileId });
}

const User = mongoose.model('User', userSchema)

module.exports = User;