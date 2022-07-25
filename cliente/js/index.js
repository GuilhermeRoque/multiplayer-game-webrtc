var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "game-container",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var player1;
var player2;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var jogador;
var ice_servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
var localConnection;
var remoteConnection;
var midias;
var trilha;
const audio = document.querySelector("audio");
var game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", "assets/sky1.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");
  this.load.audio("trilha", "./assets/cena1.mp3");
  this.load.spritesheet("player1", "assets/dude.png", {
    frameWidth: 45,
    frameHeight: 38,
  });
  this.load.spritesheet("player2", "assets/dude2.png", {
    frameWidth: 45,
    frameHeight: 38,
  });
}

function create() {
  //  A simple background for our game
  this.add.image(400, 300, "sky");
  trilha = this.sound.add("trilha");
  // trilha.play();

  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = this.physics.add.staticGroup();

  //  Here we create the ground.
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  //  Now let's create some ledges
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  // The player and its settings
  player1 = this.physics.add.sprite(100, 450, "player1");
  player1.body.setAllowGravity(false);

  this.anims.create({
    key: "left1",
    frames: this.anims.generateFrameNumbers("player1", {
      start: 8,
      end: 9,
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn1",
    frames: this.anims.generateFrameNumbers("player1", {
      start: 0,
      end: 1,
    }),
    frameRate: 2,
    repeat: -1,
  });

  this.anims.create({
    key: "right1",
    frames: this.anims.generateFrameNumbers("player1", {
      start: 18,
      end: 19,
    }),
    frameRate: 10,
    repeat: 1,
  });

  player2 = this.physics.add.sprite(100, 450, "player2");
  player2.body.setAllowGravity(false);

  this.anims.create({
    key: "left2",
    frames: this.anims.generateFrameNumbers("player2", {
      start: 8,
      end: 9,
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn2",
    frames: this.anims.generateFrameNumbers("player2", {
      start: 0,
      end: 1,
    }),
    frameRate: 2,
    repeat: -1,
  });

  this.anims.create({
    key: "right2",
    frames: this.anims.generateFrameNumbers("player2", {
      start: 18,
      end: 19,
    }),
    frameRate: 10,
    repeat: 1,
  });

  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);

  //  Input Events
  cursors = this.input.keyboard.createCursorKeys();

  //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  stars.children.iterate(function (child) {
    //  Give each star a slightly different bounce
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  scoreText = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#000",
  });

  this.physics.add.collider(stars, platforms, null, null, this);

  // Conectar no servidor via WebSocket
  this.socket = io("https://ifsc.cloud", {path:"/roque/socket.io/", transports:['websocket']});

  // Disparar evento quando jogador entrar na partida
  var self = this;
  var physics = this.physics;
  var socket = this.socket;

  this.socket.on("jogadores", function (jogadores) {
    if (jogadores.primeiro === self.socket.id) {
      // Define jogador como o primeiro
      jogador = 1;

      // Personagens colidem com os limites da cena
      player1.body.setAllowGravity(true);
      physics.add.collider(player1, platforms);
      physics.add.collider(stars, platforms);
      physics.add.overlap(player1, stars, collectStar, null, this);
      physics.add.collider(player1, bombs, hitBomb, null, this);
      player1.setCollideWorldBounds(true);

      navigator.mediaDevices
      // get media streams
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          midias = stream;
        })
        .catch((error) => console.log(error));
    } else if (jogadores.segundo === self.socket.id) {
      // Define jogador como o segundo
      jogador = 2;

      // Personagens colidem com os limites da cena
      player2.body.setAllowGravity(true);
      physics.add.collider(player2, platforms);
      physics.add.overlap(player2, stars, collectStar, null, this);
      physics.add.collider(player2, bombs, hitBomb, null, this);
      player2.setCollideWorldBounds(true);

      navigator.mediaDevices
        // Media Streams API
        // method prompts the user for permission to use a media input which produces a MediaStream with tracks(video/audio) containing the requested types of media. 
        .getUserMedia({ video: false, audio: true }) 
        .then((stream) => {
          midias = stream;
          // RTCPeerConnection: WebRTC connection between the local computer and a remote peer
          // ice_servers: An array of RTCIceServer objects, servers which may be used by the ICE agent; STUN and/or TURN servers.
          localConnection = new RTCPeerConnection(ice_servers);
          midias
            .getTracks()
            // adds a new media track to the set of tracks which will be transmitted to the other peer
            .forEach((track) => localConnection.addTrack(track, midias));
          
          // when an RTCIceCandidate has been identified and added to the local peer by a call to RTCPeerConnection.setLocalDescription().
          localConnection.onicecandidate = ({ candidate }) => {
            console.log("ICE_CANDIDATE: ", candidate)
            candidate && socket.emit("candidate", jogadores.primeiro, candidate);
          };

          // after a new track has been added to an RTCRtpReceiver which is part of the connection
          localConnection.ontrack = ({ streams: [midias] }) => {
            console.log("MIDIAS", midias);
            audio.srcObject = midias;
          };

          localConnection
            // initiates the creation of an SDP The SDP offer includes information about any MediaStreamTrack objects already attached to the WebRTC session, codec, and options supported by the browser, and any candidates already gathered by the ICE agent
            .createOffer()
            .then((offer) => 
              //  changes the local description associated with the connection. This description specifies the properties of the local end of the connection, including the media format (session description)
              localConnection.setLocalDescription(offer)
            )
            .then(() => {
              socket.emit(
                "offer",
                jogadores.primeiro,
                localConnection.localDescription
              );
            });
        })
        .catch((error) => console.log(error));
    }

    // Os dois jogadores estão conectados
    console.log(jogadores);
  });

  // player 1 receives offer
  this.socket.on("offer", (socketId, description) => {
    remoteConnection = new RTCPeerConnection(ice_servers);
    midias
      .getTracks()
      .forEach((track) => remoteConnection.addTrack(track, midias));
    remoteConnection.onicecandidate = ({ candidate }) => {
      candidate && socket.emit("candidate", socketId, candidate);
    };
    remoteConnection.ontrack = ({ streams: [midias] }) => {
      audio.srcObject = midias;
    };
    remoteConnection
      .setRemoteDescription(description)
      .then(() => remoteConnection.createAnswer())
      .then((answer) => remoteConnection.setLocalDescription(answer))
      .then(() => {
        socket.emit("answer", socketId, remoteConnection.localDescription);
      });
  });

  // player 2 reeiver answer and then connection is established
  this.socket.on("answer", (description) => {
    localConnection.setRemoteDescription(description);
  });

  this.socket.on("candidate", (candidate) => {
    const conn = localConnection || remoteConnection;
    conn.addIceCandidate(new RTCIceCandidate(candidate));
  });

  // Desenhar o outro jogador
  this.socket.on("desenharOutroJogador", ({ frame, x, y }) => {
    if (jogador === 1) {
      player2.setFrame(frame);
      player2.x = x;
      player2.y = y;
    } else if (jogador === 2) {
      player1.setFrame(frame);
      player1.x = x;
      player1.y = y;
    }
  });
}

function update() {
  if (gameOver) {
    if (jogador === 1) player1.anims.play("turn1");
    else if (jogador === 2) player2.anims.play("turn2");
    this.physics.pause();
    return;
  }

  if (jogador === 1) {
    if (cursors.left.isDown) {
      player1.setVelocityX(-160);
      player1.anims.play("left1", true);
    } else if (cursors.right.isDown) {
      player1.setVelocityX(160);
      player1.anims.play("right1", true);
    } else {
      player1.setVelocityX(0);
      player1.anims.play("turn1");
    }
    if (cursors.up.isDown && player1.body.touching.down) {
      player1.setVelocityY(-330);
    }
    this.socket.emit("estadoDoJogador", {
      frame: player1.anims.getFrameName(),
      x: player1.body.x + 20,
      y: player1.body.y + 20,
    });
  } else if (jogador === 2) {
    if (cursors.left.isDown) {
      player2.setVelocityX(-160);
      player2.anims.play("left2", true);
    } else if (cursors.right.isDown) {
      player2.setVelocityX(160);
      player2.anims.play("right2", true);
    } else {
      player2.setVelocityX(0);
      player2.anims.play("turn2");
    }
    if (cursors.up.isDown && player2.body.touching.down) {
      player2.setVelocityY(-330);
    }
    this.socket.emit("estadoDoJogador", {
      frame: player2.anims.getFrameName(),
      x: player2.body.x + 20,
      y: player2.body.y + 20,
    });
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  //  Add and update the score
  score += 10;
  scoreText.setText("Score: " + score);

  if (stars.countActive(true) === 0) {
    //  A new batch of stars to collect
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }
}

function hitBomb(player, bomb) {
  player.setTint(0xff0000);
  gameOver = true;
}
