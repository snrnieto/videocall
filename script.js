const socket = io('https://backendvideocall.vercel.app:5000');
const videoGrid = document.getElementById('video-grid')
const textoUsuarios =document.getElementById('texto-usuarios')

const myPeer = new Peer()

var listPeers;
var myId;

const myVideo = document.createElement('video')
myVideo.muted = true

socket.on("new-user", (peers) => {
    listPeers=deleteMyId(peers,myId);
    console.log(listPeers)
    textoUsuarios.innerHTML = "<h2>Hay "+listPeers.length+" usuarios conectados</h2>"
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
    })

    var randomUser = listPeers[Math.floor(Math.random()*listPeers.length)];
    var call = myPeer.call(randomUser, stream);

    const video = document.createElement('video')

    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })




}).catch(function (e) {
    console.log("Something went wrong!");
    console.log(e)
  });

  myPeer.on('open', id => {
    socket.emit('join-room', id)
    console.log(id);
    myId=id;
  })
  
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}


function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
      video.remove()
    })
  
    peers[userId] = call
  }


  function deleteMyId(list,id){
    return list.filter(function(ele){ 
        return ele != id; 
    });
  }



