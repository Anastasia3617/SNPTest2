import { getControls } from './utils';

/**
 * Класс управления списком задач
 */
export const TodoListManager = {
    /**
     * Строки с задачами
     */
    _itemTasks: [],

    /**
     * Количество задач ( all - все, active - в работе )
     */
    _count: { all: 0, active: 0 },

    /**
     * Фильтр ( значения: all - все,  active - в работе, completed - выполнено )
     */
    _filter: 'all',

    /**
     * Текст задачи до редактирования
     */
    _textOldEditTask: '',

    /**
     * Строка с задачей, которую мы коснулись на сенсорном устройстве
     */
    _itemTap: null,

    /**
     * Селекторы элементов
     */
    _selectors: {
        spanActive: { selector: '#span-active' }, // текст "Осталось выполнить"
        inputAddTask: { selector: '#input-add-task' }, // поле ввода новой задачи
        listTasks: { selector: '#list-tasks' }, // список с задачами
        liInfo: { selector: '#li-info' }, // строка с информацией
        checkboxTasks: { selector: '#checkbox-tasks' }, // чекбокс "Выделить все задачи"
        buttonDeleteCompleted: { selector: '#button-delete-completed' }, // кнопка "Удалить выполненные задачи"
        containerСontrols: { selector: '#container-controls' }, // блок с элементами управления
        filterRadioLabels: {
            selector: '#filter-tasks .radio-buttons__text', // радиокнопки
            isMulti: true,
        },
    },

    /**
     * Инициализация
     */
    init() {
        // получаем элементы страницы
        this._controls = getControls(this._selectors);

        // добавление обработчиков
        this._addEventListeners();

        // устанавливаем фокус на поле ввода новой задачи
        this._controls.inputAddTask.focus();
    },

    /**
     * Добавление событий
     */
    _addEventListeners() {
        const { _controls: controls } = this;

        // Enter на поле ввода новой задачи
        controls.inputAddTask.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                if (event.cancelable) {
                    event.preventDefault();
                }
                this._addTask();
            }
        });

        // изменение состояния чекбокса "Выделить все задачи"
        controls.checkboxTasks.addEventListener(
            'input',
            this._handlerCheckboxAllTasksInput.bind(this),
        );

        // клик по кнопке "Удалить выполненные задачи"
        controls.buttonDeleteCompleted.addEventListener(
            'click',
            this._handlerButtonDeleteCompletedTasksClick.bind(this),
        );

        // клик по фильтру
        controls.filterRadioLabels.forEach(radio => {
            radio.addEventListener(
                'click',
                this._handlerRadioLabelClick.bind(this),
            );
        });

        // касание на сенсорном устройстве
        document.addEventListener(
            'touchstart',
            this._handlerDocumentTouchstart.bind(this),
        );
    },

    /**
     * Добавление новой задачи
     */
    _addTask() {
        const { _controls: controls, _count: count } = this;
        const text = controls.inputAddTask.value;

        // если поле не пустое
        if (text.trim() !== '') {
            // обновляем количество задач
            count.all += 1;
            count.active += 1;

            // добавляем строку
            const item = this._addItem(text);
            this._itemTasks.push(item);

            // чистим поле ввода
            controls.inputAddTask.value = '';

            // фильтруем новую строку
            this._filterItems(item);

            // обновляем элементы управления и блоки с информацией
            this._updateInterface();
        }
    },

    /**
     * Добавление строки с задачей
     * @param {string} text - содержание задачи
     * @returns {element} - созданная строка
     */
    _addItem(text) {
        const { _controls: controls, _count: count } = this;

        // строка
        const li = document.createElement('li');
        li.setAttribute('id', crypto.randomUUID());
        li.classList.add('list__item');
        li.addEventListener(
            'dblclick',
            this._handlerTextTaskDblClick.bind(this),
        );
        li.addEventListener(
            'touchstart',
            this._handlerItemTouchStart.bind(this),
        );

        // чекбокс
        const input = document.createElement('input');
        input.classList.add('checkbox', 'checkbox_circular');
        input.setAttribute('type', 'checkbox');
        input.addEventListener(
            'input',
            this._handlerCheckboxTaskInput.bind(this),
        );
        li.appendChild(input);

        // содержание
        const span = document.createElement('span');
        span.classList.add('list__text');
        span.textContent = text;
        span.addEventListener('blur', this._handlerTextTaskBlur.bind(this));
        span.addEventListener(
            'keydown',
            this._handlerTextTaskKeydown.bind(this),
        );
        li.appendChild(span);

        // кнопка закрыть
        const button = document.createElement('button');
        button.classList.add(
            'button-icon',
            'list__button',
            'button-icon_small',
            'button-icon_grey',
        );
        button.setAttribute('title', 'Удалить задачу');
        button.addEventListener(
            'click',
            this._handlerButtonDeleteTaskClick.bind(this),
        );

        // иконка кнопки
        const img = document.createElement('img');
        img.classList.add('button-icon__image');
        img.setAttribute('src', 'assets/images/ic-close.svg');
        img.setAttribute('alt', 'Удалить задачу');
        button.appendChild(img);
        li.appendChild(button);

        controls.listTasks.appendChild(li);
        return li;
    },

    /**
     * Обработчик двойного клика по строке с задачей
     * @param {object} event - событие
     */
    _handlerTextTaskDblClick(event) {
        const { target } = event;
        if (target && target.getAttribute('type') !== 'checkbox') {
            this._setModeEditTask({ item: target.closest('.list__item') });
        }
    },

    /**
     * Обработчик снятия фокуса с элемента с текстом
     * @param {object} event - событие
     */
    _handlerTextTaskBlur(event) {
        this._setModeEditTask({ nodeText: event.target, isEdit: false });
    },

    /**
     * Обработчик нажатия "Enter" или "Escape" на элементе с текстом
     * @param {object} event - событие
     */
    _handlerTextTaskKeydown(event) {
        const nodeText = event.target;
        if (nodeText) {
            // если нажали "Escape", то изменения не сохраняем
            if (event.key === 'Escape' || event.keyCode === 27) {
                nodeText.innerText = this._textOldEditTask;
            }
            if (
                event.key === 'Escape' ||
                event.keyCode === 27 ||
                (event.key === 'Enter' && event.ctrlKey)
            ) {
                if (event.cancelable) {
                    event.preventDefault();
                }

                // выходим из режима редактирования
                this._setModeEditTask({ nodeText, isEdit: false });
            }
        }
    },

    /**
     * Установка и сброс режима редактирования у задачи
     * @param {object} data - входные данные
     * @param {element} data.nodeText - элемент, содержащий текст задачи
     * @param {element} data.item - строка с задачей
     * @param {boolean} [data.isEdit=true] - признак установки режима редактирования
     */
    _setModeEditTask({ nodeText, item, isEdit = true }) {
        // получаем строку и элемент, содержащий текст задачи
        const itemTask =
            item || (nodeText ? nodeText.closest('.list__item') : null);
        const nodeTextTask =
            nodeText ||
            (itemTask ? itemTask.querySelector('.list__text') : null);
        if (itemTask && nodeTextTask) {
            // режим редактирования
            if (isEdit) {
                itemTask.classList.add('list__item_edit');
                nodeTextTask.setAttribute('contenteditable', 'true');
                nodeTextTask.focus();

                // запоминаем текст
                this._textOldEditTask = nodeTextTask.innerText;
            } else {
                // сброс режима редактирования
                itemTask.classList.remove('list__item_edit');
                nodeTextTask.removeAttribute('contenteditable');
                nodeTextTask.blur();
                this._cleanContentEditable(nodeTextTask);
                this._textOldEditTask = '';
            }
        }
    },

    /**
     * Удаление пустых текстовых узлов и переносов строк, расположенных в конце текста
     * @param {element} nodeText - элемент с текстом
     */
    _cleanContentEditable(nodeText) {
        while (
            nodeText.lastChild &&
            (nodeText.lastChild.nodeName === 'BR' ||
                (nodeText.lastChild.nodeType === 3 &&
                    nodeText.lastChild.textContent.trim() === ''))
        ) {
            nodeText.removeChild(nodeText.lastChild);
        }
    },

    /**
     * Обработчик касания строки с задачей
     * @param {object} event - событие
     */
    _handlerItemTouchStart(event) {
        event.stopPropagation();
        const { target } = event;
        const { _itemTap: itemTap } = this;
        const itemTask = target ? target.closest('.list__item') : null;
        if (itemTask) {
            // если мы до этого касались другой строки, то у нее сбрасываем режим редактирования
            if (
                itemTap &&
                itemTap.getAttribute('id') !== itemTask.getAttribute('id')
            ) {
                this._clearItemTap();
            }

            // устанавливаем ховер
            itemTask.classList.add('list__item_hover');
            this._itemTap = itemTask;

            if (!itemTask.singleTapTimer) {
                // одиночный тап
                itemTask.singleTapTimer = setTimeout(() => {
                    itemTask.singleTapTimer = null;
                }, 300);
            } else {
                // двойной тап
                if (event.cancelable) {
                    event.preventDefault();
                }
                clearTimeout(itemTask.singleTapTimer);
                itemTask.singleTapTimer = null;

                // устанавливаем режим редактирования
                if (target.getAttribute('type') !== 'checkbox') {
                    this._setModeEditTask({ item: itemTask });
                }
            }
        }
    },

    /**
     * Сброс ховера и режима редактирования у сохраненной строки с задачей ( на сенсорном устройстве )
     */
    _clearItemTap() {
        this._itemTap.classList.remove('list__item_hover');
        this._setModeEditTask({ item: this._itemTap, isEdit: false });
        this._itemTap = null;
    },

    /**
     * Обработчик касания на сенсорном устройстве
     * @param {object} event - событие
     */
    _handlerDocumentTouchstart(event) {
        const { target } = event;
        if (target && this._itemTap && !this._itemTap.contains(target)) {
            this._clearItemTap();
        }
    },

    /**
     * Обработчик изменения состояния чекбокса у задачи
     * @param {object} event - событие
     */
    _handlerCheckboxTaskInput(event) {
        const { _count: count } = this;
        const checkbox = event.target;
        const itemTask = checkbox ? checkbox.closest('.list__item') : null;
        if (itemTask) {
            checkbox.checked ? count.active-- : count.active++;
            this._changeStatusTask(checkbox.checked, itemTask);
        }
    },

    /**
     * Обработчик изменения состояния чекбокса "Выделить все задачи"
     */
    _handlerCheckboxAllTasksInput() {
        const { _controls: controls, _count: count } = this;
        const checked = controls.checkboxTasks.checked;
        count.active = checked ? 0 : count.all;
        this._changeStatusTask(checked);
    },

    /**
     * Изменение статуса задачи
     * @param {boolean} checked - состояние чекбокса
     * @param {element} [itemTask=null] - строка с задачей
     */
    _changeStatusTask(checked, itemTask = null) {
        const { _itemTasks: itemTasks } = this;

        // функция установки статуса у строки
        const checkItem = checked
            ? item => item.classList.add('list__item_checked')
            : item => item.classList.remove('list__item_checked');

        // если строка не была передана в функцию, то статус изменяем у всех задач
        const items = itemTask ? [itemTask] : itemTasks;
        items.forEach(item => {
            checkItem(item);

            // если строка не была передана в функцию, то изменяем состояние чекбокса у всех задач
            if (!itemTask) {
                const checkbox = item.querySelector('.checkbox');
                if (checkbox) {
                    checkbox.checked = checked;
                }
            }
        });

        // обновляем элементы управления и блоки с информацией
        this._updateInterface();

        // фильтруем строку
        this._filterItems(itemTask);
    },

    /**
     * Обработчик клика на кнопку "Удалить задачу"
     * @param {object} event - событие
     */
    _handlerButtonDeleteTaskClick(event) {
        const { _count: count } = this;
        const button = event.target;
        const itemTask = button ? button.closest('.list__item') : null;
        if (itemTask) {
            // обновляем количество задач
            if (!itemTask.classList.contains('list__item_checked')) {
                count.active -= 1;
            }
            this._deleteTask(itemTask);
        }
    },

    /**
     * Обработчик клика на кнопку "Удалить выполненные задачи"
     */
    _handlerButtonDeleteCompletedTasksClick() {
        this._deleteTask();
    },

    /**
     * Удаление задачи
     * @param {element} [itemTask=null] - строка с задачей
     */
    _deleteTask(itemTask = null) {
        const { _count: count } = this;
        let { _itemTasks: itemTasks } = this;
        const deleteIds = [];

        // если строка не была передана в функцию, то удаляем выполненные задачи
        const items = itemTask ? [itemTask] : itemTasks;
        items.forEach(item => {
            if (itemTask || item.classList.contains('list__item_checked')) {
                count.all -= 1;
                item.remove();
                deleteIds.push(item.getAttribute('id'));
            }
        });
        this._itemTasks = itemTasks.filter(
            item => !deleteIds.includes(item.getAttribute('id')),
        );

        // обновляем элементы управления и блоки с информацией
        this._updateInterface();
    },

    /**
     * Обновление элементов управления и блоков с информацией
     */
    _updateInterface() {
        const { _controls: controls, _count: count } = this;

        // текст "Осталось выполнить"
        controls.spanActive.textContent = count.active;

        // блок с элементами управления
        controls.containerСontrols.style.display =
            count.all > 0 ? 'flex' : 'none';

        // чекбокс "Выделить все задачи"
        controls.checkboxTasks.checked = count.active === 0;

        // кнопка "Удалить выполненные задачи"
        controls.buttonDeleteCompleted.style.display =
            count.all - count.active > 0 ? 'flex' : 'none';

        // строка с информацией
        controls.liInfo.style.display = count.all > 0 ? 'none' : 'flex';
    },

    /**
     * Обработчик клика по фильтру
     * @param {object} event - событие
     */
    _handlerRadioLabelClick(event) {
        const label = event.target;
        if (label) {
            const filter = label.getAttribute('filter');

            // если фильтр поменялся
            if (this._filter !== filter) {
                this._filter = filter;
                this._filterItems();
            }
        }
    },

    /**
     * Фильтрация задач
     * @param {element} [itemTask=null] - строка с задачей
     */
    _filterItems(itemTask = null) {
        // функция фильтрации
        let filterFunct;
        switch (this._filter) {
            case 'all': {
                filterFunct = item => (item.style.display = 'flex');
                break;
            }
            case 'active': {
                filterFunct = item =>
                    (item.style.display = item.classList.contains(
                        'list__item_checked',
                    )
                        ? 'none'
                        : 'flex');
                break;
            }
            case 'completed': {
                filterFunct = item =>
                    (item.style.display = item.classList.contains(
                        'list__item_checked',
                    )
                        ? 'flex'
                        : 'none');
                break;
            }
            default: {
                break;
            }
        }

        // если строка не была передана в функцию, то фильтруем все задачи
        const items = itemTask ? [itemTask] : this._itemTasks;
        items.forEach(item => filterFunct(item));
    },
};
