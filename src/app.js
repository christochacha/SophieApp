import { db } from "./firebase.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const notesContainer = document.getElementById("notesContainer");
const modal = document.getElementById("modal");
const noteInput = document.getElementById("noteInput");

function displayNotes() {
    notesContainer.innerHTML = "";
    getDocs(collection(db, "loveNotes")).then(snapshot => {
        snapshot.docs.forEach(doc => {
            const note = doc.data();
            const noteElement = document.createElement("div");
            noteElement.className = "love-note";
            noteElement.innerHTML = `
                <div class="date">${new Date(note.date).toLocaleDateString()}</div>
                <p class="message">${note.message}</p>
            `;
            notesContainer.prepend(noteElement);
        });
    });
}

window.showModal = function() {
    modal.style.display = "block";
    noteInput.focus();
};

window.hideModal = function() {
    modal.style.display = "none";
    noteInput.value = "";
};

window.saveNote = function() {
    const message = noteInput.value.trim();
    if (message) {
        addDoc(collection(db, "loveNotes"), {
            date: new Date().toISOString(),
            message: message
        }).then(() => {
            displayNotes();
            hideModal();
        });
    }
};

// Load notes when page opens
displayNotes();
