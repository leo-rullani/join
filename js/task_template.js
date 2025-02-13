function createTaskTemplate(task) {
  return `
        <div class="task">
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>Assigned to: ${task.assignees.join(", ")}</p>
            <p>Due date: ${task.date}</p>
            <p>Priority: ${task.priority}</p>
        </div>
    `;
}
