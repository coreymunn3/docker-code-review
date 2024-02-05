## About This Project

This is a very simple node/express api that can reach out to jsonplaceholder.com for a list of Posts or a single post, given the post ID.

## Docker Commands

1. build the image from the dockerfile, naming the image "single-container"
   `docker build -t single-container .`

2. start a new container called "single-container-api" using the image named "single-container" in daemon mode mapping port 5000 of the local machine to port 5000 of the container & remove the container on shut down.
   `docker run -d --rm -p 5000:5000 --name single-container-api single-container`
