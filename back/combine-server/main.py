from fastapi import FastAPI
from fastapi.responses import FileResponse
from moviepy.editor import VideoFileClip, concatenate_videoclips
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment


app = FastAPI()

origins = [
    "*", # すべてのドメインからのアクセスを許可
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
async def index():
    return {'message': 'Hello World'}

@app.get('/combine/{VIDEO_1_PATH}/{VIDEO_2_PATH}/{VIDEO_3_PATH}')
def combine_videos(VIDEO_1_PATH: str, VIDEO_2_PATH: str, VIDEO_3_PATH: str):
    # 動画ファイルを読み込む
    clip1 = VideoFileClip("./video/" +  VIDEO_1_PATH)
    clip2 = VideoFileClip("./video/" + VIDEO_2_PATH)
    clip3 = VideoFileClip("./video/" + VIDEO_3_PATH)
    
    # 動画を結合する
    final_clip = concatenate_videoclips([clip1, clip2, clip3])
    
    # 結合した動画をファイルに出力する
    output_path = './combined_video.mp4'
    final_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
    
    # FastAPIのFileResponseを使用して結合した動画ファイルをクライアントに送信
    return FileResponse(output_path)

@app.get('/combine/mp3/{VIDEO_1_PATH}/{VIDEO_2_PATH}/{VIDEO_3_PATH}')
def combine_mp3(VIDEO_1_PATH: str, VIDEO_2_PATH: str, VIDEO_3_PATH: str):
    # 曲1の読み込み
    af1 = AudioSegment.from_mp3("./mp3/" +  VIDEO_1_PATH)

    # 曲2の読み込み
    af2 = AudioSegment.from_mp3("./mp3/" + VIDEO_2_PATH)

    # 曲3の読み込み
    af3 = AudioSegment.from_mp3("./mp3/" + VIDEO_3_PATH)


    # 4つの曲を連結する
    af = af1 + af2 + af3
    af.export("concat.mp3", format="mp3")

    return FileResponse("concat.mp3")