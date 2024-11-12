import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    initQuill();
    loadPosts();
    setupEventListeners();
});

function initQuill() {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
}

function setupEventListeners() {
    const newPostBtn = document.getElementById('newPostBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const createPostForm = document.getElementById('createPostForm');

    newPostBtn.addEventListener('click', () => {
        document.getElementById('postForm').classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        document.getElementById('postForm').classList.add('hidden');
        createPostForm.reset();
        quill.setContents([]);
    });

    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loader = document.getElementById('loader');
        loader.classList.remove('hidden');

        try {
            const title = document.getElementById('title').value;
            const author = document.getElementById('author').value;
            const body = quill.root.innerHTML;

            await backend.createPost(title, body, author);
            
            createPostForm.reset();
            quill.setContents([]);
            document.getElementById('postForm').classList.add('hidden');
            await loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            loader.classList.add('hidden');
        }
    });
}

async function loadPosts() {
    const loader = document.getElementById('loader');
    const postsContainer = document.getElementById('posts');
    
    loader.classList.remove('hidden');
    postsContainer.innerHTML = '';

    try {
        const posts = await backend.getPosts();
        
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
    } finally {
        loader.classList.add('hidden');
    }
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post';
    
    const date = new Date(Number(post.timestamp / 1000000n));
    
    article.innerHTML = `
        <h2>${post.title}</h2>
        <div class="post-meta">
            <span class="author">By ${post.author}</span>
            <span class="date">${date.toLocaleDateString()}</span>
        </div>
        <div class="post-content">
            ${post.body}
        </div>
    `;
    
    return article;
}
