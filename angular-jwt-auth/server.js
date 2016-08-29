var express = require('express');
var faker = require('faker');
var cors = require('cors');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

//mini database for now
var user = {
	username: 'abiral',
	password: 'password'
}

var secret = 'ajsdf289879aksdjfn938asndfi3ha8';

var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use( expressJwt( {secret: secret } ).unless( { path: ['/login']} ) );

app.get('/random-user', function(req,res){
	var user = faker.helpers.userCard();
	user.avatar = faker.image.avatar();
	res.json(user);
});

app.post('/login',authenticate, function(req,res){
	var token = jwt.sign({
		username: user.username
	},secret);

	res.send({
		token: token,
		user: user
	});
});

app.get('/me', function(req,res){
	res.send(req.user);
});

app.listen(3000,function(){
	console.log('App listining on localhost:3000');
});

//UTL functions
function authenticate(req,res,next){
	var body = req.body;
	if(!body.username || !body.password){
		res.status(400).end('Must Provide username or password');
	}

	if(body.username != user.username || body.password != user.password ){
		res.status(401).end('Username or Password incorrect. hint:'+ body.username +'||'+ user.username + body.password +'||'+ user.password);
	}

	next();
}