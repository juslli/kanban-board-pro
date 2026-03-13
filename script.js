let draggedTaskId = null;

let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];

const clearBoardBtn = document.getElementById("clear-board");

function saveTasks() {
  localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR") + " às " + date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function updateCounters() {
  document.getElementById("count-todo").textContent =
    tasks.filter(task => task.column === "todo").length;

  document.getElementById("count-progress").textContent =
    tasks.filter(task => task.column === "progress").length;

  document.getElementById("count-done").textContent =
    tasks.filter(task => task.column === "done").length;
}

function createTaskElement(task) {
  const taskElement = document.createElement("div");
  taskElement.className = "task";
  taskElement.draggable = true;
  taskElement.dataset.id = task.id;

  taskElement.innerHTML = `
    <div class="task-top">
      <div>
        <span class="task-text">${task.text}</span>
        <span class="task-meta">Criada em ${formatDate(task.createdAt)}</span>
      </div>

      <div class="task-actions">
        <button class="edit-btn" onclick="editTask(${task.id})">✎</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">✕</button>
      </div>
    </div>
  `;

  taskElement.addEventListener("dragstart", () => {
    draggedTaskId = task.id;
    taskElement.classList.add("dragging");
  });

  taskElement.addEventListener("dragend", () => {
    taskElement.classList.remove("dragging");
  });

  return taskElement;
}

function renderTasks() {
  const columns = ["todo", "progress", "done"];

  columns.forEach(column => {
    const columnElement = document.getElementById(column);
    columnElement.innerHTML = "";

    const filteredTasks = tasks.filter(task => task.column === column);

    filteredTasks.forEach(task => {
      columnElement.appendChild(createTaskElement(task));
    });
  });

  updateCounters();
  saveTasks();
}

function addTask(column) {
  const input = document.getElementById(`${column}-input`);
  const text = input.value.trim();

  if (text === "") {
    alert("Digite uma tarefa.");
    return;
  }

  const newTask = {
    id: generateId(),
    text,
    column,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  input.value = "";
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(task => task.id === id);

  if (!task) return;

  const newText = prompt("Edite sua tarefa:", task.text);

  if (newText === null) return;

  const trimmedText = newText.trim();

  if (trimmedText === "") {
    alert("A tarefa não pode ficar vazia.");
    return;
  }

  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, text: trimmedText };
    }
    return task;
  });

  renderTasks();
}

function moveTask(taskId, newColumn) {
  tasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, column: newColumn };
    }
    return task;
  });

  renderTasks();
}

function clearBoard() {
  if (tasks.length === 0) {
    alert("Não há tarefas para limpar.");
    return;
  }

  const confirmClear = confirm("Tem certeza que deseja apagar todas as tarefas?");

  if (!confirmClear) return;

  tasks = [];
  renderTasks();
}

const taskLists = document.querySelectorAll(".task-list");

taskLists.forEach(list => {
  list.addEventListener("dragover", event => {
    event.preventDefault();
    list.classList.add("drag-over");
  });

  list.addEventListener("dragleave", () => {
    list.classList.remove("drag-over");
  });

  list.addEventListener("drop", () => {
    const newColumn = list.id;
    moveTask(draggedTaskId, newColumn);
    list.classList.remove("drag-over");
  });
});

const columns = ["todo", "progress", "done"];

columns.forEach(column => {
  const input = document.getElementById(`${column}-input`);

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      addTask(column);
    }
  });
});

clearBoardBtn.addEventListener("click", clearBoard);

renderTasks();