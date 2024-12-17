import asyncio
import logging
import cv2
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaPlayer, MediaStreamTrack
from aiortc.rtsp import RTSPServer

# Set up logging
logging.basicConfig(level=logging.INFO)

class VideoStreamTrack(MediaStreamTrack):
    def __init__(self, player):
        super().__init__()
        self.player = player
        self.frame = None

    async def recv(self):
        # Get the next frame from the video player
        frame = self.player.frame
        return frame

class VideoPlayer:
    def __init__(self, video_source):
        self.cap = cv2.VideoCapture(video_source)
        if not self.cap.isOpened():
            raise ValueError("Unable to open video source")
        self.frame = None

    def get_frame(self):
        ret, frame = self.cap.read()
        if not ret:
            raise ValueError("Failed to read frame")
        # Convert to format suitable for RTSP (e.g., RGB)
        self.frame = frame

    def stop(self):
        self.cap.release()

async def run_rtsp_server():
    player = VideoPlayer(0)  # Use 0 for webcam or path to video file
    stream_track = VideoStreamTrack(player)
    
    server = RTSPServer()
    server.add_stream("video", stream_track)

    # Start RTSP server on a specific IP and port
    server_address = "127.0.0.1"
    server_port = 8554
    await server.start(server_address, server_port)
    logging.info(f"RTSP server started at rtsp://{server_address}:{server_port}")

    # Start capturing frames from the video source
    while True:
        player.get_frame()
        await asyncio.sleep(0.04)  # Sleep to match the video frame rate (approx 25 FPS)

if __name__ == "__main__":
    asyncio.run(run_rtsp_server())
