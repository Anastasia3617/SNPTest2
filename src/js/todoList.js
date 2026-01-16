import { Constants } from '../index';

/**
 * Класс управления списком задач
 */
export class TodoList {
    /**
     * Конструктор
     * @param {element} list - список
     * @param {function} [updateInterface=null] - функция обновления интерфейса
     */
    constructor(list, updateInterface = null) {
        this._itemTasks = []; // строки с задачами
        this._count = { all: 0, active: 0 }; // количество задач ( all - все, active - в работе )
        this._filter = 'all'; // фильтр ( значения: all - все,  active - в работе, completed - выполнено )
        this._textOldEditTask = ''; // текст задачи до редактирования
        this._itemTap = null; // строка с задачей, которую мы коснулись на сенсорном устройстве
        this._listTasks = list; // список с задачами
        this._liInfo = list.querySelector('.list__item_info'); // строка с информацией
        this._updateInterface = updateInterface; // функция обновления интерфейса
    }

    /**
     * Геттер для количества задач
     */
    get count() {
        return this._count;
    }

    /**
     * Геттер фильтра
     */
    get filter() {
        return this._filter;
    }

    /**
     * Добавление новой задачи
     * @param {string} text - содержание задачи
     */
    addTask(text) {
        const { _count: count } = this;

        // обновляем количество задач
        count.all += 1;
        count.active += 1;

        // добавляем строку
        const item = this._addItem(text);
        this._itemTasks.unshift(item);

        // фильтруем новую строку
        this._filterItems(item);
    }

    /**
     * Добавление строки с задачей
     * @param {string} text - содержание задачи
     * @returns {element} - созданная строка
     */
    _addItem(text) {
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
            { passive: true },
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
        span.classList.add('list__text', 'input', 'input_transparent');
        span.textContent = text;
        span.addEventListener('blur', this._handlerTextTaskBlur.bind(this));
        span.addEventListener(
            'keydown',
            this._handlerTextTaskKeydown.bind(this),
        );
        li.appendChild(span);

        // кнопка удалить
        const button = document.createElement('button');
        button.classList.add('button', 'button_icon', 'list__button');
        button.setAttribute('title', 'Удалить задачу');
        button.addEventListener(
            'click',
            this._handlerButtonDeleteTaskClick.bind(this),
        );

        // иконка кнопки
        const img = document.createElement('img');
        img.classList.add('button__image');
        img.setAttribute('src', 'assets/images/ic-close.svg');
        img.setAttribute('alt', 'Удалить задачу');
        button.appendChild(img);
        li.appendChild(button);

        // вставка в начало списка
        const { firstChild } = this._listTasks;
        if (firstChild) {
            this._listTasks.insertBefore(li, firstChild);
        } else {
            this._listTasks.appendChild(li);
        }

        return li;
    }

    /**
     * Обработчик двойного клика по строке с задачей
     * @param {object} event - событие
     */
    _handlerTextTaskDblClick(event) {
        const { target } = event;
        if (target && target.getAttribute('type') !== 'checkbox') {
            this._setModeEditTask({ item: target.closest('.list__item') });
        }
    }

    /**
     * Обработчик снятия фокуса с элемента с текстом
     * @param {object} event - событие
     */
    _handlerTextTaskBlur(event) {
        this._setModeEditTask({ nodeText: event.target, isEdit: false });
    }

    /**
     * Обработчик нажатия "Enter" или "Escape" на элементе с текстом
     * @param {object} event - событие
     */
    _handlerTextTaskKeydown(event) {
        const { target: nodeText } = event;
        if (!nodeText) return;

        const { key, keyCode } = event;

        // если нажали "Escape", то изменения не сохраняем
        if (key === 'Escape' || keyCode === 27) {
            nodeText.innerText = this._textOldEditTask;
        }
        if (
            key === 'Escape' ||
            keyCode === 27 ||
            (key === 'Enter' && event.ctrlKey)
        ) {
            if (event.cancelable) event.preventDefault();

            // выходим из режима редактирования
            this._setModeEditTask({ nodeText, isEdit: false });
        }
    }

    /**
     * Установка и сброс режима редактирования у задачи
     * @param {object} data - входные данные
     * @param {element} data.nodeText - элемент, содержащий текст задачи
     * @param {element} data.item - строка с задачей
     * @param {boolean} [data.isEdit=true] - признак установки режима редактирования
     */
    _setModeEditTask({ nodeText, item, isEdit = true }) {
        // получаем строку и элемент, содержащий текст задачи
        const itemTask = item || nodeText?.closest('.list__item') || null;
        const nodeTextTask =
            nodeText || itemTask?.querySelector('.list__text') || null;

        if (!itemTask || !nodeTextTask) return;

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
    }

    /**
     * Обработчик касания строки с задачей
     * @param {object} event - событие
     */
    _handlerItemTouchStart(event) {
        const { target } = event;
        if (!target) return;
        const { _itemTap: itemTap } = this;

        const { tagName } = target;
        const names = ['INPUT', 'IMG', 'BUTTON'];
        if (!names.includes(tagName)) event.stopPropagation();

        const itemTask = target.closest('.list__item');
        if (!itemTask) return;

        // если мы до этого касались другой строки, то у нее сбрасываем режим редактирования
        if (
            itemTap &&
            itemTap.getAttribute('id') !== itemTask.getAttribute('id')
        ) {
            this._clearItemTap();
        }

        if (!itemTask.singleTapTimer) {
            // одиночный тап
            itemTask.singleTapTimer = setTimeout(() => {
                // устанавливаем ховер
                this._itemTap = itemTask;
                itemTask.classList.add('list__item_hover');
                itemTask.singleTapTimer = null;
            }, Constants.SCROLL_Y_PANEL);
        } else {
            // двойной тап
            if (event.cancelable) event.preventDefault();

            clearTimeout(itemTask.singleTapTimer);
            itemTask.singleTapTimer = null;

            // устанавливаем режим редактирования
            if (!names.includes(tagName)) {
                this._setModeEditTask({ item: itemTask });
            }
        }
    }

    /**
     * Сброс ховера и режима редактирования у сохраненной строки с задачей ( на сенсорном устройстве )
     */
    _clearItemTap() {
        this._itemTap.classList.remove('list__item_hover');
        this._setModeEditTask({ item: this._itemTap, isEdit: false });
        this._itemTap = null;
    }

    /**
     * Сброс фокуса с задачи
     * @param {element} node - элемент, на который мы нажали
     */
    blurTask(node) {
        if (this._itemTap && !this._itemTap.contains(node)) {
            this._clearItemTap();
        }
    }

    /**
     * Обработчик изменения состояния чекбокса у задачи
     * @param {object} event - событие
     */
    _handlerCheckboxTaskInput(event) {
        const { target: checkbox } = event;
        const itemTask = checkbox?.closest('.list__item');
        if (!itemTask) return;
        this._count.active += checkbox.checked ? -1 : 1;
        this._changeStatusTask(checkbox.checked, itemTask);
    }

    /**
     * Переключение статуса всех задач
     * @param {boolean} checked - состояние чекбокса
     */
    setStatusAllTasks(checked) {
        const { _count: count } = this;
        count.active = checked ? 0 : count.all;
        this._changeStatusTask(checked);
    }

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
                if (checkbox) checkbox.checked = checked;
            }
        });

        // обновляем элементы управления и блоки с информацией
        this._updateInterface?.();

        // фильтруем строку
        this._filterItems(itemTask);
    }

    /**
     * Обработчик клика на кнопку "Удалить задачу"
     * @param {object} event - событие
     */
    _handlerButtonDeleteTaskClick(event) {
        const { _count: count } = this;
        const { target: button } = event;
        const itemTask = button?.closest('.list__item');
        if (!itemTask) return;

        // обновляем количество задач
        if (!itemTask.classList.contains('list__item_checked')) {
            count.active -= 1;
        }
        this._deleteTask(itemTask);
    }

    /**
     * Удаление выполненных задач
     */
    deleteCompletedTasks() {
        this._deleteTask();
    }

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
        this._updateInterface?.();

        // обновляем список
        this._updateList();
    }

    /**
     * Установка фильтра
     * @param {string} filter - фильтр
     */
    setFilter(filter) {
        this._filter = filter;
        this._filterItems();
    }

    /**
     * Получение функции фильтрации
     */
    _getFilterFunction() {
        const filters = {
            all: item => (item.style.display = 'flex'),
            active: item =>
                (item.style.display = item.classList.contains(
                    'list__item_checked',
                )
                    ? 'none'
                    : 'flex'),
            completed: item =>
                (item.style.display = item.classList.contains(
                    'list__item_checked',
                )
                    ? 'flex'
                    : 'none'),
        };
        return filters[this._filter] || filters.all;
    }

    /**
     * Фильтрация задач
     * @param {element} [itemTask=null] - строка с задачей
     */
    _filterItems(itemTask = null) {
        // функция фильтрации
        let filterFunct = this._getFilterFunction();

        // если строка не была передана в функцию, то фильтруем все задачи
        const items = itemTask ? [itemTask] : this._itemTasks;
        items.forEach(item => filterFunct(item));
        this._updateList();
    }

    /**
     * Обновление отображения списка
     */
    _updateList() {
        let last = null;

        // поиск последней строки
        this._itemTasks.forEach(item => {
            item.classList.remove('list__item_last');
            if (item.style.display !== 'none') {
                last = item;
            }
        });
        if (last) {
            // добавляем стилевое оформление последней строки
            last.classList.add('list__item_last');

            // прячем строку-заглушку
            this._liInfo.style.display = 'none';
        } else {
            // если нет строк в списке, то отображаем строку-заглушку
            this._liInfo.style.display = 'flex';
        }
    }
}
