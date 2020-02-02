const User = require("./models/user");

const newUser = new User({
    username: 'admin',
    password: 'qwerty123',
    email: 'admin@sample.com',
    imgURL: '/images/default-user.png',
    firstName: 'Admin',
    lastName: 'Admin',
    roles: 'Teacher'
});

User.find({
    role: 'Teacher'
}, (err, foundUser) => {
    if (foundUser.length == 0) {
        newUser.save();
    }
})

