var fs=require('fs');
var http=require('http');
var express=require('express');
var cookieParser=require('cookie-parser');
var bodyParser=require('body-parser');
var mysql=require('mysql');
var session = require ('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();


var app=express();

var client = mysql.createConnection({
  user : 'root',
  password :
  database : 'homepage1'
});


app.use(session({
    secret: '5$*^@)(&+)&*%$765%^&',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password:
      database: 'homepage1'

    })
}));

app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.set('views', './views');
app.locals.pretty = true;


http.createServer(app).listen(52273,()=>{
    console.log(`Server running at http://127.0.0,1:52273`);
});

app.get('/',(request,response) => {
  fs.readFile('index.html',(error,data) => {
    response.writeHead('200',{ 'Content-Type':'text/html;charset=utf8'});
    response.end(data);
  });
});



app.get('/auth/login',(request,response) =>{
  fs.readFile('login.html','utf8', (error,data)=>{
    response.send(data.toString());
  });
});

passport.use(new LocalStrategy(
  function(username,password,done) {
    var uname=username;
    var pwd=password;
    var sql='SELECT * FROM users WHERE authId=?';
    client.query(sql,['local:'+uname],(err,results)=>{
      if (err) {
        return done('there is no user');
      }
      var user=results[0];
      return hasher({password:pwd,salt:user.salt},(err,pass,salt,hash)=>{
        if (hash===user.password){
          console.log('LocalStrategy',user);
          done(null,user);
        } else {
          done(null,false);
        }
      });
    });
  }
) );

passport.serializeUser((user,done)=>{
  console.log('serializeUser',user);
  done(null,user.authId);
});


passport.deserializeUser((id,done)=>{
  console.log('deserializeUser',id);
  var sql='SELECT * FROM users WHERE authID=?';
  client.query(sql,[id],(err,results)=>{
    if (err) {
      console.log(err);
      done('there is no user');
    }else {
      done(null,results[0]);
    }
  });
});

app.post('/auth/login',
  passport.authenticate('local', { successRedirect: '/welcome',
                                   failureRedirect: '/auth/login',
                                   failureFlash: false })
);


app.get('/welcome', function(req, res){
  if(req.user && req.user.displayName) {
     res.redirect('/topic');
    // res.send(`
    //   <h1>Hello, ${req.user.displayName}</h1>
    //   <a href="/auth/logout">logout</a>
    // `);
  } else {
    res.send(`
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <div align=center>
      <h1>Welcome</h1>

        <p><a href="/auth/login"><h2>로그인</h2></a></p>
        <p><a href="/auth/register"><h2>회원가입</h2></a></p>

     </div>
    `);
  }
});


app.get('/auth/logout', function(req, res){
   req.logout();
   req.session.save(function(){
     res.redirect('/');
   });
 });


app.get('/auth/register',(request,response) => {
  fs.readFile('member.html','utf8', (error,data) => {
    response.send(data.toString());
  });
});


app.post('/auth/register', function(req, res){
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var user = {
      authId:'local:'+req.body.username,
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName,
      email : req.body.email
    };
    var sql = 'INSERT INTO users SET ?';
    client.query(sql, user, function(err, results){
      if(err){
        console.log(err);
        res.status(500);
      } else {
        req.login(user, function(err){
          req.session.save(function(){
            res.redirect('/welcome');
          });
        });
      }
    });
  });
});

app.get('/topic/add', (req,res) =>{
  const sql = 'SELECT id,title FROM topic';
  client.query(sql,(err,topics,fields) =>{
    res.render('add', {topics:topics,});
  });
});

app.post('/topic/add', (req,res)=>{
  //let  id=req.body.id;
   let title=req.body.title;
   let description=req.body.description;
   let author=req.body.author;
    const sql='INSERT INTO topic (title, description, author) VALUES (?,?,?)';
      client.query(sql,[title, description, author],(err,result)=>{
       console.log(result);
        res.redirect('/topic/'+result.insertId);
    });
});

app.get(['/topic/:id/edit'], (req,res) =>{
  const sql = 'SELECT id,title FROM topic';
  client.query(sql,(err,topics,fields) =>{
    let id=req.params.id;
    const sql= 'SELECT * FROM topic WHERE id=?';
     client.query(sql,[id],(err,topic,fields) =>{
      res.render('edit', {topics:topics, topic:topic[0]});
    });
  });
});

app.post(['/topic/:id/edit'],(req,res) =>{
  let id=req.params.id;
  let title=req.body.title;
  let description=req.body.description;
  let author=req.body.author;
  const sql='UPDATE topic SET title=?,description=?,author=? WHERE id=?';
    client.query(sql,[title,description,author,id],(err,result,fields)=>{
      res.redirect('/topic/'+id);
    });
});

app.get(['/topic/:id/delete'], (req,res) =>{
  const sql = 'SELECT id,title FROM topic';
  client.query(sql,(err,topics,fields) =>{
    let id=req.params.id;
    const sql= 'SELECT * FROM topic WHERE id=?';
     client.query(sql,[id],(err,topic,fields) =>{
       if (topic===0){
        res.send('없는 데이터입니다');
      } else {
        res.render('delete', {topics:topics,topic:topic[0]});
      //res.render('edit', {topics:topics, topic:topic[0]});
      }
    });
  });
});

app.post('/topic/:id/delete',(req,res)=>{
  let id=req.params.id;
  const sql='DELETE FROM topic WHERE id=?';
  client.query(sql,[id],(err,result,fields)=>{
    res.redirect('/topic');
  });
});



app.get('/topic', (req,res) =>{
  const sql = 'SELECT id,title FROM topic';
  client.query(sql,(err,topics,fields) =>{
    res.render('view', {topics:topics,});
  });
});

app.get('/topic/:id',(req,res) =>{
  const sql = 'SELECT id,title FROM topic';
  client.query(sql,(err,topics,fields) =>{
    let id=req.params.id;
    const sql= 'SELECT * FROM topic WHERE id=?';
     client.query(sql,[id],(err,topic,fields) =>{
      res.render('view', {topics:topics, topic:topic[0]});
    });
  });
});

app.get('/movie',(request,response) => {
  fs.readFile('movie.html',(error,data) => {
    response.writeHead('200',{ 'Content-Type':'text/html;charset=utf8'});
    response.end(data);
  });
});

app.get('/music',(request,response) => {
  fs.readFile('CHRISTMAS.ogg',(error,data) => {
    response.writeHead('200',{ 'Content-Type':'audio/ogg'});
    response.end(data);
  });
});
