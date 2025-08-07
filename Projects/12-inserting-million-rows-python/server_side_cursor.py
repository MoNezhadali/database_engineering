import psycopg2
from datetime import datetime
con = psycopg2.connect(
    host="localhost",
    database="mone_db",
    user="postgres",
    password="postgres",
)

# Server-side cursor
# When you give it a name, it becomes a server-side cursor
start_time = datetime.now()
cur = con.cursor(name="server_cursor")
end_time = datetime.now()
print(f"Time taken to create cursor: {end_time - start_time}")

# measure time taken to execute the query
start_time = datetime.now()
cur.execute("select * from employees")
end_time = datetime.now()
print(f"Time taken to execute query: {end_time - start_time}")

# measure time taken to fetch rows
start_time = datetime.now()
rows = cur.fetchmany(50)
end_time = datetime.now()
print(f"Time taken to fetch rows: {end_time - start_time}")

cur.close()
con.close()

"""
NOTE: The numbers below are converted to milliseconds.

These are the times recorded for the server-side cursor:
Time taken to create cursor: 0.02 ms
Time taken to execute query: 3.6 ms
Time taken to fetch rows: 2.01 ms

Hence the operation is performed lazily.
"""
