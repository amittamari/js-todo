'use strict';

//Task input and list group container DOM nodes
const listGroup = document.querySelector('.list-group');
const taskInput = document.querySelector('.form-control');

//Obj methods impl for local storage
Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function (key) {
    const value = this.getItem(key);
    return value && JSON.parse(value);
};

//For task UUID
const guidGenerator = () => {
    const S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
};

//Local storage logic
const addTaskToDB = (taskId, taskDto) => {
    localStorage.setObject(taskId, taskDto);
};

const updateTaskInDB = (taskId, status) => {
    const taskDto = localStorage.getObject(taskId);
    localStorage.setObject(taskId, { title: taskDto.title, done: status });
};

const removeTaskFromDb = (taskId) => {
    localStorage.removeItem(taskId);
};

//Components
const createTaskParent = (taskId) => {
    const taskParent = document.createElement('label');
    taskParent.classList.add('list-group-item');
    taskParent.setAttribute('task-id', taskId);

    return taskParent;
};

const createDeleteBtn = () => {
    const taskDelBtn = document.createElement('button');
    taskDelBtn.classList.add('btn', 'btn-outline-danger', 'float-end', 'btn-sm');
    taskDelBtn.innerText = 'Delete';
    taskDelBtn.addEventListener('click', (e) => {
        const taskParent = e.target.parentElement;
        const taskId = taskParent.getAttribute('task-id');
        removeTaskFromDb(taskId);
        taskParent.remove();
    });

    return taskDelBtn;
};

const createCheckbox = (taskDto, taskId) => {
    //Create checkbox node and add bootstrap styles
    const taskCheckbox = document.createElement('input');
    taskCheckbox.setAttribute('type', 'checkbox');
    taskCheckbox.classList.add('form-check-input', 'me-1');

    //Mark cb as checked if taskDto.done === true
    taskCheckbox.checked = taskDto.done;

    taskCheckbox.addEventListener('change', (e) => {
        const status = e.target.checked;
        updateTaskInDB(taskId, status);
    });

    return taskCheckbox;
};

const createTitle = (title) => {
    const taskTitle = document.createElement('span');
    taskTitle.innerText = title;
    taskTitle.classList.add('task-title', 'ms-1');

    return taskTitle;
};

const sortTasks = () => {
    const keys = Object.keys(localStorage);
    const sorted = keys.sort((a, b) => {
        const objA = localStorage.getObject(a);
        const objB = localStorage.getObject(b);
        if (objA.title > objB.title) return 1;
        else return -1;
    });
    return sorted.reverse();
};

const addTaskToUI = (taskId) => {
    const taskDto = localStorage.getObject(taskId);
    //Task parent (label element)
    const taskParent = createTaskParent(taskId);

    //Checkbox
    const taskCheckbox = createCheckbox(taskDto, taskId);

    //Title
    const taskTitle = createTitle(taskDto.title);

    //Delete btn
    const deleteBtn = createDeleteBtn();

    //Append checkbox, title and delete button to parent label
    taskParent.append(taskCheckbox, taskTitle, deleteBtn);

    //Insert the new task at the top of the list
    listGroup.insertBefore(taskParent, listGroup.firstChild);

    //Reset input
    taskInput.value = '';
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && taskInput.value.length > 0) {
        const taskData = {
            title: taskInput.value,
            done: false,
        };
        const taskId = guidGenerator();
        addTaskToDB(taskId, taskData);
        addTaskToUI(taskId);
    }
});

window.onload = () => {
    const storedTasks = sortTasks();
    if (storedTasks.length > 0) {
        storedTasks.forEach((id) => addTaskToUI(id));
    }
};
