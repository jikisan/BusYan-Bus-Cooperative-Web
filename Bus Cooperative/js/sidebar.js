import { convertToPascal } from '/Bus Cooperative/utils/Utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const menuLinks = document.querySelectorAll('.sidebar ul li');
    menuLinks.forEach(link => {
        const aTag = link.querySelector('a');
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const className = aTag.getAttribute('data-target');
            showContent(className);
        });
    });

    const menuItems = document.querySelectorAll('.sidebar ul li');
    menuItems.forEach(item => {
        item.addEventListener('click', handleMenuItemClick);
    });
});

function showContent(contentClassName) {
    const contentSections = document.querySelectorAll('.content-container > div');
    contentSections.forEach(section => {
        section.style.display = 'none';
    });

    const selectedContent = document.querySelector(`.${contentClassName}`);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
}

function handleMenuItemClick(event) {
    const menuItems = document.querySelectorAll('.sidebar ul li');
    menuItems.forEach(item => {
        item.classList.remove('selected-menu');
    });

    const menuIcons = document.querySelectorAll('.sidebar li i');
    menuIcons.forEach(icon => {
        icon.classList.remove('selected-menu-text');
    });

    const menuTexts = document.querySelectorAll('.sidebar li span');
    menuTexts.forEach(text => {
        text.classList.remove('selected-menu-text');
    });

    const clickedMenuItem = event.currentTarget;
    clickedMenuItem.classList.add('selected-menu');

    const iTag = clickedMenuItem.querySelector('i');
    if (iTag) {
        iTag.classList.add('selected-menu-text');
    }

    const spanText = clickedMenuItem.querySelector('span');
    if (spanText) {
        spanText.classList.add('selected-menu-text');
    }
}

window.onload = function() {
    fillUserData();
};

export function fillUserData( ) {
    const myData = JSON.parse(sessionStorage.getItem('currentUser'));

    if (myData === undefined || myData === null) {
        window.location.href = './../../login.html';
    }

    // Select the elements in the user detail section
    const userDetail = document.querySelector('.user-detail');
    const imgElement = userDetail.querySelector('img');
    const usernameLabel = userDetail.querySelector('label:nth-of-type(1)');
    const roleLabel = userDetail.querySelector('label:nth-of-type(2)');
    const imgPlaceHolder = './images/profile.png';

    // Set the values
    imgElement.src = myData.userImgSrc || imgPlaceHolder;
    usernameLabel.textContent = convertToPascal(myData.fullName);
    roleLabel.textContent = 'Bus Cooperative';
}