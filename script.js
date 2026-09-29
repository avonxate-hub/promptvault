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
    
    const exportPromptsBtn =
    document.getElementById("exportPromptsBtn");

const importPromptsBtn =
    document.getElementById("importPromptsBtn");

const importFileInput =
    document.getElementById("importFileInput");

const viewModal =
    document.getElementById("viewModal");

const viewModalOverlay =
    document.getElementById("viewModalOverlay");

const closeViewModalBtn =
    document.getElementById("closeViewModalBtn");

const closeViewPromptBtn =
    document.getElementById("closeViewPromptBtn");

const copyViewPromptBtn =
    document.getElementById("copyViewPromptBtn");

const viewPromptTitle =
    document.getElementById("viewPromptTitle");

const viewPromptCategory =
    document.getElementById("viewPromptCategory");

const viewPromptDate =
    document.getElementById("viewPromptDate");

const viewPromptText =
    document.getElementById("viewPromptText");
    
    const deleteModal =
    document.getElementById("deleteModal");

const deleteModalOverlay =
    document.getElementById("deleteModalOverlay");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");

const deletePromptMessage =
    document.getElementById("deletePromptMessage");
    
    const promptWordCount =
    document.getElementById("promptWordCount");

const promptCharacterCount =
    document.getElementById("promptCharacterCount");
    

/* =========================================
   STATE
   ========================================= */

let prompts = loadPrompts();

let currentFilter = {
    type: "all",
    value: null
};

let pendingDeleteId = null;


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
        data-action="view"
        data-id="${prompt.id}"
    >
        View
    </button>

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
    
    updatePromptEditorStats();

}


function closeModal() {

    promptModal.classList.add("hidden");

    document.body.style.overflow = "";

    promptForm.reset();

    updatePromptEditorStats();

    promptIdInput.value = "";

}


/* =========================================
   PROMPT EDITOR STATISTICS
========================================= */

promptTextInput.addEventListener(
    "input",
    updatePromptEditorStats
);


function updatePromptEditorStats() {

    const text =
        promptTextInput.value.trim();

    const characters =
        promptTextInput.value.length;

    const words =
        text
            ? text.split(/\s+/).length
            : 0;

    promptWordCount.textContent =
        words;

    promptCharacterCount.textContent =
        characters;

}

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


           if (action === "view") {

           openViewModal(prompt);

}

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

    openDeleteModal(id);

}
    }
);


/* =========================================
   DELETE
   ========================================= */

function openDeleteModal(id) {

    const prompt =
        prompts.find(
            item => item.id === id
        );

    if (!prompt) return;

    pendingDeleteId = id;

    deletePromptMessage.textContent =
        `Are you sure you want to delete "${prompt.title}"? This action cannot be undone.`;

    deleteModal.classList.remove("hidden");

    document.body.style.overflow = "hidden";

}


function closeDeleteModal() {

    deleteModal.classList.add("hidden");

    document.body.style.overflow = "";

    pendingDeleteId = null;

}


function confirmDeletePrompt() {

    if (!pendingDeleteId) return;

    const prompt =
        prompts.find(
            item => item.id === pendingDeleteId
        );

    if (!prompt) {

        closeDeleteModal();

        return;

    }


    prompts =
        prompts.filter(
            item => item.id !== pendingDeleteId
        );


    savePrompts();

    renderPrompts();

    updateStats();

    updateCounts();

    closeDeleteModal();

    showToast(
        `"${prompt.title}" deleted.`
    );

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
   VIEW PROMPT MODAL
   ========================================= */

function openViewModal(prompt) {

    viewPromptTitle.textContent =
        prompt.title;

    viewPromptCategory.textContent =
        prompt.category;

    viewPromptDate.textContent =
        formatDate(prompt.createdAt);

    viewPromptText.textContent =
        prompt.text;

    viewModal.classList.remove("hidden");

    document.body.style.overflow = "hidden";

}


function closeViewModal() {

    viewModal.classList.add("hidden");

    document.body.style.overflow = "";

}

/* =========================================
   MODAL CONTROLS
   ========================================= */
   
   cancelDeleteBtn.addEventListener(
    "click",
    closeDeleteModal
);


deleteModalOverlay.addEventListener(
    "click",
    closeDeleteModal
);


confirmDeleteBtn.addEventListener(
    "click",
    confirmDeletePrompt
);

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

        if (event.key !== "Escape") {
            return;
        }


        if (
            !promptModal.classList.contains("hidden")
        ) {

            closeModal();

            return;

        }


        if (
            !viewModal.classList.contains("hidden")
        ) {

            closeViewModal();

        }
        
        if (
    !deleteModal.classList.contains("hidden")
) {

    closeDeleteModal();

}

    }
);

    


/* =========================================
   VIEW MODAL CONTROLS
========================================= */

closeViewModalBtn.addEventListener(
    "click",
    closeViewModal
);


closeViewPromptBtn.addEventListener(
    "click",
    closeViewModal
);


viewModalOverlay.addEventListener(
    "click",
    closeViewModal
);


copyViewPromptBtn.addEventListener(
    "click",
    async () => {

        const text =
            viewPromptText.textContent;

        await copyPrompt(text);

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

/* =========================================
   KEYBOARD SHORTCUTS
   ========================================= */

document.addEventListener("keydown", event => {

    if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
    ) {

        event.preventDefault();

        searchInput.focus();

        searchInput.select();

    }


    if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "n"
    ) {

        event.preventDefault();

        openModal();

    }

});

/* =========================================
   PROMPT EXPORT
========================================= */

exportPromptsBtn.addEventListener(
    "click",
    exportPrompts
);


function exportPrompts() {

    if (prompts.length === 0) {

        showToast("There are no prompts to export.");

        return;

    }


    const data =
        JSON.stringify(prompts, null, 2);

    const blob =
        new Blob(
            [data],
            { type: "application/json" }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "promptvault-backup.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showToast("Prompts exported successfully.");

}

/* =========================================
   PROMPT IMPORT
========================================= */

importPromptsBtn.addEventListener(
    "click",
    () => {
        importFileInput.click();
    }
);


importFileInput.addEventListener(
    "change",
    handleImport
);


function handleImport(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }


    if (
        file.type !== "application/json" &&
        !file.name.toLowerCase().endsWith(".json")
    ) {

        showToast("Please select a JSON backup file.");

        importFileInput.value = "";

        return;

    }


    const reader =
        new FileReader();


    reader.onload = () => {

        try {

            const imported =
                JSON.parse(reader.result);


            if (!Array.isArray(imported)) {
                throw new Error("Invalid backup format.");
            }


            const validPrompts =
                imported.filter(prompt => {

                    return (
                        prompt &&
                        typeof prompt.id === "string" &&
                        typeof prompt.title === "string" &&
                        typeof prompt.category === "string" &&
                        typeof prompt.text === "string" &&
                        typeof prompt.favorite === "boolean" &&
                        typeof prompt.createdAt === "string"
                    );

                });


            if (validPrompts.length === 0) {

                throw new Error(
                    "No valid prompts found."
                );

            }


            prompts = validPrompts;

            savePrompts();

            renderPrompts();

            updateStats();

            updateCounts();

            searchInput.value = "";

            currentFilter = {
                type: "all",
                value: null
            };

            setActiveNav();

            showToast(
                `${validPrompts.length} prompts imported successfully.`
            );

        } catch (error) {

            console.error(
                "Import failed:",
                error
            );

            showToast(
                "Unable to import that backup file."
            );

        }


        importFileInput.value = "";

    };


    reader.readAsText(file);

}
