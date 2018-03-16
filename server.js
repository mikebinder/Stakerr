// dependencies
var express = require("express");
var bodyParser = require("body-parser");
var connection = require("./config/connection.js");
var jsdom = require("jsdom");
var { JSDOM } = jsdom;
var { window } = new JSDOM(`<!DOCTYPE html>`);
var $ = require('jquery')(window);

var app = module.exports = express();

app.use(express.static("."));

var session = require("express-session");

app.use(session({ secret: "app", resave: false, saveUninitialized: true, cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } }));

app.use(bodyParser.urlencoded({ extended: false }));

// Set Handlebars.
var exphbs = require("express-handlebars");

var hbs = exphbs.create({
    defaultLayout: "main"
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// goals feed route (displays all the active goals)
app.get("/", function (req, res) {

    if (req.session.logged_in) {
        var query = "SELECT u.user, g.goal_text, g.goal_end, g.raised, g.max_wager FROM goals g LEFT JOIN users u ON u.id=g.user_id WHERE g.complete=0";


        $("#follow").on("click", function() {

        $(this).html("<i class='material-icons'>check</i>")

        })

        connection.query(query, function (err, data) {
            if (err) throw err;
            res.render("goalsfeed", { "goals": data });
        })
    } else {
        res.redirect("/login");
    }
})

// my account view display route
app.get("/myaccount", function (req, res) {
    if (req.session.logged_in) {
        var query1 = "SELECT * FROM users WHERE id=?"
        var query2 = "SELECT * FROM goals g WHERE user_id=?"
        connection.query(query1, [req.session.user_id], function (err, data1) {
            if (err) throw err;
            connection.query(query2, [req.session.user_id], function (err, data2) {
                if (err) throw err;
                res.render("accountview", { "users": data1[0], "goals": data2 })
            })
        })
    } else {
        res.redirect("/login");
    }
})

// create goal display route
app.get("/create", function (req, res) {
    if (req.session.logged_in) {
        var query = "SELECT * FROM users WHERE id=1";

        connection.query(query, function (err, data) {
            if (err) throw err;
            res.render("creategoal", { "goals": data })
        })
    } else {
        res.redirect("/login");
    }
})

// post route for new goals
app.post("/create", function (req, res) {
    var query = "INSERT INTO goals SET ?"
    var goal_start = new Date()
    goal_start = goal_start.toLocaleDateString("en-US")
    connection.query(query,
        {
            "user_id": req.session.user_id,
            "goal_text": req.body.goal_text,
            "goal_start": "2018/3/15",
            "goal_end": "2018/3/22"
        },
        function (err, data) {
            if (err) throw err
            res.redirect("/myaccount");
        }
    )
})

var balance;
var raised;
var max;

// view goal display route
app.get("/view", function (req, res) {
    var query = "SELECT u.user, u.credits, g.goal_text, g.max_wager, g.raised, g.fol FROM goals g LEFT JOIN users u ON u.id=g.user_id WHERE g.id=2";

    connection.query(query, function (err, data) {
        if (err) throw err;
        balance = data[0].credits;
        raised = data[0].raised;
        max = data[0].max_wager;

        console.log(raised);

        $(".update").on("click", function() {
            $("#account").text(balance);
        });


        var updateProg = function() {
            var prog = (raised/max) * 100;
            $("#progressBarView").attr("style", "width:" + prog + "%");
        }
        
        var checkProg = function() {
        if(raised < max) {
            updateProg();
        }
        else {
            updateProg();
            $("#progressBarView").attr("style", "width:100%");
            $("#prgsView").text("Complete!");
            $(".interaction").remove();
        }
        };
        
        checkProg();

        res.render("viewgoal", { "view": data[0] })
        })
    })

// app.post("/updateview", function (req, res) {
//     var query2 = "UPDATE goals SET raised=? where id=?";
//     var query3 = "UPDATE users SET credits=? where id=?";
// })


// login page
app.get("/login", function (req, res) {
    res.render("login")
})

// user loggin in
app.post("/userlogin", function (req, res) {
    var query = "SELECT * FROM users WHERE user=?"
    connection.query(query, [req.body.user], function (err, data) {
        if (err) throw err;
        if (req.body.user_pw === data[0].user_pw) {
            req.session.logged_in = true;
            req.session.user_id = data[0].id;
            res.redirect("/");
        } else {
            res.redirect("/login");
            console.log("Incorrect login")
        }
    })
})

// new user landing page
app.get("/newuser", function (req, res) {
    res.render("newuser");
})

// post route for new user creation
app.post("/newuser", function (req, res) {
    res.redirect("/login");
    var query = "INSERT INTO users SET ?"
    connection.query(query, req.body, function (err, data) {
        if (err) throw err;
    })
})

// set server to listen 
var port = process.env.PORT || 3000;
app.listen(port);


/////// page functions


$("#shortTerm, #longTerm").on("click", function() {
    $("#timeframe").text(this.text);
    if(this.text === "Long Term") {
        $("#timeframeEntry").attr("type", "date")
    }
    else {
        $("#timeframeEntry").attr("type", "time")
    }
})



$(".buyIn").on("click", function() {
    var bet = parseInt($("#stk").val());
    var remaining = max - raised - bet;
    if(account - bet >= 0 && bet > 0 && remaining >= 0) {
        account -= bet;
        raised += bet;
        checkProg();
        Materialize.toast('Stake successfully placed!', 4000)
    }
    else if(bet <= 0) {
        Materialize.toast('Please enter a valid amount.', 4000);
    }
    else if(remaining < 0) {
        remaining = max - raised;
        Materialize.toast('Invalid Amount! Only ' + remaining + ' available left to stake.', 4000)
    }
    else {
        Materialize.toast('Insufficient Funds', 4000)
    }
})

