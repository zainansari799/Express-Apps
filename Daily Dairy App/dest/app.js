/// <reference path='./../typings/tsd.d.ts'/>
"use strict";
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var app = express();
app.use(express.static(path.join(__dirname, './../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, './../views'));
app.set('view engine', 'ejs');
app.use(session({
    genid: function (req) {
        return (Date.now().toString()); // use UUIDs for session IDs 
    },
    secret: '123456789'
}));
mongoose.connect('mongodb://test:test@ds013908.mlab.com:13908/blog'); //Mongodb Connection of database 'Users'.
var Userschema = new mongoose.Schema({
    name: { type: String, unique: true },
    pw: { type: Number }
});
var taskSchema = new mongoose.Schema({
    "day": { type: String },
    "content": { type: String }
});
var task = mongoose.model('tasks', taskSchema);
var model = mongoose.model('Model', Userschema);
//Logout 
app.get("/logout", function (req, res) {
    req.session["isLogin"] = false;
    req.session["name"] = null;
    res.redirect("/signin");
});
app.get('/', function (req, res) {
    res.render('index');
});
app.get('/signin', function (req, res) {
    res.render('login');
});
app.get('/signup', function (req, res) {
    res.render('signup');
});
app.get('/blog', function (req, res) {
    res.render('blog', { "name": req.session["name"] });
});
app.post("/blog", function (req, res) {
    res.render('blog', { "name": req.session["name"] });
});
app.post('/showpost', function (req, res) {
    var all_tasks = new task({
        "day": req.body.day,
        "content": req.body.content
    }).save(function (err, data) {
        if (err)
            console.log(err);
        else
            console.log(data);
    });
    res.redirect('/showpost');
});
app.get("/showpost", function (req, res) {
    task.find({}, function (err, data) {
        if (err)
            console.log(err);
        else {
            res.render('showpost', { "displaypost": JSON.stringify(data), "name": req.session["name"] });
        }
    });
});
app.post('/signUp', function (req, res) {
    //var obj = {name:req.body.name,password:req.body.password};
    console.log(req.body.username);
    var User_Model = new model({
        "name": req.body.username,
        "pw": req.body.pw
    }).save(function (err, data) {
        if (err)
            console.log(err);
        else
            console.log(data);
        res.send("Account Created");
    });
    //res.send("Account Created")
});
app.post('/login', function (req, res) {
    model.find({ "name": req.body.username }, function (err, data) {
        console.log("Enter name :\n" + data);
        if (data.length == 0) {
            res.send("404 error");
        }
        else {
            for (var i = 0; i < data.length; i++) {
                if (data[i].name == req.body.username && data[i].pw == req.body.pw) {
                    console.log(data[i].name);
                    req.session["isLogin"] = true;
                    req.session["name"] = req.body.username;
                    req.session.save();
                    if (req.session["isLogin"]) {
                        res.render('blog', { "name": req.session["name"] });
                        console.log("Blog Page");
                    }
                }
                else {
                    res.send("404 error");
                }
            }
        }
        //res.send("404 error");    
    });
});
app.get('/login', function (req, res) {
    if (req.session["isLogin"]) {
        res.render('blog', { "name": req.session["name"] });
    }
    else {
        res.redirect('/');
    }
});
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
    var listeningport = server.address().port;
    console.log("server is listening at port " + listeningport);
});
