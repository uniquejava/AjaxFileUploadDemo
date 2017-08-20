var express = require('express');
var router = express.Router();
var path = require('path');

// for formidable
var formidable = require('formidable');
var fs = require('fs');
var mkdirp = require('mkdirp');
var config = require('../config');

// **** for multer ****
var multer = require('multer');
// var upload = multer({dest: config.uploadDir});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, createDestinationDir());
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  }
});
var upload = multer({storage: storage});
// **** end for multer ****


// store all uploads in the /uploads directory
function createDestinationDir() {
  console.log('createDestinationDir');
  var date = new Date(), y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  var uploadDir = [config.uploadDir, y, m, d].join('/');
  mkdirp.sync(uploadDir);
  return uploadDir;
}

router.post('/formidable', function (req, res, next) {

  // create an incoming form object
  var form = new formidable.IncomingForm();
  var data = {};

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  form.uploadDir = createDestinationDir();

  // non file type field
  form.on('field', function (field, value) {
    console.log(field, ":", value);
  });

  // every time a file has been uploaded successfully,
  // rename it to it's original name
  form.on('file', function (field, file) {
    if (file.name !== '') {
      var dest = path.join(form.uploadDir, Date.now() + '_' + file.name);
      data[file.name] = dest;
      console.log('file.path=' + file.path);

      fs.rename(file.path, dest);
    }
  });

  // log any errors that occur
  form.on('error', function (err) {
    console.log('An error has occured: ' + err);
    res.json({result: 'error'});
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function () {
    console.log(data);
    res.json({result: 'success', data: data});
  });

  // parse the incoming request containing the form data
  form.parse(req);
});

/*
router.post('/multer', upload.array('file', 2), function (req, res, next) {
  // non file type field
  var other = req.body;
  console.log(other);

  var data = {};
  var files = req.files;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    data[file.originalname] = file.path;
  }
  console.log(data);
  res.json({result: 'success', data: data});
});
*/

router.post('/multer', function (req, res, next) {
  var uploadx = upload.array('file', 2);
  uploadx(req, res, function (err) {
    if (err) {
      console.log('An error has occured: ' + err);
      res.json({result: 'error'});
    }

    // non file type field
    var other = req.body;
    console.log(other);

    var data = {};
    var files = req.files;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      data[file.originalname] = file.path;
    }
    console.log(data);
    res.json({result: 'success', data: data});
  });
});

module.exports = router;
