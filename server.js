const express = require('express');
const session = require('express-session');
const { Issuer, generators } = require('openid-client');
const app = express();

let client;
// Initialize OpenID Client
async function initializeClient() {
    const issuer = await Issuer.discover('https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_9olUB2bN4');
    client = new issuer.Client({
        client_id: '4n5ptel9tgo4dp0r4o46oddmec',
        client_secret: 'kiqhen4352lc9dcqiemhrcda3ki9cpompk0l3nudalp0b5o35fp',
        redirect_uris: ['https://main.d3l6o0o25i868g.amplifyapp.com/dashboard.html'],
        response_types: ['code']
    });
};
initializeClient().catch(console.error);

app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: false
}));

const checkAuth = (req, res, next) => {
    if (!req.session.userInfo) {
        req.isAuthenticated = false;
    } else {
        req.isAuthenticated = true;
    }
    next();
};

app.get('/', checkAuth, (req, res) => {
    res.render('home', {
        isAuthenticated: req.isAuthenticated,
        userInfo: req.session.userInfo
    });
});

app.get('/login', (req, res) => {
    const nonce = generators.nonce();
    const state = generators.state();

    req.session.nonce = nonce;
    req.session.state = state;

    const authUrl = client.authorizationUrl({
        scope: 'email openid phone',
        state: state,
        nonce: nonce,
    });

    res.redirect(authUrl);
});

// Helper function to get the path from the URL. Example: "http://localhost/hello" returns "/hello"
function getPathFromURL(urlString) {
    try {
        const url = new URL(urlString);
        return url.pathname;
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
}

app.get(getPathFromURL('https://main.d3l6o0o25i868g.amplifyapp.com/dashboard.html'), async (req, res) => {
    try {
        const params = client.callbackParams(req);
        const tokenSet = await client.callback(
            'https://main.d3l6o0o25i868g.amplifyapp.com/dashboard.html',
            params,
            {
                nonce: req.session.nonce,
                state: req.session.state
            }
        );

        const userInfo = await client.userinfo(tokenSet.access_token);
        req.session.userInfo = userInfo;

        res.redirect('/');
    } catch (err) {
        console.error('Callback error:', err);
        res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    const logoutUrl = `https://ap-south-19olub2bn4.auth.ap-south-1.amazoncognito.com/logout?client_id=4n5ptel9tgo4dp0r4o46oddmec&logout_uri=<logout uri>`;
    res.redirect(logoutUrl);
});

app.set('view engine', 'ejs');
