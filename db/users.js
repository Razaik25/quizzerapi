var pgp = require('pg-promise')({});
var dotenv = require('dotenv');
dotenv.load();

if(process.env.ENVIRONMENT === 'production') {
  var cn = process.env.DATABASE_URL
} else {
  var cn =
  {
    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  };
}

var db = pgp(cn);

function createUser (req, res, next) {
  var email = req.params.email;
  var username = Object.keys(req.body)[0];

  db.one(`INSERT INTO users(username, email)
  VALUES($1, $2) RETURNING id`, [username, email])
  .then(function(data) {
    res.data = data;
    next();
  })
  .catch(function(error) {
    console.log(error);
  })
}

function getUser (req, res, next) {
  db.any('SELECT * FROM users WHERE email = $1', [req.params.email])
  .then(function(data) {
    res.data = data;
    next()
  })
  .catch(function(error) {
    console.log(error)
  })
}

function updateUser (req, res, next) {
  console.log('in pg', req.body);
  var email = req.params.email;
  var data = JSON.parse(Object.keys(req.body)[0]);
  var category;
  var score;
  for(var key in data){
    if(key === 'category'){
      category = data[key].trim();
    }

    if(key === 'score'){
      score = data[key];
    }
  }
  db.any('UPDATE users SET $1~ = $2 WHERE email = $3 RETURNING *', [category, score, email])
  .then(function(data) {
    res.data = data;
    next()
  })
  .catch(function(error) {
    console.log(error)
  })
}

module.exports.createUser = createUser;
module.exports.getUser = getUser;
module.exports.updateUser = updateUser;
