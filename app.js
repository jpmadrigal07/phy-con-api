const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

const userRoutesV1 = require("./routes/v1/user");
const pulseV1 = require("./routes/v1/pulse");
const runV1 = require("./routes/v1/run");

const port = process.env.PORT || 5000;

// mongoose.connect("mongodb://127.0.0.1:27017/phy-con-api", {
//     useNewUrlParser: true,
//     useFindAndModify: false,
//     useCreateIndex: true
// });

mongoose.connect("mongodb://phycon:phycon123@ds041032.mlab.com:41032/phy-con", {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
});

app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

app.use("/api/v1/user", userRoutesV1);
app.use("/api/v1/pulse", pulseV1);
app.use("/api/v1/run", runV1);

app.get('*', function(req, res){
    res.status(404).send("Sorry! You don't have any permission to access this.");
});

// Load Teacher Account
// require('./seed');

app.listen(port, () => {
    console.log("PHY-CON has Started in PORT 5000 http://localhost:5000/");
});