document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    if (user === 'joe.el' && pass === '53732004') {

        try {

            await firebase.auth().signInWithEmailAndPassword(
                "joelshajan2004@gmail.com",
                "53732004"
            );

            sessionStorage.setItem('auth', 'true');
            window.location.href = 'admin.html';

        } catch (error) {
            console.error(error);
            errorMsg.innerText = "Firebase login failed.";
            errorMsg.style.display = 'block';
        }

    } else {
        errorMsg.innerText = "Invalid credentials.";
        errorMsg.style.display = 'block';
    }
});
