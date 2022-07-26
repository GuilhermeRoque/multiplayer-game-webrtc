const session = require('express-session');
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 3000;
var jogadores = {
  primeiro: undefined,
  segundo: undefined,
  terceiro: undefined
};
var players = []


// Disparar evento quando jogador entrar na partida
io.on("connection", function (socket) {
  if (jogadores.primeiro === undefined) {
    jogadores.primeiro = socket.id;
  } else if (jogadores.segundo === undefined) {
    jogadores.segundo = socket.id;
  } else if (jogadores.terceiro === undefined) {
    jogadores.terceiro = socket.id;
  }

  io.emit("jogadores", jogadores);
  // console.log("+Lista de jogadores: %s", jogadores);

  // Sinalização de áudio: oferta
  socket.on("offer", (socketId, description) => {
    console.log('OFERTA AUDIO: ', description)
    socket.to(socketId).emit("offer", socket.id, description);
  });

  // Sinalização de áudio: atendimento da oferta
  socket.on("answer", (socketId, description) => {
    socket.to(socketId).emit("answer", description);
  });

  // Sinalização de áudio: envio dos candidatos de caminho
  socket.on("candidate", (socketId, signal) => {
    socket.to(socketId).emit("candidate", socket.id, signal);
  });
  
  // Disparar evento quando jogador sair da partida
  socket.on("disconnect", function () {
    if (jogadores.primeiro === socket.id) {
      jogadores.primeiro = undefined;
    }
    if (jogadores.segundo === socket.id) {
      jogadores.segundo = undefined;
    }
    if (jogadores.terceiro === socket.id) {
      jogadores.terceiro = undefined
    }
    io.emit("jogadores", jogadores);
    // console.log("-Lista de jogadores: %s", jogadores);
  });

  socket.on("estadoDoJogador", function (estado) {
    socket.broadcast.emit("desenharOutroJogador", estado);
  });
});
// ----------------------------------------------------------------
// app.set('view engine', 'ejs');

// app.use(session({
//   resave: false,
//   saveUninitialized: true,
//   secret: 'SECRET' 
// }));

// var passport = require('passport');
// var userProfile; 
// app.use(passport.initialize());
// app.use(passport.session());

// app.get('/login', function(req, res) {
//   res.render('pages/auth');
// });
// app.get('/error', (req, res) => res.send("error logging in"));

// passport.serializeUser(function(user, cb) {
//   cb(null, user);
// });
 
// passport.deserializeUser(function(obj, cb) {
//   cb(null, obj);
// });


// /*  Google AUTH  */
 
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// const GOOGLE_CLIENT_ID = '1063440433438-0mcpenptf78qa4i6vfsvo2rqu45656h0.apps.googleusercontent.com';
// const GOOGLE_CLIENT_SECRET = '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';

// passport.use(new GoogleStrategy({
//     clientID: GOOGLE_CLIENT_ID,
//     clientSecret: GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//       userProfile=profile;
//       return done(null, userProfile);
//   }
// ));
 
// app.get('/auth/google', 
//   passport.authenticate('google', { scope : ['profile', 'email'] }));
 
// app.get('/auth/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/error' }),
//   function(req, res) {
//     // Successful authentication, redirect success.
//     players.push(req.user._json)
//     console.log("Jogadores autenticados: \n", players)
//     res.redirect('/');
//   });

// app.use((req, res, next)=>{
//   if(!req.user){
//     res.redirect('/login')
//   }else{
//     next()
//   }
// }) 
// --------------------------------------------------------

app.use(express.static("./cliente"));
  
server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
  