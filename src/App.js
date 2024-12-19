import { useState, useRef, useEffect } from 'react';
import './App.css';



function App() {
  const constraints = { video: true, audio: true };
  const [stream, setStream] = useState(null)
  const [isPlyaing, setIsPlaying] = useState(false)

  const videoRef = useRef(null);

  const createCall = async () => {
    const peerConnection = await CreatePeerConnection();
    console.log(peerConnection);

    // Add a data channel to trigger ICE gathering
    // peerConnection.createDataChannel('testChannel');
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        peerConnection.addTrack(track, stream)

      })
    }


    // Create and set an offer
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log('Offer created and set:', offer);
    } catch (error) {
      console.log(error)
    }



  };

  const CreatePeerConnection = () => {
    return new Promise(async (resolve, reject) => {
      const peerConfiguration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      };

      try {
        const peerConnection = await new RTCPeerConnection(peerConfiguration);

        // Add an ICE candidate event listener
        peerConnection.onicecandidate = (e) => {
          console.log(e.candidate, '***ICE Candidate');
          if (!e.candidate) {
            console.log('ICE gathering complete');
          }
        };

        resolve(peerConnection);
      } catch (error) {
        console.error('Error creating RTCPeerConnection:', error);
        reject(error);
      }
    });
  };

  // createCall();








  async function getMedia(constraints) {
    let mediaStream = null;
    try {
      const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
      console.log(supportedConstraints, '***c')
      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      const tracks = mediaStream.getTracks();
      tracks.forEach((track) => {
        console.log(track.getCapabilities(), '***t')

      })

    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
    return mediaStream;
  }

  const handleGetPermission = async () => {
    const str = await getMedia(constraints);
    str && setStream(str)
  };

  const handleStopVideo = (stream) => {
    if (!!stream && !videoRef.current.paused) {
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
      setStream(null)
      setIsPlaying(false)
    }
  }

  const handleStartVideo = (stream) => {
    if (stream) {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsPlaying(true)
      }
    }
  }


  return (
    <div className="p-2 bg-gray-200 h-screen text-white">
      <div className="flex gap-4 mb-2">
        <button
          className={`${!stream ? 'bg-slate-600 hover:bg-slate-800' : 'bg-slate-400'} px-4 py-2 rounded-md  duration-200`}
          disabled={!!stream}
          onClick={handleGetPermission}
        >
          Get Permission
        </button>

        <button
          className={`${(isPlyaing === false && !!stream) ? 'bg-slate-600 hover:bg-slate-800' : 'bg-slate-400'} px-4 py-2 rounded-md  duration-200`}
          disabled={!(isPlyaing === false && !!stream)}
          onClick={() => handleStartVideo(stream)}
        >
          Start Video
        </button>
        <button
          className={`${isPlyaing ? 'bg-slate-600 hover:bg-slate-800' : 'bg-slate-400'} px-4 py-2 rounded-md  duration-200`}
          disabled={!isPlyaing}
          onClick={() => handleStopVideo(stream)}
        >
          Stop Video
        </button>

        <button
          className={`bg-slate-600 hover:bg-slate-800 px-4 py-2 rounded-md  duration-200`}
          // disabled={ }
          onClick={() => { createCall() }}
        >
          generate Ice Candidate
        </button>
      </div>

      <div>
        {
          !!stream && <video
            ref={videoRef}
            width="320"
            height="240"
            autoPlay
            muted
          />
        }
      </div>
    </div>
  );
}

export default App;
