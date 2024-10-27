document.addEventListener('DOMContentLoaded', function() {
    // Initialize the intl-tel-input plugin
    var teleinput = document.querySelector("#formphonenumber");
    var iti = window.intlTelInput(teleinput, {});

    // Reference to the #enternumber input field and other elements
    var enterNumberInput = document.getElementById('enternumber');
    var otpRequestButton = document.getElementById('otp_request');
    var onetimePasswordContainer = document.querySelector('.onetimepassword');
    var hitOrMissContainer = document.querySelector('.hit-or-miss');
    var otpVerifyButton = document.getElementById('otp_verify');
    var enterNumberLabel = enterNumberInput.nextElementSibling;

    // Hide OTP and hit-or-miss containers by default
    onetimePasswordContainer.style.display = 'none';
    hitOrMissContainer.style.display = 'none';

    // Function to set the country code
    function setCountryCode() {
        var countryCode = iti.getSelectedCountryData().dialCode;
        enterNumberInput.value = `+${countryCode} `;
        enterNumberInput.dataset.countryCode = `+${countryCode}`;
        updateLabelState();  // Ensure label state is updated when country code is set
    }

    // Listen for country change in the intl-tel-input plugin
    teleinput.addEventListener('countrychange', function() {
        setCountryCode();
        enterNumberInput.disabled = false;
        otpRequestButton.disabled = true;
        updateLabelState();
    });

    // Prevent users from deleting the country code and non-numeric input
    enterNumberInput.addEventListener('keydown', function(event) {
        var countryCode = enterNumberInput.dataset.countryCode;
        var allowedKeys = [8, 9, 35, 36, 46, 37, 39]; // Backspace, Tab, End, Home, Delete, Arrow keys

        if (enterNumberInput.selectionStart <= countryCode.length && !allowedKeys.includes(event.keyCode)) {
            event.preventDefault();
        }

        if (!allowedKeys.includes(event.keyCode) && (event.keyCode < 48 || event.keyCode > 57)) {
            event.preventDefault();
        }
    });

    // Handle input to enforce numeric-only input and enable/disable OTP request button
    enterNumberInput.addEventListener('input', function() {
        var countryCode = enterNumberInput.dataset.countryCode;
        enterNumberInput.value = enterNumberInput.value.replace(/[^0-9+ ]/g, '');
        if (!enterNumberInput.value.startsWith(countryCode)) {
            enterNumberInput.value = countryCode;
        }

        // Update label state based on input value
        updateLabelState();

        // Enable or disable the OTP request button based on input length
        if (enterNumberInput.value.length >= countryCode.length + 8) {
            otpRequestButton.disabled = false;
        } else {
            otpRequestButton.disabled = true;
        }
    });

    // Show OTP input fields when OTP request button is clicked
    otpRequestButton.addEventListener('click', function(event) {
        event.preventDefault();
        onetimePasswordContainer.style.display = 'flex';
        enterNumberInput.disabled = true; // Disable the phone number input after request
        enterNumberInput.setAttribute('readonly', true); // Make it read-only
        updateLabelState(true);  // Ensure label stays in valid state after clicking OTP request
    });

    // Handle OTP verification button click
    otpVerifyButton.addEventListener('click', function(event) {
        enterNumberInput.disabled = true;
        enterNumberInput.setAttribute('readonly', true); // Make it read-only
    });

    // Function to update the label state based on input value
    function updateLabelState(forceValid = false) {
        if (enterNumberInput.value.trim() !== "" || forceValid) {
            enterNumberLabel.classList.add('valid');
        } else {
            enterNumberLabel.classList.remove('valid');
        }
    }

    // OTP handling (similar logic as before)
    const otpInputs = document.querySelectorAll('.onetimepassword input');

    otpInputs.forEach((input, index) => {
        input.addEventListener('paste', pasteOTP);
        input.addEventListener('input', handleInput);
        input.addEventListener('keydown', controlOTP);
        input.addEventListener('keyup', restrictInput);
    });

    function pasteOTP(event) {
        event.preventDefault();
        const paste = event.clipboardData.getData('text').slice(0, 6);
        otpInputs.forEach((input, index) => {
            input.value = paste[index] || '';
        });
        otpInputs[0].focus();
        checkOTPCompletion();  // Check if all OTP inputs are filled
    }

    function handleInput(event) {
        const input = event.target;
        const value = input.value.slice(-1);
        if (/\D/.test(value)) {  // Check if the value is not a digit
            input.value = '';  // Clear the input value if it is not a digit
        } else {
            input.value = value;
            const nextInput = input.nextElementSibling;
            if (value && nextInput) {
                nextInput.focus();
            }
        }
        checkOTPCompletion();  // Check if all OTP inputs are filled
    }

    function controlOTP(event) {
        const input = event.target;
        if (event.key === 'Backspace' && input.value === '' && input.previousElementSibling) {
            input.previousElementSibling.focus();
        }
    }

    function restrictInput(event) {
        const input = event.target;
        input.value = input.value.replace(/\D/g, '');
    }

    function checkOTPCompletion() {
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        if (otp.length === 6) {
            otpInputs.forEach(input => {
                input.disabled = true;
                input.classList.add('locked');
            });
            otpVerifyButton.disabled = false;
        } else {
            otpVerifyButton.disabled = true;
        }
    }
});
