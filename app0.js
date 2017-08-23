const fs=require('fs');
const http=require('http');
const express=require('express');
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const mysql=require('mysql');
const session = require ('express-session');


const client = mysql.createConnection({
  user : 'root',
  password : 
  database : 'homepage1'
});

const app=express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.set('views', './views');
app.locals.pretty = true;
app.use(session({
    secret: '5$*^@)(&+)&*%$765%^&',
    resave: false,
    saveUninitialized: true,
    key: 'sid', // 세션키
    //cookie: {
    //    maxAge: 1000 * 60 * 60 }// 쿠키 유효기간 1시간

}));

http.createServer(app).listen(52273,()=>{
    console.log(`Server running at http://127.0.0,1:52273`);
});


app.get('/',(request,response) =>{
  //if (request.session.displayname) {
  if (request.cookies.auth)  {
     //response.send('<h1>가입을 축하합니다.</h1>,<h1> 로그인에 성공했습니다.</h1>');
     response.writeHead('200',{ 'Content-Type':'text/html;charset=utf8'});
     response.write('<div><p><h1> 로그인에 성공했습니다 </h1></p></div>' );
     response.write("<br><br><a href='/login'> LOGOUT</a>");
     response.end();

   }else  {
     response.redirect('/login');
   }
  });

app.get('/join',(request,response) => {
  fs.readFile('member.html','utf8', (error,data) => {
    response.send(data.toString());
  });
});


app.post('/join',(request,response) =>{
  let body = request.body;

  client.query('INSERT INTO members (username,displayname,email,password) VALUES (?,?,?,?,?)',
   [body.username, body.displayname,  body.email, body.password],() =>{
     response.redirect('/');
  });
});

app.get('/login',(request,response) =>{
  fs.readFile('login.html','utf8', (error,data)=>{
    response.send(data.toString());
  });
});


app.post('/login', (request , response) =>{
  /*let user = {
    idn : req.body.id,
    pwd : req.body.password,
    dsp : req.body.name
  };*/
  //let body = request.body;
  //let id=request.param('id');
  //let password=request.param('password');
  let username=request.body.username;
  let password=request.body.password;
  //let displayname=req.body.name;
  client.query('SELECT * FROM members WHERE username=? AND password=?',[username, password],
    (error,rows)=>{
      if (rows.length>0) {
        //console.log(rows);
        //req.session.displayname=id;
        response.cookie('auth',true);
        //response.writeHead('200',{ 'Content-Type':'text/html;charset=utf8'});
        //response.write('<div><p>사용자 아이디 : '  +id+ '</p></div>' );
        //response.write("<br><br><a href='/login.html'> LOGOUT</a>");
        //response.end();}
        response.redirect('/');}
        //response.send(password);}
       else{
         console.log('회원이 아닙니다. 가입해주세요.');
         response.redirect('/join');
       }
    });
});
