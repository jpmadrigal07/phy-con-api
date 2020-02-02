const express = require('express');
const router = express.Router({
	mergeParams: true
});
const User = require("../../models/user");
const {
	check,
	validationResult
} = require('express-validator/check');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
var counter = 0;

// USER SESSION ENDPOINTS

router.post("/session", [
	check('username', 'Username is required.').not().isEmpty(),
	check('password', 'Password is required.').not().isEmpty()
], (req, res) => {
	var errorsMessage = '';
	var errors = validationResult(req);
	var errorsArray = errors.array();
	for (var i = 0; i < errorsArray.length; i++) {
		errorsMessage += JSON.parse(JSON.stringify(errorsArray[i].msg)) + '<br />';
	}
	if (errorsArray.length > 0) {
		res.json({
			error: true,
			message: errorsMessage
		})
	} else {
		User.find({
			$and: [{
				username: req.body.username
			}, {
				password: req.body.password
			}]
		}).exec((err, user) => {
			if (err) {
				res.json({
					error: true,
					message: err.message
				})
			} else {
				if (user.length > 0) {
					var approveStatus = false;
					if(typeof user[0].approvedAt !== 'undefined') {
						approveStatus = true;
					}
					res.json({
						error: false,
						message: 'Successfully logged in!',
						userID: user[0]._id,
						userRole: user[0].roles,
						approved: approveStatus
					});
				} else {
					res.json({
						error: true,
						message: 'No account is associated with this information.'
					})
				}
			}
		});
	}
});

// USER ENDPOINTS

router.get("/", (req, res) => {
	if(typeof req.query.count !== 'undefined') {
		if(req.query.count == "all") {
			req.query.$or = [ {roles: { $ne: 'Administrator' }}, {roles: 'Patient'} ]
		}
		delete req.query.count;
	}
	if(typeof req.query.roles !== 'undefined') {
		if(req.query.roles == "Specialist") {
			delete req.query.roles;
			req.query.$and = [ {roles: { $ne: 'Administrator' }}, {roles: { $ne: 'Patient' }} ]
		}
	}
	if(typeof req.query.registeredAccounts !== 'undefined') {
		req.query.roles = { $ne: 'Administrator' }
		delete req.query.registeredAccounts;
	}
	if(typeof req.query.search !== 'undefined') {
		req.query.$or = [ {firstName: { $regex: req.query.search, $options: 'i' }}, {middleName: { $regex: req.query.search, $options: 'i' }}, {lastName: { $regex: req.query.search, $options: 'i' }}, {username: { $regex: req.query.search, $options: 'i' }}, {email: { $regex: req.query.search, $options: 'i' }} ]
		delete req.query.search;
	}
	req.query.deleteAt = {
		$exists: false
	};
	console.log(req.query)
	User.find(req.query).populate({ path: 'specialist.info' }).populate({ path: 'specialist.weeklySchedule' }).exec((err, allUser) => {
		if (err) {
			res.json({
				error: true,
				message: err.message
			})
		} else {
			res.json({
				error: false,
				message: allUser
				
			})

			console.log(allUser);
		}
	});
});

router.get("/:id", (req, res) => {
	User.findById(req.params.id).exec((err, user) => {
		if (err) {
			res.json({
				error: true,
				message: err.message
			})
		} else {
			res.json({
				error: false,
				message: user
				// authData: req.authData
			})
		}
	});
});

router.post("/", [
	check('username', 'Username is required.').not().isEmpty(),
	check('password', 'Password is required.').not().isEmpty(),
	check('email', 'Email is required.').not().isEmpty(),
	check('firstName', 'First Name is required.').not().isEmpty(),
	check('lastName', 'Last Name is required.').not().isEmpty(),
	check('lat', 'Latitude is required.').not().isEmpty(),
	check('lng', 'Longitude is required.').not().isEmpty(),
], (req, res) => {
	const newUser = new User({
		username: req.body.username,
		password: req.body.password,
		email: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		age: req.body.age,
		weight: req.body.weight,
		height: req.body.height,
		roles: req.body.roles,
		lat: req.body.lat,
		lng: req.body.lng
	});
	console.log(req.body.roles);

		User.create(newUser, (err, user) => {
			if (err) {
				res.json({
					error: true,
					message: err.message
				})
			} else {
				res.json({
					error: false,
					message: 'Successfully registered!'
				})
			}
		})
	
});

router.put('/:id', [
	check('username', 'Username is required.').not().isEmpty(),
	check('password', 'Password is required.').not().isEmpty(),
	check('email', 'Email is required.').not().isEmpty(),
	check('firstName', 'First name is required.').not().isEmpty(),
	check('lastName', 'Last name is required.').not().isEmpty(),
	check('gender', 'Gender is required.').not().isEmpty(),
	check('birthDate', 'Birth Date is required.').not().isEmpty(),
	check('middleName', 'Middle name is required.').not().isEmpty()
], (req, res) => {
	var updateUser = {
		username: req.body.username,
		password: req.body.password,
		email: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		gender: req.body.gender,
		birthDate: moment(req.body.birthDate).format('MM-DD-YYYY hh:mm:ss'),
		middleName: req.body.middleName,
		roles: req.body.roles
	};
	var errorsMessage = '';
	var errors = validationResult(req);
	var errorsArray = errors.array();
	for (var i = 0; i < errorsArray.length; i++) {
		errorsMessage += JSON.parse(JSON.stringify(errorsArray[i].msg)) + '<br />';
	}
	if (errorsArray.length > 0) {
		res.json({
			error: true,
			message: errorsMessage
		})
	} else {
		User.findByIdAndUpdate(req.params.id, updateUser, (err, updateUser) => {
			if (err) {
				res.json({
					error: true,
					message: err.message
				})
			} else {
				res.json({
					error: false,
					message: 'Successfully updated Account!'
				})
			}
		})
	}
});

router.delete('/:id', (req, res) => {
	var deleteUser = {
		deleteAt: moment()
	};
	User.findByIdAndUpdate(req.params.id, deleteUser, (err, deleteUser) => {
		if (err) {
			res.json({
				error: true,
				message: err.message
			})
		} else {
			res.json({
				error: false,
				message: 'Successfully deleted Account!'
			})
		}
	})
});


router.post("/profile-picture", (req, res) => {
	upload(req, res, (err) => {
		if (err) {
			res.json({
				error: true,
				message: err.message
			})
			console.log(err);
		} else {
			if (req.file == undefined) {
				res.json({
					error: true,
					message: 'No File Selected!'
				})
				console.log('No File Selected!');
			} else {
				User.findByIdAndUpdate(req.body.userID, {
					imgURL: req.file.filename
				}, function (err, updatedUser) {
					if (err) {
						res.json({
							error: true,
							message: err.message
						})
					} else {
						res.json({
							error: false,
							message: 'Profile picture updated!'
						})
					}
				})
			}
		}
	});
});

router.post("/identification", (req, res) => {
	upload(req, res, (err) => {
		if (err) {
			res.json({
				error: true,
				message: err.message
			})
			console.log(err);
		} else {
			if (req.file == undefined) {
				res.json({
					error: true,
					message: 'No File Selected!'
				})
				console.log('No File Selected!');
			} else {
				var docuType;
				if(req.body.docuType == "passport") {
					docuType = {
						'identification.passport': {
							url: req.file.filename,
							number: req.body.idNumber,
						}
					}
				} else if(req.body.docuType == "emirates") {
					docuType = {
						'identification.emirates': {
							url: req.file.filename,
							number: req.body.idNumber,
						}
					}
				} else if(req.body.docuType == "insurance") {
					docuType = {
						'identification.insurance': {
							url: req.file.filename,
							number: req.body.idNumber,
						}
					}
				}
				User.findByIdAndUpdate(req.body.userID, {$set: docuType}, function (err, updatedUser) {
					if (err) {
						res.json({
							error: true,
							message: err.message
						})
					} else {
						res.json({
							error: false,
							message: 'Identification updated!'
						})
					}
				})
			}
		}
	});
});

router.put('/change-password/:id', [
	check('password', 'Password is required.').not().isEmpty()
], (req, res) => {
	var updateUser = {
		password: req.body.password
	};
	var errorsMessage = '';
	var errors = validationResult(req);
	var errorsArray = errors.array();
	for (var i = 0; i < errorsArray.length; i++) {
		errorsMessage += JSON.parse(JSON.stringify(errorsArray[i].msg)) + '<br />';
	}
	if (errorsArray.length > 0) {
		res.json({
			error: true,
			message: errorsMessage
		})
	} else {
		User.findByIdAndUpdate(req.params.id, updateUser, function (err, updatedUser) {
			if (err) {
				res.json({
					error: true,
					message: err.message
				})
			} else {
				res.json({
					error: false,
					message: 'Password updated!'
				})
			}
		})
	}
});


router.put('/id-number/:id', [
	check('idNumber', 'ID Number is required.').not().isEmpty(),
	check('docuType', 'Document Type is required.').not().isEmpty()
], (req, res) => {
	var updateUser = {
		username: req.body.username,
		password: req.body.password,
		email: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		gender: req.body.gender,
		birthDate: moment(req.body.birthDate).format('MM-DD-YYYY hh:mm:ss'),
		middleName: req.body.middleName
	};
	var errorsMessage = '';
	var errors = validationResult(req);
	var errorsArray = errors.array();
	for (var i = 0; i < errorsArray.length; i++) {
		errorsMessage += JSON.parse(JSON.stringify(errorsArray[i].msg)) + '<br />';
	}
	if (errorsArray.length > 0) {
		res.json({
			error: true,
			message: errorsMessage
		})
	} else {
		var docuType;
		if(req.body.docuType == "passport") {
			docuType = {
				'identification.passport.number': req.body.idNumber
			}
		} else if(req.body.docuType == "emirates") {
			docuType = {
				'identification.emirates.number': req.body.idNumber
			}
		} else if(req.body.docuType == "insurance") {
			docuType = {
				'identification.insurance.number': req.body.idNumber
			}
		}
		User.findByIdAndUpdate(req.params.id, {$set: docuType}, function (err, updatedUser) {
			if (err) {
				res.json({
					error: true,
					message: err.message
				})
			} else {
				res.json({
					error: false,
					message: 'Identification updated!'
				})
			}
		})
	}
});

router.post("/identification/passport", (req, res) => {
	upload(req, res, (err) => {
		if (err) {
			res.json({
				error: true,
				message: err.message
			})
			console.log(err);
		} else {
			if (req.file == undefined) {
				res.json({
					error: true,
					message: 'No File Selected!'
				})
				console.log('No File Selected!');
			} else {
				User.findByIdAndUpdate(req.body.userID, {
					identificationImgURL: {
						passport: req.file.filename
					} 
				}, function (err, updatedUser) {
					if (err) {
						res.json({
							error: true,
							message: err.message
						})
					} else {
						res.json({
							error: false,
							message: 'Identification updated!'
						})
					}
				})
			}
		}
	});
});

router.post("/identification/national", (req, res) => {
	upload(req, res, (err) => {
		if (err) {
			res.json({
				error: true,
				message: err.message
			})
			console.log(err);
		} else {
			if (req.file == undefined) {
				res.json({
					error: true,
					message: 'No File Selected!'
				})
				console.log('No File Selected!');
			} else {
				User.findByIdAndUpdate(req.body.userID, {
					identificationImgURL: {
						national: req.file.filename
					} 
				}, function (err, updatedUser) {
					if (err) {
						res.json({
							error: true,
							message: err.message
						})
					} else {
						res.json({
							error: false,
							message: 'Identification updated!'
						})
					}
				})
			}
		}
	});
});

router.post('/forgot', function (req, res, next) {

	async.waterfall([
		function (done) {
			crypto.randomBytes(6, function (err, buf) {
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		function (token, done) {
			User.findOne({
				email: req.body.email
			}, function (err, user) {
				if (!user) {
					res.json({
						error: true,
						message: 'No account with that email address exists.'
					})
				} else {
					counter++;
					if(counter == 1) {
						User.findOneAndUpdate({email: req.body.email}, {resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000 }, function (err, user) {
							if (err) {
								res.json({
									error: true,
									message: err.message
								})
							}
						});
					} else {
						done(err, token, user);
					}
				}
			});
		},
		function (token, user, done) {
			var smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'jp.madrigal07@gmail.com',
					pass: '@Patrick22'
				}
			});
			var mailOptions = {
				to: user.email,
				from: 'support@jasts.com',
				subject: 'EIADA Password Reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Paste this code into your application to complete the process:\n\n' + token + '\n\n' +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			smtpTransport.sendMail(mailOptions, function (err) {
				res.json({
					error: false,
					message: 'An e-mail has been sent to ' + user.email + ' with further instructions.'
				})
				counter = 0;
				done(err, 'done');
			});
		}
	], function (err) {
		res.json({
			error: true,
			message: err.message
		})
	});
});

router.post('/verify-code', function (req, res) {
	User.findOne({
		resetPasswordToken: req.body.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	}, function (err, user) {
		if (!user) {
			res.json({
				error: true,
				message: 'Password reset token is invalid or has expired.'
			})
		} else {
			res.json({
				error: false,
				message: 'Code verified. Please change your password now.'
			})
		}
	});
});

router.post('/change-password', function (req, res) {
	async.waterfall([
		function (done) {
			User.findOne({
				resetPasswordToken: req.body.token,
				resetPasswordExpires: {
					$gt: Date.now()
				}
			}, function (err, user) {
				if (!user) {
					res.json({
						error: true,
						message: 'Password reset token is invalid or has expired'
					})
				} else {
					counter++;
					if(counter == 1) {
						User.findOneAndUpdate({resetPasswordToken: req.body.token}, {password: req.body.password}, function (err, user) {
							if (err) {
								res.json({
									error: true,
									message: err.message
								})
							}
						});
					} else {
						done(err, user);
					}
				} 
			});
		},
		function (user, done) {
			var smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'jepoyyy0225@gmail.com',
					pass: '@Patrick22'
				}
			});
			var mailOptions = {
				to: user.email,
				from: 'support@jasts.com',
				subject: 'Your password has been changed',
				text: 'Hello,\n\n' +
					'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
			};
			smtpTransport.sendMail(mailOptions, function (err) {
				res.json({
					error: false,
					message: 'Success! Your password has been changed.'
				})
				counter = 0;
				done(err);
			});
		}
	], function (err) {
		res.json({
			error: false,
			message: err.message
		})
	});
});

// OTHER

const storage = multer.diskStorage({
	destination: './public/uploads/',
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname) );
	}
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 100000000000
	},
	fileFilter: function (req, file, cb) {
		checkFileType(file, cb);
	}
}).single('myImage');

function checkFileType(file, cb) {
	const filetypes = /jpeg|jpg|png|gif/;
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = filetypes.test(file.mimetype);

	console.log(file);

	if (extname) {
		return cb(null, true);
	} else {
		cb('Error: Images Only!');
	}
}

router.put('/loginstatus/:id', (req, res) => {
	var updateUser = {
		loginStatus: req.body.loginStatus
	};
	User.update({ _id: req.params.id }, updateUser, (err, updatedUser) => {
		if (err) {
			res.json({
				error: true,
				message: err
			})
		} else {
			res.json({
			error: false,
			message: 'Login status is set to '+req.body.loginStatus+'.'
			})
		}
	})
});


router.put('/approve/:id', (req, res) => {
	if(req.body.status == "approve") {
		var updateUser = {
			approvedAt: moment()
		};
	} else if(req.body.status == "disapprove") {
		var updateUser = {
			$unset: { approvedAt: "" }
		};
	}
	User.update({ _id: req.params.id }, updateUser, (err, updatedUser) => {
		if (err) {
			res.json({
				error: true,
				message: err
			})
		} else {
			res.json({
			error: false,
			message: 'Successfully approved.'
			})
		}
	})
});

router.put('/block/:id', (req, res) => {
	if(req.body.status == "block") {
		var updateUser = {
			blockedAt: moment()
		};
	} else if(req.body.status == "unblock") {
		var updateUser = {
			$unset: { blockedAt: "" }
		};
	}
	User.update({ _id: req.params.id }, updateUser, (err, updatedUser) => {
		if (err) {
			res.json({
				error: true,
				message: err
			})
		} else {
			res.json({
			error: false,
			message: 'Successfully '+req.body.status+'.'
			})
		}
	})
});

router.put('/balance/:id', (req, res) => {

	var updateUser = {
		$set: { 'specialist.availableBalance': req.body.availableBalance }
	};
	
	User.update({ _id: req.params.id }, updateUser, (err, updatedUser) => {
		if (err) {
			res.json({
				error: true,
				message: err
			})
		} else {
			res.json({
			error: false,
			message: 'Successfully updated available balance.'
			})
		}
	})
});

module.exports = router;