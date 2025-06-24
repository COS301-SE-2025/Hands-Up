process.env.HTTPS = 'true';
process.env.SSL_CRT_FILE = 'localhost+2.pem';
process.env.SSL_KEY_FILE = 'localhost+2-key.pem';

require('react-scripts/scripts/start');
