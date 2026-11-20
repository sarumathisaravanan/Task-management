
// Flask API URL
const API = "/tasks";

// Get HTML elements
const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");


// 1. DISPLAY ALL TASKS
async function loadTasks() {

    try {
        const response = await fetch(API);

        if (!response.ok) {
            throw new Error("Unable to load tasks");
        }

        const tasks = await response.json();

        taskList.innerHTML = "";

        tasks.forEach(task => {

            // Create task container
            const div = document.createElement("div");

            div.className = task.status === "Completed"
                ? "task completed"
                : "task";

            // Task title
            const heading = document.createElement("h3");
            heading.textContent = task.title;

            // Task description
            const description = document.createElement("p");
            description.textContent = task.description || "";

            // Task status
            const status = document.createElement("p");
            status.className = "status";
            status.textContent = "Status: " + task.status;

            // Edit button
            const editBtn = createButton("Edit", "edit", task.id);

            // Complete button
            const completeBtn = createButton(
                task.status === "Completed" ? "Undo" : "Complete",
                "complete",
                task.id
            );

            // Delete button
            const deleteBtn = createButton("Delete", "delete", task.id);

            // Add elements to task container
            div.append(
                heading,
                description,
                status,
                editBtn,
                completeBtn,
                deleteBtn
            );

            taskList.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        taskList.textContent = "Unable to load tasks. Check your server.";
    }
}


// Create buttons
function createButton(text, action, id) {

    const button = document.createElement("button");

    button.textContent = text;
    button.className = action;
    button.dataset.action = action;
    button.dataset.id = id;

    return button;
}


// 2. ADD NEW TASK
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const title = document.getElementById("title").value.trim();

    const description =
        document.getElementById("description").value.trim();

    if (!title) {
        alert("Please enter a task title");
        return;
    }

    try {
        const response = await fetch(API, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title,
                description: description
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Unable to add task");
            return;
        }

        alert("Task added successfully!");

        form.reset();

        loadTasks();

    } catch (error) {
        alert("Server connection failed");
        console.error(error);
    }
});


// 3. HANDLE EDIT, COMPLETE AND DELETE BUTTONS
taskList.addEventListener("click", async function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    try {
        // Get selected task
        const response = await fetch(API);
        const tasks = await response.json();

        const task = tasks.find(item => item.id == id);

        if (!task) {
            alert("Task not found");
            return;
        }

        // EDIT TASK
        if (action === "edit") {

            const newTitle = prompt(
                "Enter new task title:",
                task.title
            );

            if (newTitle === null) return;

            if (!newTitle.trim()) {
                alert("Task title cannot be empty");
                return;
            }

            const newDescription = prompt(
                "Enter new description:",
                task.description || ""
            );

            if (newDescription === null) return;

            await updateTask(
                id,
                newTitle.trim(),
                newDescription.trim(),
                task.status
            );
        }


        // COMPLETE OR UNDO TASK
        if (action === "complete") {

            const newStatus =
                task.status === "Completed"
                    ? "Pending"
                    : "Completed";

            await updateTask(
                id,
                task.title,
                task.description || "",
                newStatus
            );
        }


        // DELETE TASK
        if (action === "delete") {

            const confirmDelete = confirm(
                "Are you sure you want to delete this task?"
            );

            if (!confirmDelete) return;

            const deleteResponse = await fetch(`${API}/${id}`, {
                method: "DELETE"
            });

            if (!deleteResponse.ok) {
                throw new Error("Unable to delete task");
            }

            alert("Task deleted successfully!");
        }

        // Refresh task list
        loadTasks();

    } catch (error) {
        alert("Something went wrong!");
        console.error(error);
    }
});


// 4. UPDATE TASK
async function updateTask(id, title, description, status) {

    const response = await fetch(`${API}/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title: title,
            description: description,
            status: status
        })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Unable to update task");
    }

    alert("Task updated successfully!");
}


// 5. LOAD TASKS WHEN PAGE OPENS
loadTasks();
