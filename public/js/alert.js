export const hideAlert = () => {
    const elem = document.querySelector('.alert');
    if (elem) elem.parentElement.removeChild(elem);
};

export const showAlert = (type, msg, time = 5) => {
    hideAlert();
    const markup = `<div class='alert alert-${type}>${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, time * 1000);
};