document.addEventListener('DOMContentLoaded', function() {
    var teleinput = document.querySelector("#formphonenumber");
    var iti = window.intlTelInput(teleinput, {});
    // Reference to the #enternumber input field and other elements
    var enterNumberInput = document.getElementById('enternumber');
    var enterNumberLabel = enterNumberInput.nextElementSibling;
    // Dialcode Auto-placing
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
        updateLabelState();
    });
});