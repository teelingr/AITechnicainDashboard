import pyaudio
import wave
from datetime import datetime

def record_audio(filename='backend/data/recordings/', seconds=5, rate=16000, channels=2, format=pyaudio.paInt16):
    p = pyaudio.PyAudio()

    # Open the stream
    stream = p.open(format=format,
                    channels=channels,
                    rate=rate,
                    input=True,
                    frames_per_buffer=1024)

    print("Recording...")

    frames = []

    for i in range(0, int(rate / 1024 * seconds)):
        data = stream.read(1024)
        frames.append(data)

    print("Recording finished.")

    stream.stop_stream()
    stream.close()

    p.terminate()

    current_datetime = datetime.now()
    filename = filename + f'{current_datetime.strftime("%Y%m%d_%H%M%S")}.wav'
    print("filename: ", filename)

    wf = wave.open(filename, 'wb')
    wf.setnchannels(channels)
    wf.setsampwidth(p.get_sample_size(format))
    wf.setframerate(rate)
    wf.writeframes(b''.join(frames))
    wf.close()

    print(f"Saved recording to {filename}")

record_audio()