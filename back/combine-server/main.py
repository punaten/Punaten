from fastapi import FastAPI
from fastapi.responses import FileResponse
from moviepy.editor import VideoFileClip, concatenate_videoclips
from fastapi.middleware.cors import CORSMiddleware

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

@app.get('/combine/{VIDEO_1_PATH}/{VIDEO_2_PATH}/{VIDEO_3_PATH}/{VIDEO_4_PATH}')
def combine_videos(VIDEO_1_PATH: str, VIDEO_2_PATH: str, VIDEO_3_PATH: str, VIDEO_4_PATH: str):
    # 動画ファイルを読み込む
    clip1 = VideoFileClip("./video/" +  VIDEO_1_PATH)
    clip2 = VideoFileClip("./video/" + VIDEO_2_PATH)
    clip3 = VideoFileClip("./video/" + VIDEO_3_PATH)
    clip4 = VideoFileClip("./video/" + VIDEO_4_PATH)
    
    # 動画を結合する
    final_clip = concatenate_videoclips([clip1, clip2, clip3, clip4])
    
    # 結合した動画をファイルに出力する
    output_path = './combined_video.mp4'
    final_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
    
    # FastAPIのFileResponseを使用して結合した動画ファイルをクライアントに送信
    return FileResponse(output_path, media_type='video/mp4', filename='combined_video.mp4')
