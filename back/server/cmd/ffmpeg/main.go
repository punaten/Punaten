package main

import (
	ffmpeg "github.com/u2takey/ffmpeg-go"
)

func main() {
	v1 := ffmpeg.Input("./../../happy_happy.mp4")
	v2 := ffmpeg.Input("./../../edm.mp4")

	streams := []*ffmpeg.Stream{
		v1.Video(),
		v1.Audio(),
		v2.Video(),
		v2.Audio(),
	}

	ffmpeg.Concat(streams).Output("./../../output.mp4").Run()
}
