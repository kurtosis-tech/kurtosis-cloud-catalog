const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const app = express()

const port = 8081

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../app/build')));
app.use('/static', express.static(
        path.join(__dirname, '../../app/build/static'),
        {
            maxAge: '30 days',
// @ts-ignore
            setHeaders: (res, path) => {
                if (express.static.mime.lookup(path) === 'text/html') {
                    // Avoid browser caching: https://stackoverflow.com/a/51524764
                    res.setHeader('Cache-Control', 'no-store, max-age=0');
                }
            }
        }
    )
);

// @ts-ignore
app.get('/health', function (_: any, res) {
    res
        .status(200)
        .json({
            "result": "healthy"
        })
});

// @ts-ignore
app.get('*', function (_: any, res) {
    res.setHeader('Cache-Control', 'no-store')
    res.sendFile('index.html', {root: path.join(__dirname, '../../app/build/')});
});
app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
