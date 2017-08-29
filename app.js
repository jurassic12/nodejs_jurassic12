const fs=require('fs');
const http=require('http');
const express=require('express');
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const mysql=require('mysql');
const session = require ('express-session');
const multer = require('multer');

//var upload = multer({ dest: 'uploads/' });
const _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
const upload = multer({ storage: _storage });


//var ReactAudioPlayer=require('react-audio-player');
//var player = require("player")
//import ReactAudioPlayer from 'react-audio-player';

const app=express();

const vidStreamer=require("vid-streamer");
app.get("/videos/",vidStreamer);


app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
   extended: true
}));
//var upload = multer({ dest: 'uploads/' });
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

// var player = require("player")
// var player = new player('./xxx.mp3');
// player.play(function(err,player){
//   console.log('playend!');
//   });
//   var player = player([
//     __dirname+'/CHRISTMAS.mp3',
//     __dirname+'/MAMAMU.mp3',
//     __dirname+'/UKISS.mp3',
//     'http://jurassic12.gonetis.com:52273/UKISS.mp3'
//    ]);
//
//    player.play();
//    console.log(player.list)







//...
// <ReactAudioPlayer
//   src="CHRISTMAS.ogg"
//   autoPlay
//   controls
// />

app.get('/',(request,response) => {
  fs.readFile('index.html',(error,data) => {
    response.writeHead('200',{ 'Content-Type':'text/html;charset=utf8'});
    response.end(data);
  });
});


app.get('/movie',(request,response) => {
  fs.readFile('movie.html',(error,data) => {
    response.writeHead('200',{ 'Content-Type':'text/html;charset=utf8'});
    response.end(data);
  });
});


app.get('/music',(request,response) => {
  fs.readFile('WolfMan_TR.webm',(error,data) => {
    response.writeHead('200',{ 'Content-Type':'video/webm'});
    response.end(data);
    //response.end(data);
  });
});


app.get('/upload',(request,response) => {
  fs.readFile('upload.html',(error,data) => {
    response.writeHead('200',{ 'Content-Type':'text/html;charset=utf8'});
    response.end(data);
  });
});

app.post('/upload',upload.single('userfile'),(request,response) =>{

    response.send('sucess');
    //res.send('upload:'+req.file.filename);

});

app.get('/music1',(request,response) => {
  fs.readFile('music1.html',(error,data) => {
    response.writeHead('200',{ 'Content-Type':'text/html;charset=utf8'});
    response.end(data);
  });
});
