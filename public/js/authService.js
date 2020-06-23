const endpoint = 'http://localhost:3000/api/v1/users';

const signup = async data => {
    try {
        const res = await axios({
            method: 'POST',
            url: `${endpoint}/signup`,
            data
        });

        // console.log(res);

        if (res.data.status === 'success') {
            alert('Your account has been successfully created!');
            window.setTimeout(() => {
                location.assign('/login');
            }, 1000);
        }
    } catch (err) {
        alert(err.response.data.message);
    }
};

const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `${endpoint}/login`,
            data: {
                email, password
            }
        });

        // console.log(res);

        if (res.data.status === 'success') {
            alert('Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        alert(err.response.data.message);
    }
};

const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: `${endpoint}/logout`
        });

        if (res.data.status === 'success') {
            alert('Logged you out!');
            window.setTimeout(() => {
                location.assign('/login');
            }, 1500);
        }
    } catch (err) {
        alert(err.response.data.message);
    }
};

// Dom Element
const signupBtn = document.querySelector('.form--signup');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.logout--btn');

// Delegation
if (signupBtn)
    signupBtn.addEventListener('submit', e => {
        e.preventDefault();

        const form = new FormData();

        form.append('firstName', document.querySelector('.firstName').value);
        form.append('lastName', document.querySelector('.lastName').value);
        form.append('email', document.querySelector('.email').value);
        form.append('password', document.querySelector('.password').value);
        form.append('passwordConfirm', document.querySelector('.passwordConfirm').value);
        form.append('photo', document.querySelector('.photo').files[0]);

        signup(form)
    });

if (loginForm)
    loginForm.addEventListener('submit', e => {
        e.preventDefault();

        const email = document.querySelector('.email').value;
        const password = document.querySelector('.password').value;

        // console.log({ email, password });
        login(email, password);
    });

if (logoutBtn) logoutBtn.addEventListener('click', logout);