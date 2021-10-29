const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userSession = users.find((user) => user.username === username);

  if (userSession === undefined) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = userSession;

  return next();
}

// Criar um usuário com name e username
app.post("/users", (request, response) => {
  const { name, username } = request.body;

  // verificar se usuário já existe
  const userExists = users.some((user) => user.username === username);

  if (userExists === true) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const userTodos = user.todos;

  return response.status(200).json(userTodos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(task);

  return response.status(201).json(task);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const newTitle = request.body.title;
  const newDeadline = new Date(request.body.deadline);

  let taskExists = false;
  let responseObject = {};

  user.todos.map((task) => {
    if (task.id === id) {
      (task.title = newTitle), (task.deadline = newDeadline);
      taskExists = true;
      responseObject = task;
    }
  });

  if (taskExists) {
    return response.status(201).json(responseObject);
  } else {
    return response.status(404).json({ error: "Task not found" });
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let taskExists = false;
  let responseObject = {};

  user.todos.map((task) => {
    if (task.id === id) {
      task.done = true;
      taskExists = true;
      responseObject = task;
    }
  });

  if (taskExists === true) {
    return response.status(201).json(responseObject);
  } else {
    return response.status(404).json({ error: "Task not found" });
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;
  let taskExists = false;

  user.todos.map((task) => {
    if (task.id === id) {
      const taskIndex = user.todos.indexOf(task);
      user.todos.splice(taskIndex, 1);
      taskExists = true;
    }
  });

  if (taskExists === true) {
    return response.status(204).send();
  } else {
    return response.status(404).json({ error: "Task not found" });
  }
});

module.exports = app;
