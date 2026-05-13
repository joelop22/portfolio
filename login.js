document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    if (user === 'joe.el' && pass === '53732004') {
        sessionStorage.setItem('auth', 'true');
        window.location.href = 'admin.html';
    } else {
        errorMsg.style.display = 'block';
    }
});
