//const url= 'http://192.168.1.10:5000/';
const url = 'https://language-videocall.herokuapp.com';

var socket = io(url, { transports: ['websocket', 'polling', 'flashsocket'] });
const videoGrid = document.getElementById('video-grid')
const textoUsuarios =document.getElementById('texto-usuarios')

const myPeer = new Peer()

var listPeers;
var myId;
var idUser;

const myVideo = document.createElement('video')
myVideo.muted = true

socket.on("peers", (peers) => {
  listPeers=deleteMyId(peers,myId);
  console.log(listPeers)
  textoUsuarios.innerHTML = "<h2>Hay "+listPeers.length+" usuarios conectados</h2>"
});

socket.on('user-disconnected', socketId => {
  console.log("Usuario desconectado "+socketId)
  console.log("ID Usuario: "+idUser);

  if (idUser==socketId){
    console.log("Eliminar video")
    videoGrid.removeChild(videoGrid.lastChild);
    
  }
})

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)

        var user = listPeers.filter(obj => {
          return obj.peer === call.peer
        })[0]

        console.log(user)

        idUser = user.socket_id;
        console.log("ID USER:"+idUser)
        const video = document.createElement('video')

        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })

    })

    if(listPeers!=undefined){
      if(listPeers.length>0){
        var randomUser = listPeers[Math.floor(Math.random()*listPeers.length)];
        idUser = randomUser;
        connectToNewUser(randomUser,stream)
        console.log("Conectado: ")
      }
    }


}).catch(function (e) {
    console.log("Something went wrong!");
    console.log(e)
  });


  

myPeer.on('open', id => {
  socket.emit('new-user', id)
  console.log(id);
  myId=id;
})

function connectToNewUser(user, stream) {
    var userPeer = user.peer
    const call = myPeer.call(userPeer, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })

}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
      video.play()
  })
  videoGrid.append(video)
}


  function deleteMyId(list,id){
    return list.filter(function(el) { return el.peer != id; }); 
  }
