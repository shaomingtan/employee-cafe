# Test and Run App
1. Test Backend App
This command will run the integration tests for the api server
`docker build --progress=plain --no-cache -f dockerfile.test -t gic:test .`

2. Build Frontend and Backend App
This command will build the backend app, build the frontend static files and place the frontend static files to be served from the backend server
`docker build -f dockerfile.prod -t gic:prod .`

3. Run App
`docker run -it --rm -p 8000:8000 gic:prod`

4. Use App
Visit [localhost:8000](http://localhost:8000) in your browser