# STAGE 1: MODULES CACHING
FROM golang:1.21-alpine AS modules
WORKDIR /modules
COPY go.mod go.sum ./
RUN go mod download

# STAGE 2 : BUILDER
FROM golang:1.21-alpine AS builder
COPY --from=modules /go/pkg /go/pkg
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/shorter ./cmd/api

# STAGE 3 : RUNNER
FROM scratch
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /bin/shorter /shorter
EXPOSE 8080
ENTRYPOINT [ "/shorter" ]