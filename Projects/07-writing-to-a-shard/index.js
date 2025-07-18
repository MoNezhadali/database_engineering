const app = require('express')();
const {Client} = require("pg");
const crypto = require("crypto");
const HashRing = require("hashring");
const hr = new HashRing();

hr.add("5432");
hr.add("5433");
hr.add("5434");

const clients = {
    "5432": new Client({
        host: "localhost",
        port: "5432",
        user: "postgres",
        password: "your_password",
        database: "my_database",
    }),
    "5433": new Client({
        host: "localhost",
        port: "5433",
        user: "postgres",
        password: "your_password",
        database: "my_database",
    }),
    "5434": new Client({
        host: "localhost",
        port: "5434",
        user: "postgres",
        password: "your_password",
        database: "my_database",
    })
}

connectClients();

async function connectClients() {
    for (const key in clients) {
        try {
            await clients[key].connect();
            console.log(`Connected to PostgreSQL on port ${key}`);
        } catch (error) {
            console.error(`Error connecting to PostgreSQL on port ${key}:`, error);
        }
    }
}

app.get('/:urlId', async (req, res) => {
    //http://localhost:8081/fhy2h
    const urlId = req.params.urlId;
    // consistently hash the URL ID to determine the shard
    const server = hr.get(urlId);
    // This is prone to SQL injection. Be careful!!
    const result = await clients[server].query(
        "SELECT URL FROM URL_TABLE WHERE URL_ID = $1",
        [urlId]
    )
    if (result.rowCount > 0) {
        res.send(
            {
                "urlId": urlId,
                "url": result.rows[0].url,
                "server": server
            }
        )
    } else {
        res.sendStatus(404).send({
            "error": "URL not found"
        });
    }
});

app.post("/", async (req, res) => {
    const url = req.query.url;
     // consistently hash the URL to determine the shard
    const hash = crypto.createHash("sha256").update(url).digest("base64");
    const urlId = hash.substring(0, 5);
    const server = hr.get(urlId);

    await clients[server].query(
        "INSERT INTO URL_TABLE (URL, URL_ID) VALUES ($1, $2)",
        [url, urlId]
    );
    res.send({
        "urlId": urlId,
        "url": url,
        "server": server

    }
    )
})

app.listen(8081, () => console.log("Server is running on port 8081"));