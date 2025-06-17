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

// Intersection Observer for section animations
document.addEventListener('DOMContentLoaded', () => {
    // Select all sections that should animate on scroll
    const sectionsToAnimate = document.querySelectorAll('.hero, .photo-section, .photobooth-section'); //

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the 'animate' class when the section comes into view
                entry.target.classList.add('animate'); //
            } else {
                // Remove the 'animate' class when the section goes out of view
                // This allows the animation to play again when it re-enters the viewport
                entry.target.classList.remove('animate'); //
            }
        });
    }, {
        threshold: 0.2 // Trigger when 20% of the section is visible
    });

    // Observe each section
    sectionsToAnimate.forEach(section => {
        if (section) {
            observer.observe(section); //
        }
    });
});