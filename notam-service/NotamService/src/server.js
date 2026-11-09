// imports the app and listens to the designated port, which is defined by an environment variable
// we use port 3001 for development/testing/fallback purposes

const app = require('./app');
const PORT = process.env.port || 3001;

app.listen(PORT, () => {
    console.log(`NOTAM service running on port ${PORT}`);
});