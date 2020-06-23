const endpoint = 'http://localhost:3000/api/v1/blogs';

const blogComment = async (comment, commentId) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `${endpoint}/${commentId}/comments`,
            data: {
                comment,
                commentId
            }
        });

        console.log(res);
    } catch (err) {
        alert(err.response.data.message);
    }
};

// Dom element
const commentForm = document.querySelector('.form--comment');

// Delegation
if (commentForm)
    commentForm.addEventListener('submit', e => {
        e.preventDefault();

        const comment = document.getElementById('comment').value;
        const { commentId } = e.target.dataset;

        // console.log({ comment });
        blogComment(comment, commentId);
    });