// Sunrise-Sunset Service configuration

module.exports = {
    port: process.env.PORT || 8005,

    // sunrise-sunset.org API v2 — free, no key needed
    api: {
        baseUrl: 'https://api.sunrise-sunset.org/v2'
    },

    // safety margins: how many minutes before sunrise / after sunset
    // the drone must NOT be flying (CAA twilight buffer)
    margins: {
        beforeSunrise: 15,  // minutes
        afterSunset: 15     // minutes
    }
};