import './sass/main.scss';
import { TodoListManager } from './js/todoList';

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация класса управления списком задач
    TodoListManager.init();
});
