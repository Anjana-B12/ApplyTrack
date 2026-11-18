const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const methodOverride = require("method-override");

let port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/ApplyTrack')
    .then(() => {
        console.log('MongoDB connected Successfully!');
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });


const User = require("./models/User");
const Job = require("./models/Job");

const registerSchema = require("./validations/userValidation");
const applicationSchema = require("./validations/jobValidation");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));

//express-session middleware
app.use(session({
    secret: "applytrack-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true
    }
}));

//Middleware - decides which to show - login/signup or logout
app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId;
    next();
});

//Middleware - checks whether user loggedIn or not before going further
function isLoggedIn(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
}

//Register Page - GET
app.get("/register", (req, res) => {
    res.render("register.ejs", { error: null });
});

//Register Page - POST
app.post("/register", async (req, res) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) {
            return res.render("register", {
                error: error.details[0].message
            });
        }
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        req.session.userId = newUser._id;
        req.session.success = "Account created successfully! Welcome to ApplyTrack.";
        res.redirect("/dashboard");
    } catch (err) {
        if (err.code === 11000) {
            return res.render("register", {
                error: "An account with this email already exists!"
            });
        }

        console.log(err);
        res.status(500).send("something went wrong!");
    }
});

//Login Page - GET
app.get("/login", (req, res) => {
    res.render("login.ejs", { error: null });
});

//Login Page - POST
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();
        const { password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.render("login", {
                error: "Invalid email or password!"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.render("login", {
                error: "Invalid email or password!"
            });
        }

        req.session.userId = user._id;
        console.log("Session Created: ", req.session.userId);
        res.redirect("/dashboard");

    } catch (err) {
        console.log(err);
        res.status(500).send("something went wrong!");
    }
});

//Dashboard Page
app.get("/dashboard", isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);

        //query - dashboard/filter=xxxx  or dashboard/search=xxxx
        const filter = req.query.status || "all";
        const search = req.query.search;
        const sortBy = req.query.sortBy || "newest";

        const page = Number(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        const query = {
            user: req.session.userId
        }
        if (search) {
            query.$or = [
                { company: { $regex: search, $options: "i" } },
                { position: { $regex: search, $options: "i" } },
            ];
        }

        if (filter && filter !== "all") {
            query.status = filter;
        }

        const allJobs = await Job.find({
            user: req.session.userId
        });

        let sortOption = { createdAt: -1 };
        if (sortBy === "oldest") {
            sortOption = { createdAt: 1 };
        } else if (sortBy === "company") {
            sortOption = { company: 1 };
        }

        const jobs = await Job.find(query).sort(sortOption).skip(skip).limit(limit);

        const totalJobs = await Job.countDocuments(query);
        const totalPages = Math.ceil(totalJobs / limit);

        const totalApplications = allJobs.length;

        const appliedCount = allJobs.filter(
            job => job.status === "Applied"
        ).length;

        const interviewCount = allJobs.filter(
            job => job.status === "Interview"
        ).length;

        const rejectedCount = allJobs.filter(
            job => job.status === "Rejected"
        ).length;

        const offerCount = allJobs.filter(
            job => job.status === "Offer"
        ).length;

        const success = req.session.success || null;
        delete req.session.success;

        res.render("dashboard.ejs", {
            user,
            jobs,
            success,
            totalApplications,
            appliedCount,
            interviewCount,
            rejectedCount,
            offerCount,
            search,
            filter,
            page,
            totalPages,
            sortBy
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("something went wrong!");
    }
});

//Add Application Page - form
app.get("/jobs/new", isLoggedIn, (req, res) => {
    res.render("jobs/new", {
        error: null
    });
});

//Add application
app.post("/jobs", isLoggedIn, async (req, res) => {
    try {
        const { error } = applicationSchema.validate(req.body);
        if (error) {
            return res.render("jobs/new", {
                error: error.details[0].message
            });
        }

        const { company, position, location, jobType, appliedDate, status, jobLink, description, notes } = req.body;
        const newJob = new Job({
            company,
            position,
            location,
            jobType,
            appliedDate,
            status,
            jobLink,
            description,
            notes,
            user: req.session.userId
        });

        await newJob.save();
        res.redirect("/dashboard");

    } catch (err) {
        console.log(err);
        res.status(500).send("something went wrong!");
    }
});

//Edit Page - form
app.get("/jobs/:id/edit", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findOne({
            _id: id,
            user: req.session.userId
        });
        if (!job) {
            res.status(404).send("Job application not found!");
        }
        res.render("jobs/edit.ejs", {
            job,
            error: null
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("something went wrong!");
    }
});

//Edit page
app.put("/jobs/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = applicationSchema.validate(req.body);

        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        const updatedJob = await Job.findOneAndUpdate(
            {
                _id: id,
                user: req.session.userId
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedJob) {
            return res.status(404).send("Job application not found!");
        }

        res.redirect("/dashboard");

    } catch (err) {
        console.log(err);
        res.status(500).send("something went wrong!");
    }
});

//Delete job application button
app.delete("/jobs/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;

        const deletedJob = await Job.findOneAndDelete(
            {
                _id: id,
                user: req.session.userId
            }
        );

        if (!deletedJob) {
            return res.status(404).send("Job application not found!");
        }

        res.redirect("/dashboard");

    } catch (err) {
        console.log(err);
        res.status(500).send("something went wrong!");
    }
});

//Home Page
app.get("/", (req, res) => {
    res.render("home.ejs");
});

//Logout - POST
app.post("/logout", (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            next(err);
        }
    });

    res.clearCookie("connect.sid");
    res.redirect("/login");
});

app.listen(port, () => {
    console.log(`app is listening to port ${port}`);
});
