const express = require('express');
const app = express()
const Name = require('./model')
var router = express.Router();
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var jwt = require('jsonwebtoken');
var secret = 'bgmi';
const {ObjectId} = require('mongodb')

router.post('/', async (req, res) => {
    console.log("Hello");
    let data = new Name()
    data.name = req.body.name
    data.email = req.body.email
    data.phone = req.body.phone
    data.password = req.body.password

    data.save((err) => {
        if (err) {
            console.log(err)
        }
    })
    res.send(req.body);
}
)

router.post('/login', function (req, res) {
    Name.findOne({ email: req.body.email }).select('email password').exec(function (err, user) {
        if (err) throw err;
        else {
            if (!user) {
                res.json({ success: false, message: 'email and password not provided !!!' });
            } else if (user) {
                if (!req.body.password) {
                    res.json({ success: false, message: 'No password provided' });
                } else {
                    var validPassword = user.comparePassword(req.body.password);
                    if (!validPassword) {
                        res.json({ success: false, message: 'Could not authenticate password' });
                    } else {
                        //res.send(user);
                        var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '24h' });
                        res.json({ success: true, message: 'User authenticated!', token: token });
                    }
                }
            }
        }
    });
});

router.use(function (req, res, next) {

    var token = req.body.token || req.body.query || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                res.json({ success: false, message: 'Token invalid' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.json({ success: false, message: 'No token provided' });
    }
})
router.get('/', (req, res) => {
    Name.find({}).exec(function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({ success: fale, message: 'User not found' });
        } else {
            res.json({ success: true, message: 'get details Successfully', data: user });
        }
    })
})
router.get('/get/:id', (req, res) => {
    const id = req.params.id
        Name.findById(ObjectId(id))
            .exec(function (err, result) {
                if (err) {
                    console.log("err", err)
                } else {
                    res.status(200).json({  
                        data: result, success: true
                    })
                }
            })
    })  
router.post('/adduser', async (req, res) => {
    console.log("Hello");
    let data = new Name()
    data.name = req.body.name
    data.email = req.body.email
    data.phone = req.body.phone
    data.password = 'Test@1234'

    data.save((err) => {
        if (err) {
            console.log(err)
        }
    })
    res.send(req.body);
}
)
router.put('/:id', async (req, res) => {
    console.log("past____-", req.body);
    Name.findOne({ _id: req.params.id }).exec((err, result) => {
        result.name = req.body.name,
            result.email = req.body.email,
            result.phone = req.body.phone,
            result.password = req.body.password
        result.save(function (err) {
            if (err) {
                console.log(err);
            }
        });
        res.send("update")


    })


})
router.delete("/:id", async (req, res) => {

    const user = await Name.findByIdAndDelete(req.params.id);
    res.send(user)

})
module.exports = router