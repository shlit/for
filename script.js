document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("post-form");
    const postsContainer = document.getElementById("posts-container");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        // Get the input value
        const postInput = document.getElementById("post-input");
        const postText = postInput.value;

        // Create a new post element
        const post = document.createElement("div");
        post.classList.add("post");
        post.textContent = postText;

        // Append the new post to the container
        postsContainer.appendChild(post);

        // Clear the input
        postInput.value = "";
    });
});
