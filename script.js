/* =========================================
   PROMPTVAULT — APPLICATION LOGIC
   ========================================= */

const STORAGE_KEY = "promptvault-prompts";
const THEME_KEY = "promptvault-theme";


/* =========================================
   DOM REFERENCES
   ========================================= */

const promptGrid = document.getElementById("promptGrid");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");

const addPromptBtn = document.getElementById("addPromptBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");

const promptModal = document.getElementById("promptModal");
const modalOverlay = document.getElementById("modalOverlay");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const promptForm = document.getElementById("promptForm");

const promptIdInput = document.getElementById("promptId");
const promptTitleInput = document.getElementById("promptTitle");
const promptCategoryInput = document.getElementById("promptCategory");
const promptTextInput = document.getElementById("promptText");

const modalTitle = document.getElementById("modalTitle");

const themeToggle = document.getElementById("themeToggle");

const totalPrompts = document.getElementById("totalPrompts");
const totalFavorites = document.getElementById("totalFavorites");

const allCount = document.getElementById("allCount");
const favoriteCount = document.getElementById("favoriteCount");

const toastContainer =
    document.getElementById("toastContainer");

/* =========================================
   STATE
   ========================================= */

let prompts = loadPrompts();

let currentFilter = {
    type: "all",
    value: null
};


/* =========================================
   SAMPLE DATA
   ========================================= */

const samplePrompts = [
    {
        id: crypto.randomUUID(),
        title: "Premium product photography",
        category: "Design",
        text: "Create a premium studio product photograph with dramatic lighting, realistic materials, controlled reflections, subtle shadows, and a clean luxury editorial composition.",
        favorite: true,
        createdAt: new Date().toISOString()
    },

    {
        id: crypto.randomUUID(),
        title: "Explain code simply",
        category: "Coding",
        text: "Explain the following code like an experienced developer teaching someone who understands the basics. Identify what each important section does and mention potential improvements.",
        favorite: false,
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },

    {
        id: crypto.randomUUID(),
        title: "Research breakdown",
        category: "Research",
        text: "Analyze this topic using reliable evidence. Separate established facts from interpretations, identify disagreements between sources, and summarize the most important findings clearly.",
        favorite: false,
        createdAt: new Date(Date.now() - 172800000).toISOString()
    },

    {
        id: crypto.randomUUID(),
        title: "Professional rewrite",
        category: "Writing",
        text: "Rewrite the following message so it sounds confident, professional, natural, and concise while preserving the original meaning and personality.",
        favorite: true,
        createdAt: new Date(Date.now() - 259200000).toISOString()
    }
];


/* =========================================
   INITIALIZATION
   ========================================= */

initialize();


function initialize() {

    if (!localStorage.getItem(STORAGE_KEY)) {
        prompts = samplePrompts;
        savePrompts();
    }

    loadTheme();
    renderPrompts();
    updateStats();
    updateCounts();

}


/* =========================================
   LOCAL STORAGE
   ========================================= */

function loadPrompts() {

    try {

        const stored = localStorage.getItem(STORAGE_KEY);

        return stored ? JSON.parse(stored) : [];

    } catch (error) {

        console.error("Unable to load prompts:", error);

        return [];

    }

}


function savePrompts() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(prompts)
    );

}


/* =========================================
   RENDERING
   ========================================= */

function renderPrompts() {

    const filteredPrompts = getFilteredPrompts();

    promptGrid.innerHTML = "";

    if (filteredPrompts.length === 0) {

        emptyState.classList.remove("hidden");

    } else {

        emptyState.classList.add("hidden");

        filteredPrompts.forEach(prompt => {

            promptGrid.appendChild(
                createPromptCard(prompt)
            );

        });

    }

}


function createPromptCard(prompt) {

    const card = document.createElement("article");

    card.className = "prompt-card";

    const formattedDate = formatDate(prompt.createdAt);

    card.innerHTML = `
        <div class="prompt-card-top">

            <span class="category-badge">
                ${escapeHTML(prompt.category)}
            </span>

            <button
                class="favorite-button ${prompt.favorite ? "active" : ""}"
                data-action="favorite"
                data-id="${prompt.id}"
                aria-label="Toggle favorite"
            >
                ${prompt.favorite ? "★" : "☆"}
            </button>

        </div>

        <h3>
            ${escapeHTML(prompt.title)}
        </h3>

        <p class="prompt-preview">
            ${escapeHTML(prompt.text)}
        </p>

        <div class="prompt-card-footer">

            <span class="prompt-date">
                ${formattedDate}
            </span>

            <div class="card-actions">

                <button
                    class="card-action"
                    data-action="copy"
                    data-id="${prompt.id}"
                >
                    Copy
                </button>

                <button
                    class="card-action"
                    data-action="edit"
                    data-id="${prompt.id}"
                >
                    Edit
                </button>

                <button
                    class="card-action"
                    data-action="delete"
                    data-id="${prompt.id}"
                >
                    Delete
                </button>

            </div>

        </div>
    `;

    return card;

}


/* =========================================
   FILTERING
   ========================================= */

function getFilteredPrompts() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();

    let result = [...prompts];


    if (currentFilter.type === "favorites") {

        result = result.filter(
            prompt => prompt.favorite
        );

    }


    if (currentFilter.type === "category") {

        result = result.filter(
            prompt =>
                prompt.category === currentFilter.value
        );

    }


    if (query) {

        result = result.filter(prompt => {

            return (
                prompt.title
                    .toLowerCase()
                    .includes(query)

                ||

                prompt.text
                    .toLowerCase()
                    .includes(query)

                ||

                prompt.category
                    .toLowerCase()
                    .includes(query)
            );

        });

    }


    return result.sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
    );

}


/* =========================================
   STATS
   ========================================= */

function updateStats() {

    const favorites =
        prompts.filter(
            prompt => prompt.favorite
        ).length;

    totalPrompts.textContent =
        prompts.length;

    totalFavorites.textContent =
        favorites;

}


function updateCounts() {

    const favorites =
        prompts.filter(
            prompt => prompt.favorite
        ).length;

    allCount.textContent =
        prompts.length;

    favoriteCount.textContent =
        favorites;

}


/* =========================================
   MODAL
   ========================================= */

function openModal(prompt = null) {

    promptModal.classList.remove("hidden");

    document.body.style.overflow = "hidden";


    if (prompt) {

        modalTitle.textContent =
            "Edit Prompt";

        promptIdInput.value =
            prompt.id;

        promptTitleInput.value =
            prompt.title;

        promptCategoryInput.value =
            prompt.category;

        promptTextInput.value =
            prompt.text;

    } else {

        modalTitle.textContent =
            "New Prompt";

        promptForm.reset();

        promptIdInput.value = "";

    }


    setTimeout(() => {
        promptTitleInput.focus();
    }, 50);

}


function closeModal() {

    promptModal.classList.add("hidden");

    document.body.style.overflow = "";

    promptForm.reset();

    promptIdInput.value = "";

}


/* =========================================
   CREATE / UPDATE
   ========================================= */

promptForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const title =
            promptTitleInput.value.trim();

        const category =
            promptCategoryInput.value;

        const text =
            promptTextInput.value.trim();

        const existingId =
            promptIdInput.value;


        if (!title || !text) {
            return;
        }


        if (existingId) {

            const prompt =
                prompts.find(
                    item => item.id === existingId
                );

            if (prompt) {

                prompt.title = title;
                prompt.category = category;
                prompt.text = text;

            }

        } else {

            prompts.unshift({

                id: crypto.randomUUID(),

                title,

                category,

                text,

                favorite: false,

                createdAt:
                    new Date().toISOString()

            });

        }


        savePrompts();

        renderPrompts();

        updateStats();

        updateCounts();

        closeModal();

    }
);


/* =========================================
   CARD ACTIONS
   ========================================= */

promptGrid.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest("[data-action]");

        if (!button) return;


        const action =
            button.dataset.action;

        const id =
            button.dataset.id;

        const prompt =
            prompts.find(
                item => item.id === id
            );

        if (!prompt) return;


        if (action === "favorite") {

            prompt.favorite =
                !prompt.favorite;

            savePrompts();

            renderPrompts();

            updateStats();

            updateCounts();

        }


        if (action === "copy") {

            await copyPrompt(prompt.text);

            button.textContent = "Copied!";

            setTimeout(() => {

                button.textContent = "Copy";

            }, 1200);

        }


        if (action === "edit") {

            openModal(prompt);

        }


        if (action === "delete") {

            deletePrompt(id);

        }

    }
);


/* =========================================
   DELETE
   ========================================= */

function deletePrompt(id) {

    const prompt =
        prompts.find(
            item => item.id === id
        );

    if (!prompt) return;


    prompts =
    prompts.filter(
        item => item.id !== id
    );


savePrompts();

showToast(`"${prompt.title}" deleted.`);

    renderPrompts();

    updateStats();

    updateCounts();

}


/* =========================================
   COPY
   ========================================= */

async function copyPrompt(text) {

    try {

        await navigator.clipboard.writeText(text);

    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );

    }

}



function showToast(message) {

    const toast =
        document.createElement("div");

    toast.className = "toast";

    toast.innerHTML = `
        <span class="toast-icon">✓</span>
        <span>${escapeHTML(message)}</span>
    `;

    toastContainer.appendChild(toast);


    setTimeout(() => {

        toast.classList.add("removing");

        setTimeout(() => {

            toast.remove();

        }, 250);

    }, 2500);

}


/* =========================================
   SEARCH
   ========================================= */

searchInput.addEventListener(
    "input",
    () => {

        renderPrompts();

    }
);


clearSearchBtn.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        currentFilter = {
            type: "all",
            value: null
        };

        setActiveNav();

        renderPrompts();

    }
);


/* =========================================
   NAVIGATION / FILTERS
   ========================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const filter =
                    button.dataset.filter;

                const category =
                    button.dataset.category;


                if (filter === "favorites") {

                    currentFilter = {
                        type: "favorites",
                        value: null
                    };

                } else if (category) {

                    currentFilter = {
                        type: "category",
                        value: category
                    };

                } else {

                    currentFilter = {
                        type: "all",
                        value: null
                    };

                }


                setActiveNav();

                renderPrompts();

            }
        );

    });


function setActiveNav() {

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove("active");

        });


    let activeButton = null;


    if (currentFilter.type === "favorites") {

        activeButton =
            document.querySelector(
                '[data-filter="favorites"]'
            );

    } else if (currentFilter.type === "category") {

        activeButton =
            document.querySelector(
                `[data-category="${currentFilter.value}"]`
            );

    } else {

        activeButton =
            document.querySelector(
                '[data-filter="all"]'
            );

    }


    if (activeButton) {

        activeButton.classList.add("active");

    }

}


/* =========================================
   MODAL CONTROLS
   ========================================= */

addPromptBtn.addEventListener(
    "click",
    () => openModal()
);


emptyAddBtn.addEventListener(
    "click",
    () => openModal()
);


closeModalBtn.addEventListener(
    "click",
    closeModal
);


cancelModalBtn.addEventListener(
    "click",
    closeModal
);


modalOverlay.addEventListener(
    "click",
    closeModal
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !promptModal.classList.contains("hidden")
        ) {

            closeModal();

        }

    }
);


/* =========================================
   THEME
   ========================================= */

themeToggle.addEventListener(
    "click",
    () => {

        const isDark =
            document.body.classList.toggle("dark");

        localStorage.setItem(
            THEME_KEY,
            isDark ? "dark" : "light"
        );

        updateThemeIcon();

    }
);


function loadTheme() {

    const savedTheme =
        localStorage.getItem(THEME_KEY);


    if (savedTheme === "dark") {

        document.body.classList.add("dark");

    }


    updateThemeIcon();

}


function updateThemeIcon() {

    const isDark =
        document.body.classList.contains("dark");

    themeToggle.textContent =
        isDark ? "☀" : "☾";

    themeToggle.setAttribute(
        "aria-label",
        isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );

}


/* =========================================
   UTILITIES
   ========================================= */

function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric"
        }
    );

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}
