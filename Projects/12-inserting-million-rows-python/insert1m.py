import psycogp2


con = psycogp2.connect(
    host="localhost",
    database="mone_db",
    user="postgres",
    password="postgres",
)

cur = con.cursor()

for i in range(1000000):
    cur.execute(
        "INSERT INTO employees (id, name) VALUES (%s, %s)",
        (i, f"Name {i}"),
    )

con.commit()
con.close()
