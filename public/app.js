import { db } from "./config.js";
import { collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Shared password
const SHARED_PASSWORD = process.env.SHARED_PASSWORD;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('password').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            login();
        }
    });

    document.querySelector('.button').addEventListener('click', login);
});

// Authentication function
function login() {
    console.log('Login function');
    const password = document.getElementById('password').value;
    
    if (password === SHARED_PASSWORD) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'block';
        loadNotes();
        localStorage.setItem('isLoggedIn', 'true');
    } else {
        alert('Incorrect password');
    }
}

// Check login state
function checkLoginState() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'block';
        loadNotes();
    }
}

// Load notes from Firestore
function loadNotes() {
    const notesCollection = collection(db, 'notes');
    const notesQuery = query(notesCollection, orderBy('date', 'desc'));

    onSnapshot(notesQuery, (snapshot) => {
        const container = document.getElementById('notesContainer');
        container.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const note = doc.data();
            const noteElement = document.createElement('div');
            noteElement.className = 'love-note';
            noteElement.innerHTML = `
                <div class="author">${escapeHtml(note.author)}</div>
                <div class="date">${new Date(note.date).toLocaleString()}</div>
                <p class="message">${escapeHtml(note.message)}</p>
            `;
            container.appendChild(noteElement);
        });
    }, (error) => {
        console.error("Error loading notes: ", error);
        alert('Error loading notes. Please check your connection.');
    });
}

// Show modal
function showModal() {
    document.getElementById('modal').style.display = 'block';
    document.getElementById('noteInput').focus();
}

// Hide modal
function hideModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('noteInput').value = '';
    document.getElementById('authorInput').value = '';
}

// Save new note
function saveNote() {
    const message = document.getElementById('noteInput').value.trim();
    const author = document.getElementById('authorInput').value.trim() || 'Anonymous';

    if (message) {
        addDoc(collection(db, 'notes'), {
            author: author,
            message: message,
            date: new Date().toISOString()
        })
        .then(() => {
            hideModal();
        })
        .catch((error) => {
            console.error("Error saving note: ", error);
            alert('Error saving note. Please try again.');
        });
    }
}

// Prevent XSS attacks
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Close modal on click outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        hideModal();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
});

// Export functions for HTML
window.login = login;
window.showModal = showModal;
window.hideModal = hideModal;
window.saveNote = saveNote;
