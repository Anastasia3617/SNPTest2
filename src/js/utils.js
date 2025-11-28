/**
 * Получение элементов страницы
 * @param {object} selectors - объект вида кеу: {selector, isMulti}, где
 *                             selector - селектор элемента или элементов,
 *                             isMulti - признак получения коллекции элементов, по умолчанию false
 * @returns {object} - объект вида кеу: element || [elements]
 */
export function getControls(selectors) {
    const controls = {};
    Object.entries(selectors).forEach(
        ([key, { selector, isMulti = false }]) => {
            const nodes = document.querySelectorAll(selector);
            controls[key] = isMulti ? nodes : nodes[0];
        },
    );
    return controls;
}
