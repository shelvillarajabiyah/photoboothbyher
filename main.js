// Navigation
const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });

// --- Menambah tombol Upload di index.html ---
const mainUploadBtn = document.getElementById('main-upload-btn'); //
const mainPhotoUploadInput = document.getElementById('main-photo-upload-input'); //
const totalPhotosForUpload = 3; 

if (mainUploadBtn && mainPhotoUploadInput) { //
    mainUploadBtn.addEventListener('click', () => { //
        mainPhotoUploadInput.click(); // 
    });

    mainPhotoUploadInput.addEventListener('change', handleMainPhotoUpload); //
}

async function handleMainPhotoUpload(event) { //
    const files = event.target.files; //
    let uploadedPhotosData = []; //

    if (files.length === 0) { //
        // User cancelled file selection
        return;
    }

    if (files.length !== totalPhotosForUpload) { //
        alert(`Harap unggah tepat ${totalPhotosForUpload} foto.`); //
        mainPhotoUploadInput.value = ''; // Reset input file for re-selection
        return;
    }

    // Loop through files and read them as Data URLs
    for (let i = 0; i < files.length; i++) { //
        const file = files[i]; //
        if (!file.type.startsWith('image/')) { //
            alert('Hanya file gambar yang diizinkan.'); //
            mainPhotoUploadInput.value = ''; // Reset input file
            return;
        }

        await new Promise(resolve => { //
            const reader = new FileReader(); //
            reader.onload = (e) => { //
                uploadedPhotosData.push(e.target.result); //
                resolve(); //
            };
            reader.readAsDataURL(file); //
        });
    }

    // Simpan foto yang diunggah ke localStorage
    localStorage.setItem('uploadedPhotos', JSON.stringify(uploadedPhotosData)); //
    // Tambah flag agar photobooth.html tahu ini dari upload
    localStorage.setItem('isFromUpload', 'true'); //

    // Arahkan ke halaman photobooth
    window.location.href = 'photobooth.html'; //

    // Reset input file setelah pengiriman
    mainPhotoUploadInput.value = ''; //
}
// --- Akhir tambahan untuk tombol Upload di index.html ---