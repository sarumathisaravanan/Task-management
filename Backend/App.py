

from flask import Flask, request, jsonify, send_from_directory
from db import get_db_connection
import os

# Get frontend folder path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(
    os.path.join(BASE_DIR, "..", "Frontend")
)

# Create Flask application
app = Flask(
    __name__,
    static_folder=FRONTEND_DIR,
    static_url_path=""
)


# Home page
@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


# 1. DISPLAY ALL TASKS
@app.route("/tasks", methods=["GET"])
def get_tasks():

    con = get_db_connection()
    cursor = con.cursor(dictionary=True)

    cursor.execute("SELECT * FROM tasks ORDER BY id DESC")
    tasks = cursor.fetchall()

    cursor.close()
    con.close()

    return jsonify(tasks)


# 2. ADD NEW TASK
@app.route("/tasks", methods=["POST"])
def add_task():

    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid request"}), 400

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()

    if not title:
        return jsonify({"error": "Task title is required"}), 400

    con = get_db_connection()
    cursor = con.cursor()

    cursor.execute(
        "INSERT INTO tasks (title, description) VALUES (%s, %s)",
        (title, description)
    )

    con.commit()

    task_id = cursor.lastrowid

    cursor.close()
    con.close()

    return jsonify({
        "message": "Task added successfully",
        "id": task_id
    }), 201


# 3. UPDATE TASK
@app.route("/tasks/<int:id>", methods=["PUT"])
def update_task(id):

    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid request"}), 400

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    status = data.get("status", "Pending")

    if not title:
        return jsonify({"error": "Task title is required"}), 400

    if status not in ["Pending", "Completed"]:
        return jsonify({"error": "Invalid task status"}), 400

    con = get_db_connection()
    cursor = con.cursor()

    cursor.execute(
        """
        UPDATE tasks
        SET title = %s, description = %s, status = %s
        WHERE id = %s
        """,
        (title, description, status, id)
    )

    updated = cursor.rowcount

    con.commit()

    cursor.close()
    con.close()

    if updated == 0:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"message": "Task updated successfully"})


# 4. DELETE TASK
@app.route("/tasks/<int:id>", methods=["DELETE"])
def delete_task(id):

    con = get_db_connection()
    cursor = con.cursor()

    cursor.execute(
        "DELETE FROM tasks WHERE id = %s",
        (id,)
    )

    deleted = cursor.rowcount

    con.commit()

    cursor.close()
    con.close()

    if deleted == 0:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"message": "Task deleted successfully"})


# RUN FLASK APPLICATION
if __name__ == "__main__":
    app.run(debug=True)
