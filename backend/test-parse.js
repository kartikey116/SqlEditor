require('dotenv').config();
const { parse } = require('pg-connection-string');
try {
    const config = parse(process.env.DATABASE_URL);
    console.log('Parsed successfully:', config.ssl);
} catch (e) {
    console.error(e);
}
