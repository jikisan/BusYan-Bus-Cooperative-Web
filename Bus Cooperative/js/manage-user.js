import { DBPaths } from '/Bus Cooperative/js/DB.js';
import { convertToPascal, getCurrentDateTimeInMillis } from '/Bus Cooperative/utils/Utils.js';

const database = firebase.database();

const loader = document.querySelector('.loader-container');
const modal = document.getElementById("myModal");

const addBusopBtn = document.getElementById('addBusopBtn');
const coopCloseBtn = document.querySelector('.close');

const addBusopForm = document.getElementById('addBusopForm');
const busOpUserPhoto = document.getElementById('busopUserPhoto');
const opFullnameInput = document.getElementById('opFullname');
const opEmailInput = document.getElementById('opFullEmail');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const phoneNumInput = document.getElementById('phoneNum');

const saveBusOpBtn = document.getElementById('saveBusopBtn');

let fileNameUserPhoto;
let fileUserPhoto;

addBusopBtn.addEventListener('click', showAddBusOpModal);
addBusopForm.addEventListener('submit', addBusOperator);
coopCloseBtn.addEventListener('click', hideAddBusCoopModal);

function addBusOperator(event) {
    event.preventDefault();

    const isConfirmed = window.confirm("Are you sure all information are correct?");

    if (isConfirmed && busOpDetailsAreValid()) {
        showLoader();
        uploadBusOpUserImage();    
    }

}

function uploadBusOpUserImage() {

    const ref = firebase.storage().ref(`${DBPaths.BUS_OPS}`);

    const metadata = {
        contentType: fileUserPhoto.type
    };

    const task = ref.child(fileNameUserPhoto).put(fileUserPhoto, metadata);

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
                console.log(downloadURL);
                createAccount(downloadURL);
            });
        }
    );

}

function createAccount(busOpUserImgUrl) {

    const busOpData = {
        fullName: opFullnameInput.value,
        email: opEmailInput.value,
        password: passwordInput.value,
        phoneNum: phoneNumInput.value,
        imageUrl: busOpUserImgUrl,
        datetimeAdded: new Date().toISOString()
    };

    const id = getCurrentDateTimeInMillis();

    const userRef = database.ref(`${DBPaths.BUS_OPS}/${id}`);

    userRef.set(busOpData)
        .then(() => {
            hideAddBusCoopModal();
            // getBusCoop();
        })
        .catch(error => {
            // An error occurred while setting data
            console.error('Error setting data:', error);
        });
            
    hideLoader();
}

// Function to validate form inputs
function busOpDetailsAreValid() {
    // Check if user photo is different from the placeholder image
    const busOpUserPhotoIsNotValid = busOpUserPhoto.src.includes('/images/profile.png');

    // Validate Email
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opEmailInput.value.trim());
    
    // Validate Password
    const passwordValid = passwordInput.value.trim().length >= 8;
    
    // Validate Confirm Password
    const confirmPasswordValid = confirmPasswordInput.value.trim() === passwordInput.value.trim();
    
    // Validate Phone Number
    const phoneNumValid = /^\d{11}$/.test(phoneNumInput.value.trim());

    if (busOpUserPhotoIsNotValid) {
        alert('Please select a user photo');
        return false;
    }

    if (!emailValid) {
        alert('Please enter a valid email address');
        return false;
    }

    if (!passwordValid) {
        alert('Password must be at least 8 characters long');
        return false;
    }

    if (!confirmPasswordValid) {
        alert('Passwords do not match');
        return false;
    }

    if (!phoneNumValid) {
        alert('Please enter a valid 11-digit phone number');
        return false;
    }

    return true;
}

function showAddBusOpModal() {
    modal.style.display = "block";
}

function hideAddBusCoopModal() {

    opFullnameInput.value = "";
    opEmailInput.value = "";
    passwordInput.value = "";
    confirmPasswordInput.value = "";
    phoneNumInput.value = "";

    modal.style.display = "none";
}

function showLoader() {
    loader.style.display = 'flex'
}

function hideLoader() {
    setTimeout(function() {
        loader.style.display = "none";
    }, 2000); // 3000 milliseconds = 3 seconds
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

window.addEventListener('load', function () {
    document.querySelector('#busopUserPhotoBtn').addEventListener('change', function (event) {
        if (this.files && this.files[0]) {
            busOpUserPhoto.onload = () => {
                URL.revokeObjectURL(busOpUserPhoto.src);
            }
            busOpUserPhoto.src = URL.createObjectURL(this.files[0]);
            fileNameUserPhoto = this.files[0].name;
            fileUserPhoto = event.target.files[0];
        }
    });
});
