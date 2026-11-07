const socket = io();
const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
if (params.get("room")) $("room").value = params.get("room");
if (params.get("role")) $("role").value = params.get("role");

let pc = null, localStream = null, joined = false, role = "viewer", room = "";
const config = {iceServers:[{urls:"stun:stun.l.google.com:19302"}]};
function status(text){$("status").textContent=text;}
function makePeer(){
  pc = new RTCPeerConnection(config);
  pc.onicecandidate = e => {if(e.candidate) socket.emit("signal",{candidate:e.candidate});};
  pc.ontrack = e => {$("remote").srcObject = e.streams[0];};
  pc.onconnectionstatechange = () => status("Connexion : " + pc.connectionState);
}
$("join").onclick = () => {
  room = $("room").value.trim().toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,12);
  role = $("role").value;
  if(!room){status("Entre un code de salon.");return;}
  joined = true; socket.emit("join-room",{room,role});
  if(role === "camera") $("consent").hidden = false;
  status("Salon rejoint. En attente de l’autre participant.");
};
$("accept").onclick = async () => {
  try{
    // Browser will request explicit camera and microphone permission.
    localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    $("local").srcObject = localStream; $("consent").hidden = true;
    makePeer(); localStream.getTracks().forEach(track=>pc.addTrack(track,localStream));
    status("Partage démarré. Tu peux arrêter à tout moment.");
    socket.emit("signal",{ready:true});
  }catch(err){status("Autorisation refusée ou appareil indisponible : " + err.message);}
};
$("decline").onclick = () => {$("consent").hidden=true; status("Partage refusé. Aucun flux n’a démarré.");};
socket.on("peer-ready", async ({role:otherRole}) => {
  if(role==="viewer" && !pc){
    makePeer();
    status("L’autre participant est présent. En attente de son consentement au partage.");
  }
});
socket.on("signal", async data => {
  try{
    if(data.ready && role==="viewer" && pc){
      const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
      socket.emit("signal",{description:pc.localDescription});
    }
    if(data.description && pc){
      await pc.setRemoteDescription(data.description);
      if(data.description.type==="offer"){
        const answer=await pc.createAnswer(); await pc.setLocalDescription(answer);
        socket.emit("signal",{description:pc.localDescription});
      }
    }
    if(data.candidate && pc) await pc.addIceCandidate(data.candidate);
  }catch(err){status("Signalisation : "+err.message);}
});
$("chat-form").onsubmit = e => {e.preventDefault();const msg=$("message").value.trim();if(msg&&joined){socket.emit("chat-message",msg);$("message").value="";}};
socket.on("chat-message", data => {
  const div=document.createElement("div");div.className="msg";
  const time=new Date(data.time).toLocaleTimeString();
  div.textContent=`${data.sender==="camera"?"Participant caméra":"Participant visionnage"} (${time}) : ${data.text}`;
  $("messages").appendChild(div);$("messages").scrollTop=$("messages").scrollHeight;
});
$("leave").onclick = () => {
  if(localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null;}
  if(pc){pc.close();pc=null;}
  $("local").srcObject=null;$("remote").srcObject=null;
  socket.emit("leave-room");joined=false;$("consent").hidden=true;
  status("Tu as quitté le salon. Caméra et microphone arrêtés.");
};