import { todoList, controls, Constants } from '../index';
import { updateInterface } from './ui';

/**
 * Добавление событий
 */
export const initEvents = () => {
    // Enter на поле ввода новой задачи
    controls.inputAddTask.addEventListener(
        'keydown',
        handlerInputAddTaskKeydown,
    );

    // изменение состояния чекбокса "Выделить все задачи"
    controls.checkboxTasks.addEventListener(
        'input',
        handlerCheckboxAllTasksInput,
    );

    // клик по кнопке "Удалить выполненные задачи"
    controls.buttonDeleteCompleted.addEventListener(
        'click',
        handlerButtonDeleteCompletedTasksClick,
    );

    // клик по фильтру
    controls.radioButtonsFilter.forEach(radio => {
        radio.addEventListener('click', handlerRadioButtonClick);
    });

    // касание на сенсорном устройстве
    document.addEventListener(
        'touchstart',
        handlerDocumentTouchstart.bind(this),
    );

    // фиксация панели с кнопками
    window.addEventListener('scroll', handlerWindowScroll);
};

/**
 * Обработчик прокрутки окна
 */
const handlerWindowScroll = () => {
    const { scrollY } = window;
    if (scrollY <= Constants.SCROLL_Y_PANEL) {
        controls.panelControls.classList.remove('panel_fixed', 'hidden');
        controls.panelInner.classList.remove('work-area', 'work-area_list');
    } else if (scrollY <= Constants.SCROLL_Y_PANEL_HIDDEN) {
        controls.panelControls.classList.add('hidden');
    } else {
        controls.panelControls.classList.remove('hidden');
        controls.panelControls.classList.add('panel_fixed');
        controls.panelInner.classList.add('work-area', 'work-area_list');
    }
};

/**
 * Обработчик нажатия Enter на поле ввода новой задачи
 * @param {object} event - событие
 */
const handlerInputAddTaskKeydown = event => {
    try {
        if (event.key !== 'Enter') return;
        if (event.cancelable) event.preventDefault();

        const text = controls.inputAddTask.value.trim();
        if (!text) return;

        todoList?.addTask?.(text);

        // чистим поле ввода
        controls.inputAddTask.value = '';

        // обновляем элементы управления и блоки с информацией
        updateInterface?.();
    } catch (error) {
        console.error('Failed to add task:', error);
    }
};

/**
 * Обработчик изменения состояния чекбокса "Выделить все задачи"
 */
const handlerCheckboxAllTasksInput = () => {
    todoList?.setStatusAllTasks?.(controls.checkboxTasks.checked);
};

/**
 * Обработчик клика на кнопку "Удалить выполненные задачи"
 */
const handlerButtonDeleteCompletedTasksClick = () => {
    todoList?.deleteCompletedTasks?.();
};

/**
 * Обработчик клика по фильтру
 * @param {object} event - событие
 */
const handlerRadioButtonClick = event => {
    const { target } = event;
    if (!target) return;

    const filter = target.getAttribute('filter');
    const filterList = todoList?.filter;

    // если фильтр поменялся
    if (filterList && filterList !== filter) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        controls.radioButtonsFilter.forEach(radio =>
            radio.classList.remove('wrapper_selected'),
        );
        target.classList.add('wrapper_selected');
        todoList?.setFilter?.(filter);
    }
};

/**
 * Обработчик касания на сенсорном устройстве
 * @param {object} event - событие
 */
const handlerDocumentTouchstart = event => {
    const { target } = event;
    if (!target) return;
    todoList?.blurTask?.(target);
};
