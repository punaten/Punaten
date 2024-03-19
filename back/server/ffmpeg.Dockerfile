# --------------> builder
FROM golang:1.22-alpine as builder

WORKDIR /src/api

COPY go.mod .
COPY go.sum .

RUN go mod download
COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server main.go


FROM jrottenberg/ffmpeg:4.4-alpine
COPY --from=builder /src/api/server /
CMD ["/server"]

