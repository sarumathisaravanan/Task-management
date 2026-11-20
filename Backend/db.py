import mysql.connector

def get_db_connection():

    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Ommuruga@11",
        database="task_management"
    )

    return connection