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
        document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("posts-container");

    // Fetch comments stored in the GitHub repository
    async function fetchPosts() {
        const response = await fetch(
            "https://raw.githubusercontent.com/<username>/<repo>/main/_data/comments"
        );
        const data = await response.json();

        // Sort and display the posts
        container.innerHTML = "";
        data.forEach(post => {
            const postElement = document.createElement("div");

    });
});
