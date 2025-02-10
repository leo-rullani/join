function initBoard() {
    console.log("Board initialized");
    loadTasks();
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    let data = event.dataTransfer.getData("text");
    let draggedTask = document.getElementById(data);
    event.target.appendChild(draggedTask);
}

function loadTasks() {
    let tasks = [
        { id: "task1", text: "Task 1", column: "todo" },
        { id: "task2", text: "Task 2", column: "doing" }
    ];

    tasks.forEach(task => {
        let taskElement = document.createElement("div");
        taskElement.id = task.id;
        taskElement.className = "task";
        taskElement.draggable = true;
        taskElement.ondragstart = drag;
        taskElement.innerText = task.text;

        document.getElementById(task.column).querySelector(".task_list").appendChild(taskElement);
    });
}