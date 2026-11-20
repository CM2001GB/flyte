const app = require('./app');
const PORT = process.env.port || 8010;

app.listen(PORT, () => {
    console.log(`NOTAM service running on port ${PORT}`);
});