
// STUDENT MONEY TRACKER
// Login and Signup Form Validation

// SIGNUP FORM
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!name || !email || !password || !confirmPassword) {
            alert("Please fill in all fields!");
            return;
        }

        if (password.length < 8) {
            alert("Password must contain at least 8 characters!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        alert("Signup form validated successfully! Backend connection is coming next.");
    });
}


// LOGIN FORM
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Please enter your email and password!");
            return;
        }

        alert("Login form validated! Real authentication will be enabled after backend integration.");
    });
}
