## About this Project

This is a simple express API with full CRUD endpoints that can perform operations against a locally run postgres database.

## Getting Started

1. First we need a database. Start the Database locally: using name "todos-db" and using env variables from the file found at ./.env & mapping port 5432 of the local machine to port 5432 of the container. The base image for this container will be the postgres:16-alpine image found on Docker Hub (which is why we don't need to build the image locally - it already exists on the internet!)
   `docker run -d --name todos-db --env-file ./.env -p 5432:5432 postgres:16-alpine`
   After starting this DB, we can connect to it locally using PSQL, but of course there's nothing in there yet.
   `psql -h localhost -p 5432 -U admin -d todos`

2. Run the API locally
   `npm start`

It runs locally, but in order to have it run in the container, we will need to update some of the db configs in db.js. Update this:

```
{
    host: "localhost",
    port: 5432,
    dialect: "postgres",
  }
```

To:

```
{
   host: "host.docker.internal",
   port: 5432,
   dialect: "postgres",
 }
```

This is required because we need to access the docker container's internal host address, which may not be the same as the usual host address, 127.0.0.1 3. Build the API image
`docker build -t todos-api .` 4. Start the API locally: in daemon mode, using container name "todos-api", mapping local port 5000 to the container port 5000, and using the image named "todos-api"
`docker run -d --rm --name todos-api -p 5000:5000 todos-api` 5. Test the API using Postman.

## Volumes & Bind Mounts

We can now interact with the api which communicated directly with the database. But, we have a problem. If we shut down the database and restart it, we lose our data. The data is not persistent. To persist data, we must creat a **volume** in the database container. When a volume is created, the data in the path specified in the volume will be preserved even after the container is shut down.
Demonstrate using PSQL.

remove the **todos-db** container and the **todos-api** container. Then: 6. Restart the database container, same as before but this time using a volume
`docker run -d --name todos-db --env-file ./.env -p 5432:5432 -v todos_pgdata:/var/lib/postgresql/data postgres:16-alpine`
This volume is called todos_pgdata 7. Restart the API container, same as before
`docker run -d --rm --name todos-api -p 5000:5000 todos-api` 8. Now we can create some Todos using postman, and if we shut down the DB container and restart it again, we will see that the data has persisted.
`psql -h localhost -p 5432 -U admin -d todos`
`select * from todos;`

There are 3 types of volumes:

- **named volumes** (what we just did)
- **anonymous volumes** - these have limited use cases
- **bind mounts** - mount a file or directory onto your container from your host machine, which you can then reference via its absolute path. The source directory on your local machine and the mounted directory inside the container will act as one, any changes on either side of the equation will be propagated to the otherside (unless a read only bind mount is specified). This can be a very useful tool for development inside a docker container.

Currently, if we change some part of the API, we would have to re-build the image to see that change persisted. Demonstrate: Update the /test endpoint to return a different message. Notice how it doesn't change inside the container?

Lets add a bind mount to the API container so that we can change the api in real time and see those changes propagate through the container without having to rebuild the image. 9. Stop the APi container (it will be automatically removed) And re-run it with this command
`docker run -d --rm --name todos-api -p 5000:5000 -v /Users/michaelmunn/Training/docker-code-review/two-container-api:/app todos-api`
Now, when we update the /test endpoint again, we will see that automatically update in the container without having to rebuild the image.

## Networks

Why do we need networks? To allow smooth inter-container communnication. Ideally, your containers should be able to speak to each other without having that communication travel through a third party, like the localhost.

We can easily create a network for our containers with docker.
`docker network create todos-net`

Now when we run containers, we can simple add the `--network` flag and specify which network the containers belong in. This is useful because it allos us to reference the containers inside the network by name, and as a result, docker will automatically internally resolve the IP of the container for you. It makes constructing database URI's, for example, very easy.

10. Stop and remove all containers. Re-run the database container using this update command that adds the db container to the new todos-net network. We also remove the exposed port of 5432 because we don't need to access it through the localhost anymore!
    `docker run -d --name todos-db --env-file ./.env -v todos_pgdata:/var/lib/postgresql/data --network todos-net postgres:16-alpine`

Now we need to restart our API container, and add it to the network we created. But there's one thing we should do before we do that. Back in the db config file (db.js) we need to update the host again. Typically, if this Database were deployed somewhere on the internet, we would use the IP address here. But since it's all going to be part of the same network, docker will resolve that IP address for us and instead we can use the name of the db container.

```
{
    host: "host.docker.internal",
    port: 5432,
    dialect: "postgres",
}
```

Update to

```
{
    host: "todos-db",
    port: 5432,
    dialect: "postgres",
}
```

11. Now we can restart the API container inside the todos-net network. Notice that we don't have to rebuild the image because we are using a bind-mount and that db file updated automatically. Also note, we continue to expose port 5000 for this container, because since this is the API we still need a way to reach it via postman.
    `docker run -d --rm --name todos-api -p 5000:5000 -v /Users/michaelmunn/Training/docker-code-review/two-container-api:/app --network todos-net todos-api`
    Now, we can still hit endpoints and get data via postman even though the db ports are not exposed, because the containers are communicating with each other behind the scenes.
