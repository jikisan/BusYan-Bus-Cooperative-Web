// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, get, set, ref, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

import { convertToPascal, getCurrentDateTimeInMillis } from '/Bus Cooperative/utils/Utils.js';
import { DBPaths } from '/Bus Cooperative/js/DB.js';
import firebaseConfig from '/CONFIG.js';

const database = firebase.database();

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const dbRef = ref(getDatabase());
const db = getDatabase();

const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const modal = document.getElementById("myModal");
const coopModal = document.getElementById("coopModal");
const loader = document.querySelector('.loader-container');
const parentDiv = document.querySelector('.bus-coop-container');

const img = document.getElementById('busCoopImgBtn');
const busCoopUserPhoto = document.getElementById('busCoopUserPhoto');

const fullnameInput = document.getElementById('coopFullname');
const emailInput = document.getElementById('coopFullEmail');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const phoneNumInput = document.getElementById('phoneNum');

const companyName = document.getElementById('companyName');
const companyAddress = document.getElementById('companyAddress');
const companyDescription = document.getElementById('companyDescription');

let data;
let fileName;
let fileNameUserPhoto;
let file;
let fileUserPhoto;
let busCoopArray = [];

document.getElementById('addBusCoopBtn').addEventListener('click', showAddBusCoopModal);
document.getElementById('addBusCoopForm').addEventListener('submit', addBusCoop);
document.querySelector('.close').addEventListener('click', hideAddBusCoopModal);
document.getElementById('deleteCoopBtn').addEventListener('click', deleteBusCoop);
document.getElementById('searchInput').addEventListener('input', handleSearchInput);
document.querySelector('.coopClose').addEventListener('click', hideCoopModal);

document.addEventListener('DOMContentLoaded', getBusCoop);

function getBusCoop() {
    
    const busCoopContainer = document.querySelector('.bus-coop-container');
    busCoopContainer.innerHTML = "";
    busCoopArray = [];
    showLoader();

    const coopRef = database.ref(`${DBPaths.BUS_COOP}`);

    coopRef.once('value',
        (snapshot) => {
            snapshot.forEach((coop) => {

                const coopKey = coop.key;
                const coopData = coop.val();
                coopData["key"] = coopKey;
                busCoopArray.push(coopData);

                const companyName = coopData.companyName;
                const coopImage = coopData.imgSrc;

                createBusCoopCard(companyName, coopImage, coopKey);
            });

            hideLoader();

        }
    )


}

function createBusCoopCard(companyName, imageUrl, key) {
    // Create the elements
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('bus-coop-card');

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'bus coop img';

    const nameDiv = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = companyName;
    nameDiv.appendChild(strong);

    // Append elements to the cardDiv
    cardDiv.appendChild(img);
    cardDiv.appendChild(nameDiv);

    cardDiv.addEventListener('click', showCoopModal.bind(null, key));

    // Append the cardDiv to the parent div with class bus-coop-container
    parentDiv.appendChild(cardDiv);
}

function showAddBusCoopModal() {
    modal.style.display = "block";
}

function hideAddBusCoopModal() {

    fullnameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    confirmPasswordInput.value = "";
    phoneNumInput.value = "";

    companyName.value = "";
    companyAddress.value = "";
    companyDescription.value = "";

    modal.style.display = "none";
}

function showCoopModal(key) {
    coopModal.style.display = "block";

    get(child(dbRef, `${DBPaths.BUS_COOP}/${key}`))
        .then((snapshot) => {
            if (snapshot.exists()) {

                data = snapshot.val();
                const fullName = convertToPascal(data.fullname);

                document.getElementById('busUserCoopImg').src = data.usesImgSrc;;
                document.getElementById('coopId').textContent = key;
                document.getElementById('coopFullnameSpan').textContent = fullName;
                document.getElementById('coopEmail').textContent = data.email;
                document.getElementById('coopContact').textContent = data.phoneNum;

                document.getElementById('busCoopImg').src = data.imgSrc;;
                document.getElementById('coopName').textContent = data.companyName;
                document.getElementById('coopAddress').textContent = data.companyAddress;
                document.getElementById('coopDesc').textContent = data.companyDescription;
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

function hideCoopModal() {
    coopModal.style.display = "none";
}

function addBusCoop(event) {
    event.preventDefault();

    const isConfirmed = window.confirm("Are you sure all information are correct?");

    if (isConfirmed) {
        showLoader();
        uploadBusCoopImage();    }

}

function uploadBusCoopImage() {

    const ref = firebase.storage().ref(`${DBPaths.BUS_COOP}`);

    const metadata = {
        contentType: file.type
    };

    const task = ref.child(fileName).put(file, metadata);

    // Monitor the upload progress
    task.on('state_changed',
        function (snapshot) {
            // Handle progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload bus coop photo is ' + progress + '% done');
        },
        function (error) {
            // Handle errors
            console.error('Error uploading file: ', error);
        },
        function () {
            // Handle successful upload
            task.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                uploadBusCoopUserImage(downloadURL);
            });
        }
    );

}

function uploadBusCoopUserImage(busCoopImageUrl) {
    const ref = firebase.storage().ref(`${DBPaths.BUS_COOP}`);

    const metadata = {
        contentType: file.type
    };

    const task = ref.child(fileNameUserPhoto).put(fileUserPhoto, metadata);

    // Monitor the upload progress
    task.on('state_changed',
        function (snapshot) {
            // Handle progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload user photo is ' + progress + '% done');
        },
        function (error) {
            // Handle errors
            console.error('Error uploading file: ', error);
        },
        function () {
            // Handle successful upload
            task.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                createAccount(busCoopImageUrl, downloadURL);
            });
        }
    );
}

function createAccount(busCoopImageUrl, busCoopUserImageUrl) {

    const busCoopData = {
        fullname: fullnameInput.value,
        email: emailInput.value,
        phoneNum: phoneNumInput.value,
        imgSrc: busCoopImageUrl,
        usesImgSrc: busCoopUserImageUrl,
        companyName: companyName.value,
        companyAddress: companyAddress.value,
        companyDescription: companyDescription.value,
        datetimeAdded: new Date().toISOString()
    };

    const id = getCurrentDateTimeInMillis();
    const userRef = ref(db, `${DBPaths.BUS_COOP}/${id}`);
    set(userRef, busCoopData)
        .then(() => {
            hideAddBusCoopModal();
            getBusCoop();
        })
        .catch(error => {
            // An error occurred while setting data
            console.error('Error setting data:', error);
        });
            
    

    hideLoader();
}

function showLoader() {
    loader.style.display = 'flex'
}

function hideLoader() {
    loader.style.display = "none";
}

function deleteBusCoop() {

    const isConfirmed = window.confirm("Are you sure you want to remove this account?");

    if(isConfirmed) {
        const key = document.getElementById('coopId').textContent;
        const dbRef = firebase.database().ref(`${DBPaths.BUS_COOP}/${key}`);
            
        dbRef.remove()
            .then(() => {
                console.log('User data deleted successfully.');                
                signInWithEmailAndPassword
                getBusCoop();
                hideCoopModal();
                
            })
            .catch((error) => {
                console.error('Error deleting user data:', error);
            });
    }
    

}

function handleSearchInput() {

    const busCoopContainer = document.querySelector('.bus-coop-container');
    busCoopContainer.innerHTML = "";

    const searchInput = document.getElementById("searchInput");
    const searchTerm = searchInput.value.toLowerCase().trim();

    // Filter data based on search term
    const results = busCoopArray.filter(item => item.companyName.toLowerCase().includes(searchTerm));
    // Render search results
    renderResults(results);
}

function renderResults(results) {
    const searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = "";

    console.log(results);

    results.forEach(result => {

        const companyName = result.companyName;
        const coopImage = result.imgSrc;
        const key = result.key;

        createBusCoopCard(companyName, coopImage, key);
    });
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

window.addEventListener('load', function () {
    document.querySelector('#addCoopPhotoBtn').addEventListener('change', function (event) {
        if (this.files && this.files[0]) {
            img.onload = () => {
                URL.revokeObjectURL(img.src);
            }
            img.src = URL.createObjectURL(this.files[0]);
            fileName = this.files[0].name;
            file = event.target.files[0];
        }
    });
});

window.addEventListener('load', function () {
    document.querySelector('#busCoopUserPhotoBtn').addEventListener('change', function (event) {
        if (this.files && this.files[0]) {
            busCoopUserPhoto.onload = () => {
                URL.revokeObjectURL(busCoopUserPhoto.src);
            }
            busCoopUserPhoto.src = URL.createObjectURL(this.files[0]);
            fileNameUserPhoto = this.files[0].name;
            fileUserPhoto = event.target.files[0];
        }
    });
});

// Function to validate form inputs
function busCoopLoginDetailsIsValid() {
    let isValid = true;

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
        isValid = false;
        alert('Please enter a valid email address');
        return isValid;
    }

    // Validate Password
    if (passwordInput.value.trim().length < 8) {
        isValid = false;
        alert('Password must be at least 6 characters long');
        return isValid;
    }

    // Validate Confirm Password
    if (confirmPasswordInput.value.trim() !== passwordInput.value.trim()) {
        isValid = false;
        alert('Passwords do not match');
        return isValid;
    }

    // Validate Phone Number
    const phoneNumPattern = /^\d{11}$/; // Assuming phone number is 10 digits
    if (!phoneNumPattern.test(phoneNumInput.value.trim())) {
        isValid = false;
        alert('Please enter a valid 10-digit phone number');
        return isValid;
    }

    return isValid;
}
