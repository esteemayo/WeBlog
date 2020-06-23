const endpoint = 'http://localhost:3000/api/v1/blogs';

const blog = async data => {
    try {
        const res = await axios({
            method: 'POST',
            url: endpoint,
            data
        });

        console.log(res);

        if (res.data.status === 'success') {
            alert('Blog successfully created!');
            window.setTimeout(() => {
                location.reload(true);
            }, 1500);
        }
    } catch (err) {
        alert(err.response.data.message);
    }
};

// Dom Element
const addBlog = document.querySelector('.form--add-blog');

// Delegation
if (addBlog)
    addBlog.addEventListener('submit', e => {
        e.preventDefault();

        const form = new FormData();

        form.append('title', document.querySelector('.title').value);
        form.append('description', document.getElementById('description').value);
        form.append('tags', document.querySelector('.tags').value);
        form.append('image', document.querySelector('.image').files[0]);

        blog(form);
    });