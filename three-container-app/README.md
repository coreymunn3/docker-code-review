## About This Project

A simple todo applicaiton with Vite frontend and Express backend. Designed to be run as a 3 container application using Docker.

## Container Orchestration

Now that we have seen how beneficial images, volumes, and netowrks are, wouldn't it be great if there was a way to easily and effortlessly deploy a many-container-ed project without having to intricately construct build commands for every single one? This exists, and it's called container orchestration with docker-compose.

It's very simple. You create a docker-compose.yml file, and inside that file you use a standardized pre-determined structure of keys and values to describe each container that you want to start, and in what order. At the top level are 3 keys: `version`, `services`, and `volumes`. The version is mostly unimportant and can be left as 3.8. Services is where we will start to describe the containers we want to build.

#### DB service

Let's start with the database since every other container depends on it. What we need to do is translate our last docker run command that we used to start this container, into a `service` inside this file. Here's that command for reference.
`docker run -d --name todos-db --env-file ./.env -v todos_pgdata:/var/lib/postgresql/data --network todos-net postgres:16-alpine`

- We'll continue to call this `todos-db`, and will use the same postgres image as before.
- The named volume will be carried over into the `volumes` key.
- Lastly, the env vars we will use from the .env file located in ./backend

```
services:
  # the database service will start in a container called todos-db
  todos-db:
    image: postgres:16-alpine
    volumes:
      - todos_pgdata:/var/lib/postgresql/data
    env_file:
      - ./backend/.env
```

You might be wondering why we didn't include the network anywhere in the yaml code. Docker automatically creates a named network for you when you use docker-compose so manually specifing a network is not necessary like it is when running containers manually. This is also why whe once again did not expose database ports.

#### API service

Next is the API service. Again, we can use the previous run command as a template to create a service for the API.
`docker run -d --rm --name todos-api -p 5000:5000 -v /Users/michaelmunn/Training/docker-code-review/two-container-api:/app --network todos-net todos-api`

- We can continue to call this `todos-api`
- Instead of specifying an image, we can tell docker compose to build the image and use that instead. To do that, you must tell it where to find the Dockerfile to use to build that image. Ours is found in `/backend`.
- We will expose port 5000 like before
- ...and specify our bind-mount in the volume section. But it has to be updated a bit. Instead of using an absolute path, we can use a path relative to the docker compose file, which greatly simplifies the bind mount itself - all we have to do is map everything in `./backend` to `/app`
- Then we have to add one more volume, for a specific reason. In the current local directory where the bind mount exists, after the build step in the dockerfile, everything will be copied from the bind location in my local machine into the container directory, and synced. But because we do not have `node_modules` installed locally, that means the `node_modules` folder will be overwritten in the container's /app (even _after_ the npm install step in the build step) anbd effectively deleted from the container's project folder (/app). To solve this, we can use an anonymous volume that will freeze the `node_modules` in its own volume to prevent it from being overwritten by the bind mount.
  - The reason this wasn't a problem in the simpler example, was because even though the `node_modules` fron the build was getting overwritten, we had already npm-installed locally so the overwrite yielded the exact same product as the dockerfile build step.
- Lastly, we want to state that this container depends on the database container (called todos-db) so that docker-compose will be sure to always start that container before this one. Otherwise, our db.js file will attempt to connect to a database inside a container that doesn't exsit.

```
services:
  # ...other services
  # the api service will start in a container called todos-api
    todos-api:
        build: ./backend
        ports:
          - '5000:5000'
        volumes:
          - ./backend:/app
          - /app/node_modules
        depends_on:
          - todos-db
```

#### Frontend Service

Last is the Vite/React frontend. This is a new container, but adding it to the docker compose is relatively simple and will be similar to the todos-api

- Like the backend, we want to build the image form the dockerfile located at `./frontend`
- Like the backend, we need to expose a port to see the website. We can use 4000.
- Like the backend, we want a bind mount to allow for easy development. Anything in the src folder that changes should not require us to rebuild the image, instead it should update automatically. So we will map the `./frontend/src` to `app/src`
- Next are some keys that allow the react website to work right in development mode
- And last, our frontend depends on the backend.

```
services:
  # ...other services
  # the frontend service will start in a container called frontend
    frontend:
        build: ./frontend
        ports:
          - '4000:4000'
        volumes:
          - ./frontend/src:/app/src
        stdin_open: true
        tty: true
        depends_on:
          - todos-api
```

Lastly, we just need to add any named volumes (not buind mounts) at the bottom of the file under the `volumes` section. Docker just wants you to do it like this 🤷🏻‍♂️

```
volumes:
  todos_pgdata:
```

And now, all we have to do is run `docker compose up` and navigate to the browser and hit http://localhost:4000
