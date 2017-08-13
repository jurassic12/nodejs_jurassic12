const fs=require('fs');
const http=require('http');
const express=require('express');
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const mysql=require('mysql');


const client = mysql.createConnection({
  user : 'root',
  password : '12801004',
  database : 'homepage1'
});

const app=express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


http.createServer(app).listen(52273,()=>{
    console.log(`Server running at http://127.0.0,1:52273`);
});


app.get('/',(request,response) =>{
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

  client.query('INSERT INTO membership (id,name,age,email,password) VALUES (?,?,?,?,?)',
   [body.id, body.name, body.age, body.email, body.password],() =>{
     response.redirect('/');
  });
});

app.get('/login',(request,response) =>{
  fs.readFile('login.html','utf8', (error,data)=>{
    response.send(data.toString());
  });
});


app.post('/login', (request , response) =>{
  //let body = request.body;
  //let id=request.param('id');
  //let password=request.param('password');
  let id=request.body.id;
  let password=request.body.password;


  client.query('SELECT * FROM membership WHERE id=? AND password=?',[id, password],
    (error,results)=>{
      if (results.length>0) {
        console.log(results);
        response.cookie('auth',true);
        //response.writeHead('200',{ 'Content-Type':'text/html;charset=utf8'});
        //response.write('<div><p>사용자 아이디 : '  +id+ '</p></div>' );
        //response.write("<br><br><a href='/login.html'> LOGOUT</a>");
        //response.end(data);}
        response.redirect('/');}
        //response.send('<h1>login success</h1>');
        else{
         console.log('회원이 아닙니다. 가입해주세요.');
         response.redirect('/join');
       }
    });
});
