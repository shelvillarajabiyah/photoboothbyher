// Navigation (JavaScript)
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) { // Pastikan elemen ada sebelum menambahkan event listener
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });
}

// Photobooth (JavaScript)
let currentFilter = 'normal';
let photos = []; // Menyimpan data URL dari foto yang diambil
let currentPhotoIndex = 0;
let stream; // Untuk menyimpan stream kamera
let isCountingDown = false; // Status apakah countdown sedang berjalan
const totalPhotos = 3; // Jumlah total foto yang akan diambil

// Dapatkan elemen DOM yang sering digunakan
const videoEl = document.getElementById('video');
const canvasEl = document.getElementById('canvas');
const countdownEl = document.getElementById('countdown');
const photoCountEl = document.getElementById('photo-count');
const thumbnailsEl = document.getElementById('thumbnails');
const doneBtn = document.getElementById('done-btn');
const startBtn = document.getElementById('start-btn');
const retakeBtn = document.getElementById('retake-btn');
const stripDateEl = document.getElementById('strip-date');

// Fungsi untuk menginisialisasi kamera
async function initCamera() { //
    try { //
        if (stream) { //
            stream.getTracks().forEach(track => track.stop()); //
        }
        // Pastikan video elemen aktif dan terlihat
        videoEl.style.display = 'block'; //
        stream = await navigator.mediaDevices.getUserMedia({ //
            video: { //
                width: { ideal: 1280 }, //
                height: { ideal: 720 }, //
                facingMode: 'user' // Menggunakan kamera depan
            }
        }); //
        videoEl.srcObject = stream; //
    } catch (err) { //
        console.error('Error accessing camera:', err); //
        alert('Akses kamera diperlukan agar aplikasi ini berfungsi. Pastikan kamera Anda tidak digunakan oleh aplikasi lain dan berikan izin.'); //
    }
}

// Fungsi untuk mengatur filter video
function setFilter(filter) { //
    currentFilter = filter; //
    videoEl.className = ''; //
    if (filter !== 'normal') { //
        videoEl.classList.add(`filter-${filter}`); //
    }
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active')); //
    // Menggunakan event.currentTarget untuk mengakses elemen yang diklik
    const clickedButton = event ? event.currentTarget : null; //
    if (clickedButton) { //
        clickedButton.classList.add('active'); //
    }
}

// Fungsi untuk memulai sesi foto (dari kamera)
function startPhotoSession() { //
    if (isCountingDown) return; //

    currentPhotoIndex = 0; //
    photos = []; //
    thumbnailsEl.innerHTML = ''; //
    doneBtn.style.display = 'none'; //
    startBtn.style.display = 'none'; //
    retakeBtn.style.display = 'block'; //
    photoCountEl.textContent = `Photo 1 of ${totalPhotos}`; //

    initCamera(); // Pastikan kamera aktif saat memulai sesi
    takeNextPhoto(); //
}

// Fungsi untuk mengambil foto berikutnya dalam sesi
function takeNextPhoto() { //
    if (currentPhotoIndex >= totalPhotos) { //
        finishPhotoSession(); //
        return; //
    }

    updatePhotoCount(); //
    startCountdown(() => { //
        capturePhoto(); //
        currentPhotoIndex++; //
        setTimeout(() => { //
            if (currentPhotoIndex < totalPhotos) { //
                takeNextPhoto(); //
            } else { //
                finishPhotoSession(); //
            }
        }, 1000); //
    });
}

// Fungsi untuk memulai hitungan mundur sebelum mengambil foto
function startCountdown(callback) { //
    if (isCountingDown) return; //

    isCountingDown = true; //
    countdownEl.style.display = 'block'; //

    let count = 3; //
    countdownEl.textContent = count; //

    const countInterval = setInterval(() => { //
        count--; //
        if (count > 0) { //
            countdownEl.textContent = count; //
        } else { //
            countdownEl.style.display = 'none'; //
            clearInterval(countInterval); //
            isCountingDown = false; //
            callback(); //
        }
    }, 1000); //
}

// Fungsi untuk menangkap foto dari stream video ke canvas dan menerapkan filter
function capturePhoto() { //
    const ctx = canvasEl.getContext('2d'); //
    canvasEl.width = videoEl.videoWidth; //
    canvasEl.height = videoEl.videoHeight; //
    ctx.scale(-1, 1); //
    ctx.drawImage(videoEl, -canvasEl.width, 0, canvasEl.width, canvasEl.height); //
    ctx.setTransform(1, 0, 0, 1, 0, 0); //

    if (currentFilter !== 'normal') { //
        applyCanvasFilter(ctx, canvasEl, currentFilter); //
    }

    const photoData = canvasEl.toDataURL('image/jpeg'); //
    photos.push(photoData); //
    addThumbnail(photoData); //
}

// Fungsi untuk menerapkan filter ke data piksel canvas
function applyCanvasFilter(ctx, canvas, filter) { //
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); //
    const data = imageData.data; //

    for (let i = 0; i < data.length; i += 4) { //
        let r = data[i]; let g = data[i + 1]; let b = data[i + 2]; //
        switch (filter) { //
            case 'bw': const gray = 0.299 * r + 0.587 * g + 0.114 * b; data[i] = data[i + 1] = data[i + 2] = gray; break; //
            case 'warm': data[i] = Math.min(255, r * 1.2 + 20); data[i + 1] = Math.min(255, g * 1.1 + 10); data[i + 2] = Math.max(0, b * 0.8 - 10); break; //
            case 'golden': data[i] = Math.min(255, r * 1.3 + 40); data[i + 1] = Math.min(255, g * 1.2 + 30); data[i + 2] = Math.min(255, b * 0.7 + 10); break; //
            case 'cool': data[i] = Math.max(0, r * 0.8 - 10); data[i + 1] = Math.min(255, g * 1.1 + 10); data[i + 2] = Math.min(255, b * 1.2 + 20); break; //
            case 'vintage': //
                const avg = (r + g + b) / 3; //
                const sepiaR = Math.min(255, avg + 2 * (r - avg)); //
                const sepiaG = Math.min(255, avg + 0.5 * (g - avg)); //
                const sepiaB = Math.min(255, avg - 1.5 * (b - avg)); //
                data[i] = sepiaR * 1.1 + 10; data[i + 1] = sepiaG * 1.1 + 5; data[i + 2] = sepiaB * 0.9; //
                const factor = 1.2; //
                data[i] = Math.min(255, factor * (data[i] - 128) + 128); data[i + 1] = Math.min(255, factor * (data[i + 1] - 128) + 128); data[i + 2] = Math.min(255, factor * (data[i + 2] - 128) + 128); break; //
        }
    }
    ctx.putImageData(imageData, 0, 0); //
}

function addThumbnail(photoData) { //
    const thumbnail = document.createElement('div'); //
    thumbnail.className = 'thumbnail'; //
    thumbnail.innerHTML = `<img src="${photoData}" alt="Photo ${photos.length}">`; //
    thumbnailsEl.appendChild(thumbnail); //
}

function updatePhotoCount() { //
    photoCountEl.textContent = `Photo ${currentPhotoIndex + 1} of ${totalPhotos}`; //
}

function finishPhotoSession() { //
    doneBtn.style.display = 'block'; //
    photoCountEl.textContent = 'Photos complete!'; //
    startBtn.style.display = 'none'; //
}

function retakePhotos() { //
    photos = []; //
    currentPhotoIndex = 0; //
    thumbnailsEl.innerHTML = ''; //
    doneBtn.style.display = 'none'; //
    photoCountEl.textContent = ''; //
    startBtn.style.display = 'block'; //
    retakeBtn.style.display = 'none'; //
    countdownEl.style.display = 'none'; //
    isCountingDown = false; //
    initCamera(); // Hidupkan kembali kamera jika kembali ke mode kamera
}

function goToCustomize() { //
    if (photos.length < totalPhotos) { //
        alert(`Harap ambil ${totalPhotos} foto terlebih dahulu!`); //
        return; //
    }
    // Hentikan stream kamera saat beralih ke halaman kustomisasi
    if (stream) { //
        stream.getTracks().forEach(track => track.stop()); //
        videoEl.style.display = 'none'; // Sembunyikan video elemen
    }
    document.getElementById('photobooth-page').classList.remove('active'); //
    document.getElementById('customize-page').classList.add('active'); //

    for (let i = 0; i < totalPhotos; i++) { //
        const stripPhotoImg = document.getElementById(`strip-img-${i + 1}`); //
        stripPhotoImg.src = photos[i]; //
        // Terapkan filter yang sama pada gambar strip jika ada
        if (currentFilter !== 'normal') { //
            stripPhotoImg.className = `filter-${currentFilter}`; //
        } else { //
            stripPhotoImg.className = ''; //
        }
    }
    updateStripDateTime(); //
    document.getElementById('add-date').checked = true; //
    document.getElementById('add-time').checked = true; //
    toggleDate(); //
}

function goBackToPhotobooth() { //
    document.getElementById('customize-page').classList.remove('active'); //
    document.getElementById('photobooth-page').classList.add('active'); //
    initCamera(); //
    retakePhotos(); //
}

function setFrameColor(color) { //
    document.getElementById('photo-strip').style.background = color; //
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active')); //
    const clickedButton = event ? event.currentTarget : null; //
    if (clickedButton) { //
        clickedButton.classList.add('active'); //
    }
}

function setPhotoShape(shape) { //
    const stripPhotos = document.querySelectorAll('.strip-photo'); //
    stripPhotos.forEach(photo => { //
        switch (shape) { //
            case 'circle': photo.style.borderRadius = '50%'; break; //
            case 'rounded': photo.style.borderRadius = '20px'; break; //
            default: photo.style.borderRadius = '5px'; //
        }
    }); //
    document.querySelectorAll('.shape-option').forEach(opt => opt.classList.remove('active')); //
    const clickedButton = event ? event.currentTarget : null; //
    if (clickedButton) { //
        clickedButton.classList.add('active'); //
    }
}

function addSticker(sticker) { //
    alert(`Stiker ${sticker} ditambahkan! (Ini adalah demo. Untuk implementasi penuh, Anda perlu menambahkan elemen stiker secara visual di strip.)`); //
}

function updateStripDateTime() { //
    const now = new Date(); //
    const dateCheckbox = document.getElementById('add-date'); //
    const timeCheckbox = document.getElementById('add-time'); //
    let dateString = ''; //
    if (dateCheckbox.checked) { dateString = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }); } //
    if (timeCheckbox.checked) { //
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true }; //
        const timeString = now.toLocaleTimeString('en-US', timeOptions); //
        dateString += (dateString ? ' ' : '') + timeString; //
    }
    stripDateEl.textContent = dateString; //
    stripDateEl.style.display = (dateString === '') ? 'none' : 'block'; //
}

function toggleDate() { updateStripDateTime(); } //
function toggleTime() { updateStripDateTime(); } //

function setLanguage(lang) { //
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active')); //
    const clickedButton = event ? event.currentTarget : null; //
    if (clickedButton) { //
        clickedButton.classList.add('active'); //
    }
    const brandingTextEl = document.querySelector('.strip-branding div:first-child'); //
    switch (lang) { //
        case 'KOR': brandingTextEl.textContent = '포토부스'; break; //
        case 'CN': brandingTextEl.textContent = '照相亭'; break; //
        default: brandingTextEl.textContent = 'Photobooth By Her'; // 
    }
}

function downloadPhotos() { //
    const strip = document.getElementById('photo-strip'); //
    const rect = strip.getBoundingClientRect();
    const stripWidth = rect.width; //
    const stripHeight = rect.height; //

    const outputScale = 3;
    
    html2canvas(strip, { //
        allowTaint: true, //
        useCORS: true, //
        width: stripWidth, //
        height: stripHeight, //
        scale: outputScale, //
        backgroundColor: null //
    }).then(canvas => { //
        const link = document.createElement('a'); //
        link.download = 'photobooth-strip.png'; //
        link.href = canvas.toDataURL('image/png'); //
        document.body.appendChild(link); //
        link.click(); //
        document.body.removeChild(link); //
    }).catch(err => { //
        console.error("Error saat menghasilkan photostrip untuk download:", err); //
        alert("Gagal membuat gambar untuk diunduh. Silakan coba lagi."); //
    });
}

function toggleFullscreen() { //
    if (!document.fullscreenElement) { //
        document.documentElement.requestFullscreen(); //
    } else { //
        document.exitFullscreen(); //
    }
}

// Tambahan logika untuk menangani foto dari upload di index.html
function handleLoadedFromUpload() { //
    const isFromUpload = localStorage.getItem('isFromUpload'); //
    const uploadedPhotosJson = localStorage.getItem('uploadedPhotos'); //

    if (isFromUpload === 'true' && uploadedPhotosJson) { //
        try { //
            photos = JSON.parse(uploadedPhotosJson); //
            localStorage.removeItem('uploadedPhotos'); // 
            localStorage.removeItem('isFromUpload'); // 

            // Sembunyikan elemen kamera karena kita menggunakan foto yang diunggah
            if (stream) { //
                stream.getTracks().forEach(track => track.stop()); //
            }
            videoEl.style.display = 'none'; // Sembunyikan elemen video
            countdownEl.style.display = 'none'; //
            photoCountEl.textContent = 'Photos uploaded!'; //
            startBtn.style.display = 'none'; // Sembunyikan tombol "Start Photos"
            retakeBtn.style.display = 'block'; // Tampilkan tombol "Retake"
            doneBtn.style.display = 'block'; // Tampilkan tombol "DONE"

            // Tampilkan thumbnail foto yang diunggah
            thumbnailsEl.innerHTML = ''; // Bersihkan thumbnail yang mungkin ada
            photos.forEach(photoData => { //
                addThumbnail(photoData); //
            }); //

            // Langsung arahkan ke halaman kustomisasi
            // Namun, karena ini dipanggil saat load, goToCustomize() akan beralih halaman.
            // Kita perlu memastikan semua elemen sudah ada di DOM saat ini.
            // Atau, kita bisa membiarkan photobooth-page tetap aktif dan hanya menampilkan thumbnail,
            // dan pengguna mengklik DONE secara manual.
            // Pilihan yang lebih baik adalah memicu goToCustomize() setelah semuanya siap.
            goToCustomize(); //

        } catch (e) { //
            console.error("Error parsing uploaded photos from localStorage:", e); //
            // Fallback ke mode kamera jika data rusak
            initCamera(); //
            retakePhotos(); //
        }
    } else { // Jika tidak ada data upload, mulai kamera seperti biasa
        initCamera(); //
        retakePhotos(); //
    }
}


window.addEventListener('load', () => { //
    handleLoadedFromUpload(); // Panggil fungsi baru ini saat halaman dimuat
    document.getElementById('add-time').checked = true; //
    updateStripDateTime(); //
}); //

document.addEventListener('visibilitychange', () => { //
    if (document.hidden && stream) { //
        stream.getTracks().forEach(track => track.stop()); //
    } else if (!document.hidden && document.getElementById('photobooth-page').classList.contains('active')) { //
        initCamera(); //
    }
}); //