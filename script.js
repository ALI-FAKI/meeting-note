// Meeting Notes Taker – JavaScript Functionality

document.addEventListener('DOMContentLoaded', () => {

    // ─── DOM Elements ───
    const noteInput = document.getElementById('note-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const notesList = document.getElementById('notes-list');
    const emptyState = document.getElementById('empty-state');
    const downloadBtn = document.getElementById('download-btn');
    const clearBtn = document.getElementById('clear-btn');

    // ─── localStorage Key ───
    const STORAGE_KEY = 'meetingNotes';

    // ─── Load Notes from localStorage ───
    function loadNotes() {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    }

    // ─── Save Notes to localStorage ───
    function saveNotes(notes) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }

    // ─── Render Notes in UI ───
    function renderNotes() {
        const notes = loadNotes();
        notesList.innerHTML = '';

        if (notes.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        notes.forEach(note => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="note-text">${escapeHTML(note.text)}</span>
                <span class="note-time">${formatTimestamp(note.timestamp)}</span>
            `;
            notesList.appendChild(li);
        });
    }

    // ─── Escape HTML to prevent XSS ───
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ─── Format Timestamp ───
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString(undefined, options);
    }

    // ─── Add New Note ───
    function addNote() {
        const text = noteInput.value.trim();
        if (!text) {
            alert('Please enter a note before adding.');
            return;
        }

        const notes = loadNotes();
        const newNote = {
            text: text,
            timestamp: Date.now()
        };
        notes.push(newNote);
        saveNotes(notes);
        noteInput.value = '';
        noteInput.focus();
        renderNotes();
    }

    // ─── Download Notes as .txt ───
    function downloadNotes() {
        const notes = loadNotes();
        if (notes.length === 0) {
            alert('No notes to download.');
            return;
        }

        let content = 'Meeting Notes\n';
        content += '====================\n\n';
        notes.forEach((note, index) => {
            const date = new Date(note.timestamp).toLocaleString();
            content += `[${date}] ${note.text}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-notes-${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ─── Clear All Notes ───
    function clearNotes() {
        if (confirm('Are you sure you want to delete all notes?')) {
            localStorage.removeItem(STORAGE_KEY);
            renderNotes();
        }
    }

    // ─── Event Listeners ───
    addNoteBtn.addEventListener('click', addNote);
    noteInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addNote();
        }
    });
    downloadBtn.addEventListener('click', downloadNotes);
    clearBtn.addEventListener('click', clearNotes);

    // ─── Initial Render ───
    renderNotes();

    // ─── Console Message ───
    console.log('Meeting Notes Taker loaded successfully.');
});
