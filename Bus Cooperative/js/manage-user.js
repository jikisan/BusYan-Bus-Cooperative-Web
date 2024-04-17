import { DBPaths } from '/Bus Cooperative/js/DB.js';
import { convertToPascal, getCurrentDateTimeInMillis } from '/Bus Cooperative/utils/Utils.js';

const database = firebase.database();

const loader = document.querySelector('.loader-container');
const modal = document.getElementById("myModal");

const searchInput = document.getElementById("searchInput");

const addBusopBtn = document.getElementById('addBusopBtn');
const coopCloseBtn = document.querySelector('.close');

const busopUserPhotoBtn = document.querySelector('#busopUserPhotoBtn');

const addBusopForm = document.getElementById('addBusopForm');
const busOpUserPhoto = document.getElementById('busopUserPhoto');
const opFullnameInput = document.getElementById('opFullname');
const opEmailInput = document.getElementById('opFullEmail');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const phoneNumInput = document.getElementById('phoneNum');

const saveBusOpBtn = document.getElementById('saveBusopBtn');

const table = document.getElementById("operators-table");

let manageUserAction = document.getElementById("manageUserAction");
let operatorId;
let fileNameUserPhoto;
let fileUserPhoto;
let busOpArray = [];

addBusopBtn.addEventListener('click', addOperator);
addBusopForm.addEventListener('submit', addBusOperator);
coopCloseBtn.addEventListener('click', hideAddBusCoopModal);
searchInput.addEventListener('input', handleSearchInput);

document.addEventListener('DOMContentLoaded', getBusOperators);

function getBusOperators() {

    createTableHeader();
    busOpArray = [];
    showLoader();

    const opRef = database.ref(`${DBPaths.BUS_OPS}`);

    opRef.once('value',
        (snapshot) => {
            snapshot.forEach((op) => {

                const opKey = op.key;
                const opData = op.val();
                opData["key"] = opKey;
                busOpArray.push(opData);

                const companyName = opData.companyName;
                const opImage = opData.imgUrl;

                addOperatorToTable(opData);
            });

            hideLoader();

        }
    )
}

function createTableHeader() {

    table.innerHTML = "";
    const tr = document.createElement("tr");

    // Array of column headers
    const headers = [
        "ID no.",
        "Fullname",
        "Email",
        "Contact No.",
        "Picture",
        "Password",
        "Date Created",
        "Actions"
    ];

    // Create <th> elements for each column header and append them to the <tr> element
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        tr.appendChild(th);
    });

    table.appendChild(tr);

}

function addOperatorToTable(operator) {

    const id = operator.key;
    const fullname = operator.fullName;
    const email = operator.email;
    const contactNo = operator.phoneNum;
    const pictureSrc = operator.imageUrl;
    const password = operator.password;
    const dateCreated = convertToDesiredFormat(operator.datetimeAdded);

    const newRow = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = id;
    newRow.appendChild(idCell);

    const fullnameCell = document.createElement("td");
    fullnameCell.textContent = fullname;
    newRow.appendChild(fullnameCell);

    const emailCell = document.createElement("td");
    emailCell.textContent = email;
    newRow.appendChild(emailCell);

    const contactNoCell = document.createElement("td");
    contactNoCell.textContent = contactNo;
    newRow.appendChild(contactNoCell);

    const pictureCell = document.createElement("td");
    const pictureImg = document.createElement("img");
    pictureImg.src = pictureSrc;
    pictureImg.alt = "img";
    pictureCell.appendChild(pictureImg);
    newRow.appendChild(pictureCell);

    const passwordCell = document.createElement("td");
    passwordCell.textContent = password;
    newRow.appendChild(passwordCell);

    const dateCreatedCell = document.createElement("td");
    dateCreatedCell.textContent = dateCreated;
    newRow.appendChild(dateCreatedCell);

    const actionsCell = document.createElement("td");

    // Edit icon
    const editLink = document.createElement("a");
    editLink.href = "#";
    editLink.setAttribute("data-target", "edit-operator");
    const editIcon = document.createElement("i");
    editIcon.className = "fa-solid fa-user-pen edit";
    editLink.appendChild(editIcon);
    const editSpan = document.createElement("span");
    editLink.appendChild(editSpan);
    actionsCell.appendChild(editLink);

    // Add event listener for editing
    editLink.addEventListener("click", function () {
        // Call edit function here
        editOperator(operator);
    });

    // Delete icon
    const deleteLink = document.createElement("a");
    deleteLink.href = "#";
    deleteLink.setAttribute("data-target", "delete-operator");
    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fa-solid fa-eraser delete";
    deleteLink.appendChild(deleteIcon);
    const deleteSpan = document.createElement("span");
    deleteLink.appendChild(deleteSpan);
    actionsCell.appendChild(deleteLink);

    // Add event listener for deleting
    deleteLink.addEventListener("click", function () {
        // Call delete function here
        deleteOperator(id);
    });

    newRow.appendChild(actionsCell);

    table.appendChild(newRow);
}

function handleSearchInput() {

    createTableHeader();

    const searchTerm = searchInput.value.toLowerCase().trim();

    // Filter data based on search term
    const results = busOpArray.filter(item => item.fullName.toLowerCase().includes(searchTerm));
    // Render search results
    renderResults(results);
}

function renderResults(results) {
    const searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = "";

    results.forEach(result => {

        addOperatorToTable(result);
    });
}

function addOperator() {
    manageUserAction.textContent = 'Add';
    showAddBusOpModal();
}

// Function to handle edit operator
function editOperator(operator) {

    manageUserAction.textContent = 'Edit';

    showAddBusOpModal();
    operatorId = operator.key;
    busOpUserPhoto.src = operator.imageUrl;
    opFullnameInput.value = operator.fullName;
    opEmailInput.value = operator.email;
    passwordInput.value = operator.password;
    confirmPasswordInput.value = operator.password;
    phoneNumInput.value = operator.phoneNum;
}

// Function to handle delete operator
function deleteOperator(operatorId) {
    // Implement delete functionality here
    deleteBusOp(operatorId);
}

function addBusOperator(event) {
    event.preventDefault();

    const isConfirmed = window.confirm("Are you sure all information are correct?");

    if (isConfirmed && busOpDetailsAreValid()) {
        const action = manageUserAction.textContent;

        showLoader();

        if (action === 'Add') {
            uploadBusOpUserImage();
        }
        if (action === 'Edit') {
            validateImage()
        }
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
                const action = manageUserAction.textContent;

                if (action === 'Add') {
                    createAccount(downloadURL);
                }
                if (action === 'Edit') {
                    updateAccount(downloadURL);
                }

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
            getBusOperators();
        })
        .catch(error => {
            // An error occurred while setting data
            console.error('Error setting data:', error);
        });

    hideLoader();
}

function updateAccount(busOpUserImgUrl) {
    const busOpData = {
        fullName: opFullnameInput.value,
        email: opEmailInput.value,
        password: passwordInput.value,
        phoneNum: phoneNumInput.value,
        imageUrl: busOpUserImgUrl,

    };

    const userRef = firebase.database().ref(`${DBPaths.BUS_OPS}/${operatorId}`);
    userRef.update(busOpData)
        .then(() => {
            hideAddBusCoopModal();
            getBusOperators();
        })
        .catch(error => {
            console.error('Error updating multiple fields:', error);
        });

}

function validateImage() {

    if (busopUserPhotoBtn && (busopUserPhotoBtn.files.length === 0 || busopUserPhotoBtn.value === '')) {
        const imgeSrc = busOpUserPhoto.src;
        updateAccount(imgeSrc);
    }
    else {
        uploadBusOpUserImage();
        console.log('With Photo');
    }

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
    setTimeout(function () {
        loader.style.display = "none";
    }, 2000); // 3000 milliseconds = 3 seconds
}

function convertToDesiredFormat(dateString) {
    try {
        // Parse the date string with timezone offset using Date object
        const date = new Date(dateString);

        // Year, month (0-indexed), day
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // Format the date in YYYY/MM/DD
        return `${year}/${month}/${day}`;
    } catch (error) {
        // Handle invalid date format errors
        return "Invalid date format";
    }
}

function deleteBusOp(key) {

    const isConfirmed = window.confirm("Are you sure you want to remove this account?");

    if (isConfirmed) {
        const dbRef = firebase.database().ref(`${DBPaths.BUS_OPS}/${key}`);

        dbRef.remove()
            .then(() => {
                console.log('User data deleted successfully.');
                getBusOperators();
            })
            .catch((error) => {
                console.error('Error deleting user data:', error);
            });
    }
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

window.addEventListener('load', function () {

    busopUserPhotoBtn.addEventListener('change', function (event) {
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
