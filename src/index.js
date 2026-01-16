import './sass/main.scss';
import { TodoList } from './js/todoList';
import { getControls } from './js/utils';
import { initEvents } from './js/events';
import { updateInterface } from './js/ui';

// Константы
export const Constants = {
    TIME_DBL_TOUCH: 300, // время ожидания второго касания
    SCROLL_Y_PANEL: 510, // максимальная позиция скролла (px), при которой панель не фиксирована
    SCROLL_Y_PANEL_HIDDEN: 530, // максимальная позиция скролла (px), при которой панель управления скрывается
};

export let controls = {};
export let todoList = null;

// Селекторы элементов
const selectors = {
    inputAddTask: { selector: '#input-add-task' }, // поле ввода новой задачи
    panelControls: { selector: '#panel-controls' }, // блок с элементами управления
    panelInner: { selector: '#panel-inner' }, // внутренний блок панели с элементами управления

    // радиокнопки
    radioButtonsFilter: {
        selector: '.radio-button',
        isMulti: true,
    },

    // "Осталось"
    progressActive: { selector: '#progress-active' }, // индикатор
    spanActive: { selector: '#span-active' }, // текст
    spanActivePercent: { selector: '#span-active-percent' }, // процент

    // "Всего"
    spanAll: { selector: '#span-all' }, // текст
    progressAll: { selector: '#progress-all' }, // индикатор
    spanAllPercent: { selector: '#span-all-percent' }, // процент

    // "Сделано"
    spanCompleted: { selector: '#span-completed' }, // текст
    progressCompleted: { selector: '#progress-completed' }, // индикатор
    spanCompletedPercent: { selector: '#span-completed-percent' }, // процент

    checkboxTasks: { selector: '#checkbox-tasks' }, // чекбокс "Выделить все задачи"
    labelCheckboxTasks: { selector: '#label-checkbox-tasks' }, // подпись к чекбоксу "Выделить все задачи"
    buttonDeleteCompleted: { selector: '#button-delete-completed' }, // кнопка "Удалить выполненные задачи"

    listTasks: { selector: '#list-tasks' }, // список с задачами
};

document.addEventListener('DOMContentLoaded', () => {
    // получаем элементы страницы
    controls = getControls(selectors);

    // инициализация класса управления списком задач
    todoList = new TodoList(controls.listTasks, updateInterface);

    // устанавливаем фокус на поле ввода новой задачи
    controls.inputAddTask.focus();

    // добавление обработчиков
    initEvents?.();
});
