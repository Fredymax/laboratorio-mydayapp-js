import "./css/base.css";
import "./css/styles.css";

import { getFilterFromHash } from "./js/utils";
import { useLocalStorage, KEYWORDS } from "./js/store";

const { value, setItem } = useLocalStorage("mydayapp-js", []);

let TASKS = [...value];

const $mainContainer = document.querySelector("#main");
const $footerContainer = document.querySelector("#footer");
const $todoListContainer = document.querySelector(".todo-list");
const $inputNewTodo = document.querySelector(".new-todo");
const $todoCount = document.querySelector(".todo-count");
const $btnClearCompleted = document.querySelector(".clear-completed");
const $filters = document.querySelectorAll(".filters a");

startApp();

function startApp() {
  renderTasks();
  handleChangeHash(window.location.hash);
}

function verifyHasTasks() {
  const action = !!TASKS.length ? "remove" : "add";
  $mainContainer.classList[action]("hidden");
  $footerContainer.classList[action]("hidden");
}

function setCounter() {
  let pendingTasks = TASKS.filter((c) => !c.completed).length;
  let itemText = pendingTasks == 1 ? "item" : "items";
  const html = document
    .createRange()
    .createContextualFragment(
      `<strong>${pendingTasks}</strong> ${itemText} left`
    );
  $todoCount.replaceChildren(html);
}

function renderTasks() {
  verifyHasTasks();
  if (!TASKS.length) return;
  $todoListContainer.innerHTML = "";
  TASKS.forEach((task) => {
    const template = templateTask(task);
    $todoListContainer.append(template);
  });
  setCounter();
}

function updateTask(taskId, newValue) {
  const currentTask = TASKS.find((c) => c.id === taskId);
  const currentIndex = TASKS.findIndex((c) => c.id === taskId);
  TASKS.splice(currentIndex, 1, {
    ...currentTask,
    ...newValue,
  });
  setItem(TASKS);
  renderTasks();
}

function deleteTask(taskId) {
  const index = TASKS.findIndex((c) => c.id === taskId);
  TASKS.splice(index, 1);
  setItem(TASKS);
  renderTasks();
}

function editTask(taskId) {
  $todoListContainer.querySelectorAll("li").forEach(($li) => {
    $li.classList.remove("editing");
    $li.children[0].classList.remove("hidden");
  });

  const $taskContainer = document.querySelector(`[data-id='${taskId}']`);
  $taskContainer.classList.add("editing");

  const [$taskView, $inputTask] = $taskContainer.children;
  $taskView.classList.add("hidden");
  $inputTask.focus();
}

function handleEventTaskEdit({ code }, taskId) {
  if (!Object.values(KEYWORDS).includes(code)) return;

  const $taskContainer = document.querySelector(`[data-id='${taskId}']`);
  const [$taskView, $inputValue] = $taskContainer.children;

  $taskContainer.classList.remove("editing");
  $taskView.classList.remove("hidden");

  if (code === KEYWORDS.ENTER)
    updateTask(taskId, { title: $inputValue.value.trim() });
  else renderTasks();
}

function templateTask({ id, title, completed }) {
  const $taskContainer = document.createElement("li");
  if (completed) $taskContainer.classList.add("completed");
  $taskContainer.setAttribute("data-id", id);

  const $taskView = document.createElement("div");
  $taskView.classList.add("view");

  const $taskInputCheckbox = document.createElement("input");
  $taskInputCheckbox.setAttribute("type", "checkbox");
  $taskInputCheckbox.classList.add("toggle");
  if (completed) $taskInputCheckbox.setAttribute("checked", "true");
  $taskInputCheckbox.addEventListener("change", () =>
    updateTask(id, { completed: !completed })
  );

  const $taskLabel = document.createElement("label");
  $taskLabel.textContent = title;
  $taskLabel.addEventListener("dblclick", () => editTask(id));

  const $taskButton = document.createElement("button");
  $taskButton.classList.add("destroy");
  $taskButton.addEventListener("click", () => deleteTask(id));

  $taskView.append($taskInputCheckbox, $taskLabel, $taskButton);

  const $taskInput = document.createElement("input");
  $taskInput.classList.add("edit");
  $taskInput.value = title;
  $taskInput.addEventListener("keyup", (ev) => handleEventTaskEdit(ev, id));
  $taskInput.addEventListener("blur", () =>
    handleEventTaskEdit({ code: KEYWORDS.ESCAPE }, id)
  );

  $taskContainer.append($taskView, $taskInput);
  return $taskContainer;
}

function addTaskToList(newTask) {
  TASKS.push(newTask);
  setItem(TASKS);
  renderTasks();
  $inputNewTodo.value = "";
}

$inputNewTodo.addEventListener("keyup", (ev) => {
  const { key, target } = ev;
  if (key !== KEYWORDS.ENTER) return;
  const title = target.value.trim();
  if (!title.length) return;
  addTaskToList({
    id: crypto.randomUUID(),
    title,
    completed: false,
  });
});

$btnClearCompleted.addEventListener("click", () => {
  if (!TASKS.filter((c) => c.completed).length) return;
  TASKS = TASKS.filter((c) => !c.completed);
  setItem(TASKS);
  renderTasks();
});

function handleChangeHash(hash = "/") {
  const filter = getFilterFromHash(hash);

  $filters.forEach(($filter) => {
    $filter.classList.remove("selected");
    if (getFilterFromHash($filter.hash) == filter) {
      $filter.classList.add("selected");
    }
  });

  switch (filter) {
    case "completed":
      Array.from($todoListContainer.children).forEach(($children) => {
        if (!$children.classList.contains("completed")) {
          $children.classList.add("hidden");
        } else {
          $children.classList.remove("hidden");
        }
      });
      break;
    case "pending":
      Array.from($todoListContainer.children).forEach(($children) => {
        if ($children.classList.contains("completed")) {
          $children.classList.add("hidden");
        } else {
          $children.classList.remove("hidden");
        }
      });
      break;
    default:
      Array.from($todoListContainer.children).forEach(($children) => {
        $children.classList.remove("hidden");
      });
      break;
  }
}

window.addEventListener("hashchange", () =>
  handleChangeHash(window.location.hash)
);
