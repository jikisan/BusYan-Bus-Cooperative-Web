import firebaseConfig from '/CONFIG.js';
import { DBPaths } from '/Bus Cooperative/js/DB.js';

const database = firebase.database();


document.addEventListener('DOMContentLoaded', generateNotifs);

function generateNotifs() {

    const notifRef = database.ref(`${DBPaths.LOGIN_NOTIF}`);

    notifRef.orderByChild('role').equalTo('operator').once('value',
        (snapshot) => {
            snapshot.forEach((notif) => {

                const key = notif.key;
                const data = notif.val();
                data["key"] = key;

                createNotifItem(data.fullName);
            });


        }
    )

}

function createNotifItem(fullName) {
    const parentDiv = document.querySelector('.bus-notif-content');

    // Create notification container
    const notificationContainer = document.createElement('div');
    notificationContainer.classList.add('notification-items');

    // Create icon element
    const icon = document.createElement('i');
    icon.classList.add('fa-regular', 'fa-user');

    // Create notification text element
    const notificationTextElement = document.createElement('span');
    notificationTextElement.classList.add('notif-item');
    notificationTextElement.textContent = `${fullName} successfully login.`;

    // Append icon and text to the container
    notificationContainer.appendChild(icon);
    notificationContainer.appendChild(notificationTextElement);

    parentDiv.appendChild(notificationContainer);
}