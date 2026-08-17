// Meeting Notes Taker – JavaScript Functionality

document.addEventListener('DOMContentLoaded', () => {

    // ─── DOM Elements ───
    const titleInput = document.getElementById('note-title');
    const noteInput = document.getElementById('note-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const notesList = document.getElementById('notes-list');
    const emptyState = document.getElementById('empty-state');
    const downloadTxtBtn = document.getElementById('download-txt-btn');
    const downloadDocBtn = document.getElementById('download-doc-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const clearBtn = document.getElementById('clear-btn');
    const formTitle = document.getElementById('form-title');

    // ─── State ───
    let editingId = null;

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
            li.className = 'note-item';
            li.dataset.id = note.id;

            // Header (title + time, clickable to toggle)
            const header = document.createElement('div');
            header.className = 'note-header';
            header.addEventListener('click', () => toggleNote(note.id));

            const titleEl = document.createElement('h3');
            titleEl.className = 'note-title';
            titleEl.textContent = note.title;

            const timeEl = document.createElement('span');
            timeEl.className = 'note-header-time';
            timeEl.textContent = formatTimestamp(note.timestamp);

            header.appendChild(titleEl);
            header.appendChild(timeEl);

            // Body (text + actions)
            const body = document.createElement('div');
            body.className = 'note-body';

            const textEl = document.createElement('p');
            textEl.className = 'note-text';
            textEl.textContent = note.text;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'note-actions';

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-icon edit';
            editBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
            `;
            editBtn.title = 'Edit note';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent toggle
                startEdit(note.id);
            });

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-icon delete';
            deleteBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
            `;
            deleteBtn.title = 'Delete note';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteNote(note.id);
            });

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);

            body.appendChild(textEl);
            body.appendChild(actionsDiv);

            li.appendChild(header);
            li.appendChild(body);

            notesList.appendChild(li);
        });
    }

    // ─── Toggle Note Expansion ───
    function toggleNote(id) {
        const item = document.querySelector(`.note-item[data-id="${id}"]`);
        if (item) {
            item.classList.toggle('expanded');
        }
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

    // ─── Add New Note or Update Existing ───
    function handleAddOrUpdate() {
        const title = titleInput.value.trim();
        const text = noteInput.value.trim();

        if (!title && !text) {
            alert('Please enter at least a title or note content.');
            return;
        }

        const notes = loadNotes();

        if (editingId !== null) {
            // Update existing note
            const index = notes.findIndex(note => note.id === editingId);
            if (index !== -1) {
                notes[index].title = title;
                notes[index].text = text;
                notes[index].timestamp = Date.now();
            }
            editingId = null;
            cancelEditBtn.style.display = 'none';
            addNoteBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add Note
            `;
            formTitle.textContent = 'Add a New Note';
        } else {
            // Add new note
            const newNote = {
                id: Date.now(),
                title: title || 'Untitled',
                text: text,
                timestamp: Date.now()
            };
            notes.push(newNote);
        }

        saveNotes(notes);
        titleInput.value = '';
        noteInput.value = '';
        noteInput.focus();
        renderNotes();
    }

    // ─── Start Editing a Note ───
    function startEdit(id) {
        const notes = loadNotes();
        const note = notes.find(n => n.id === id);
        if (!note) return;

        editingId = id;
        titleInput.value = note.title;
        noteInput.value = note.text;
        noteInput.focus();

        formTitle.textContent = 'Edit Note';
        addNoteBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Update Note
        `;
        cancelEditBtn.style.display = 'inline-flex';
    }

    // ─── Cancel Edit ───
    function cancelEdit() {
        editingId = null;
        titleInput.value = '';
        noteInput.value = '';
        formTitle.textContent = 'Add a New Note';
        addNoteBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add Note
        `;
        cancelEditBtn.style.display = 'none';
    }

    // ─── Delete a Single Note ───
    function deleteNote(id) {
        if (!confirm('Delete this note?')) return;

        let notes = loadNotes();
        notes = notes.filter(note => note.id !== id);
        saveNotes(notes);

        if (editingId === id) {
            cancelEdit();
        }

        renderNotes();
    }

    // ─── Download Notes as .txt ───
    function downloadTxt() {
        const notes = loadNotes();
        if (notes.length === 0) {
            alert('No notes to download.');
            return;
        }

        let content = 'Meeting Notes\n';
        content += '====================\n\n';
        notes.forEach((note) => {
            const date = new Date(note.timestamp).toLocaleString();
            content += `Title: ${note.title}\n`;
            content += `Date: ${date}\n`;
            content += `Notes:\n${note.text}\n\n`;
            content += '--------------------\n\n';
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

    // ─── Download Notes as .doc (Word-compatible) ───
    function downloadDoc() {
        const notes = loadNotes();
        if (notes.length === 0) {
            alert('No notes to download.');
            return;
        }

        let htmlContent = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Meeting Notes</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; }
                    .note { margin-bottom: 12px; border-left: 3px solid #ccc; padding-left: 10px; }
                    .note-title { font-weight: bold; font-size: 16px; margin-bottom: 4px; }
                    .note-time { color: #888; font-size: 12px; }
                    .note-text { white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <h1>Meeting Notes</h1>
        `;

        notes.forEach(note => {
            const date = new Date(note.timestamp).toLocaleString();
            htmlContent += `
                <div class="note">
                    <p class="note-title">${note.title}</p>
                    <p class="note-time">${date}</p>
                    <p class="note-text">${note.text.replace(/\n/g, '<br>')}</p>
                </div>
            `;
        });

        htmlContent += '</body></html>';

        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-notes-${new Date().toISOString().slice(0,10)}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ─── Save as PDF (via print dialog) ───
    function downloadPdf() {
        const notes = loadNotes();
        if (notes.length === 0) {
            alert('No notes to download.');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Meeting Notes</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 30px; }
                    h1 { color: #333; }
                    .note { margin-bottom: 12px; border-left: 3px solid #ccc; padding-left: 10px; }
                    .note-title { font-weight: bold; font-size: 16px; margin-bottom: 4px; }
                    .note-time { color: #888; font-size: 12px; }
                    .note-text { white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <h1>Meeting Notes</h1>
        `);

        notes.forEach(note => {
            const date = new Date(note.timestamp).toLocaleString();
            printWindow.document.write(`
                <div class="note">
                    <p class="note-title">${note.title}</p>
                    <p class="note-time">${date}</p>
                    <p class="note-text">${note.text.replace(/\n/g, '<br>')}</p>
                </div>
            `);
        });

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    // ─── Clear All Notes ───
    function clearNotes() {
        if (confirm('Are you sure you want to delete all notes?')) {
            localStorage.removeItem(STORAGE_KEY);
            cancelEdit();
            renderNotes();
        }
    }

    // ─── Event Listeners ───
    addNoteBtn.addEventListener('click', handleAddOrUpdate);
    cancelEditBtn.addEventListener('click', cancelEdit);
    titleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            noteInput.focus();
        }
    });
    noteInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddOrUpdate();
        }
    });
    downloadTxtBtn.addEventListener('click', downloadTxt);
    downloadDocBtn.addEventListener('click', downloadDoc);
    downloadPdfBtn.addEventListener('click', downloadPdf);
    clearBtn.addEventListener('click', clearNotes);

    // ─── Initial Render ───
    renderNotes();

    // ─── Console Message ───
    console.log('Meeting Notes Taker loaded successfully.');
});
