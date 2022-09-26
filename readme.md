# Design Considerations
## Express server to serve both frontend and backend app
I opted to use a single express server to serve both the frontend and the backend app. 
As such the docker build process will first build the static files for the frontend react app before copying it into the final docker image of the backend app.
This ensures that the final docker image is as small as it can be while also reducing the amount of servers required to deploy the app

## Performance of GET cafe and employee endpoints
- I added an index to the cafe's location column since there's a need to filter cafes by location.
- I also added an index to the employee's cafeId column as we need to count the number of employee's working in a cafe.
- I manually load tested with 1000 cafes and 10000 employees working per cafe and the GET cafe requests takes about 2seconds to return. 
  - You can test this by modifying the `cafesToCreate` value in the `seeders/*-seed-cafe.js` and the `employeesToCreatePerCafe` value in the `seeders/*-seed-employees.js`
  - After editing the values, do rebuild the image.

## If I had more time I would have:
- Set up environment variables properly with a tool like `dotenv` to configure the various environments properly
- Used typescript
- Set up linting and prettier
- Implemented the logic for employee identifier
- Added frontend tests
- DRYed up more code

# Test and Run App
1. Test Backend App
This command will run the integration tests for the backend api server
`docker build --progress=plain --no-cache -f dockerfile.test -t gic:test .`

2. Build Frontend and Backend App
This command will build the backend app, build the frontend static files and place the frontend static files to be served from the backend server
`docker build -f dockerfile.prod -t gic:prod .`

3. Run App
`docker run -it --rm -p 8000:8000 gic:prod`

4. Use App
Visit [localhost:8000](http://localhost:8000) in your browser