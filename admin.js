document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-work-form');
    const worksList = document.getElementById('works-list');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('work-file');
    const previewImg = document.getElementById('preview-img');
    const dropZoneText = document.getElementById('drop-zone-text');
    const base64Input = document.getElementById('work-image-base64');

    const editIdInput = document.getElementById('edit-work-id');
    const submitBtn = document.getElementById('submit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Retrieve works from Firestore
    const getWorks = async () => {
        try {
            const snapshot = await db.collection('portfolioWorks').get();
            const works = [];
            snapshot.forEach(doc => works.push(doc.data()));
            return works;
        } catch (e) {
            console.error("Error fetching works: ", e);
            return [];
        }
    };

    const renderTable = async () => {
        worksList.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
        const works = await getWorks();
        worksList.innerHTML = '';

        // Sort newest first based on ID
        works.sort((a, b) => b.id - a.id).forEach(work => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${work.title}</td>
                <td><span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.9em;">${work.category}</span></td>
                <td><img src="${work.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                <td>
                    <button class="action-btn edit" onclick="editWork(${work.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="action-btn" onclick="deleteWork(${work.id})"><i class="fas fa-trash"></i> Delete</button>
                </td>
            `;
            worksList.appendChild(tr);
        });
    };

    // Global delete function
    window.deleteWork = async (id) => {
        if (confirm('Are you sure you want to delete this work?')) {
            try {
                await db.collection('portfolioWorks').doc(id.toString()).delete();
                renderTable();
            } catch (e) {
                alert("Error deleting work: " + e.message);
            }
        }
    };

    // Global edit function
    window.editWork = async (id) => {
        const works = await getWorks();
        const work = works.find(w => w.id === id);
        if (!work) return;

        document.getElementById('work-title').value = work.title;
        document.getElementById('work-category').value = work.category;

        // Setup image preview
        previewImg.src = work.image;
        previewImg.style.display = 'block';
        dropZoneText.style.display = 'none';
        base64Input.value = work.image; // Keep existing image if no new file is uploaded

        editIdInput.value = work.id;
        submitBtn.textContent = 'Update Portfolio Item';
        cancelEditBtn.style.display = 'block';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    cancelEditBtn.addEventListener('click', () => {
        resetForm();
    });

    const resetForm = () => {
        form.reset();
        editIdInput.value = '';
        base64Input.value = '';
        previewImg.src = '';
        previewImg.style.display = 'none';
        dropZoneText.style.display = 'block';
        submitBtn.textContent = 'Add to Portfolio';
        cancelEditBtn.style.display = 'none';
    };

    // --- Drag and Drop Logic with Compression ---

    const processFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                // Compress image using canvas
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress to 80% quality JPEG

                // Show preview and save dataURL
                previewImg.src = dataUrl;
                previewImg.style.display = 'block';
                dropZoneText.style.display = 'none';
                base64Input.value = dataUrl;
            };
        };
    };

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            processFile(e.target.files[0]);
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files; // Sync with actual input
            processFile(e.dataTransfer.files[0]);
        }
    });

    // --- Form Submission ---

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('work-title').value;
        const category = document.getElementById('work-category').value;
        const image = base64Input.value;
        const editId = editIdInput.value;

        if (!image) {
            alert('Please upload an image.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            if (editId) {
                // Update existing
                await db.collection('portfolioWorks').doc(editId.toString()).update({
                    title, category, image
                });
                alert('Work updated successfully!');
            } else {
                // Add new
                const works = await getWorks();
                const newId = works.length > 0 ? Math.max(...works.map(w => w.id)) + 1 : 1;
                await db.collection('portfolioWorks').doc(newId.toString()).set({
                    id: newId,
                    title,
                    category,
                    image
                });
                alert('Work added successfully!');
            }
            renderTable();
            resetForm();
        } catch (err) {
            alert('Error saving work: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = editIdInput.value ? 'Update Portfolio Item' : 'Add to Portfolio';
        }
    });

    // Initial render
    renderTable();
});
