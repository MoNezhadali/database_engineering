# Twitter System Design

We want three functionalities:
- Post tweets with `140` characters.
- Follow People
- Timeline

Some notes:
Let's say your twitter application has the following design:
- Client (on the phone of the user)
- Backend (Receving requests from client, e.g. `POST`, ...)
- Database (We use `PostgreSQL`)
- Queueing system (to temporarily store the tweets before they are persisted e.g. using `Kafka`, `RabbitMQ`)
- A connection pooling (in order to avoid connecting to the database everytime)
- Small database on the client side (to save tweets if the TCP connection fails while tweeting, e.g `SQLite`)
- Loadbalancers and multiplying the backend servers (sometimes you can also implement client-level load-balancer, e.g. `Netflix`)

A note on networking:
- TCP is the postal service ensuring the letter gets delivered reliably and in order. `Layer 4`
- TLS is the envelope and seal that encrypts and protects the contents. `Layer 5`
- HTTP is the actual letter inside, written in a readable format. `Layer 7`

Another note:
- You can use both `Layer 4` and `Layer 7` load-balancers. In `Layer 4` you decide based on `IP address`, `TCP` or `UDP` port, etc. In `Layer 7` load-balancers you can decide based on `URL` path, `headers`, `cookies,` etc. `NginX` can do both.
- If it is implemented at `Layer 7`, it can be count as `reverse proxy`. At `Layer 4` it only forwards the messages to the servers.
