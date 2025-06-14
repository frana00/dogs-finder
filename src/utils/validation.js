// Validation utilities for form inputs

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if validation errors object has any errors
export const hasFormErrors = (errors) => {
  if (!errors) return false;
  
  // If errors is an object with an 'errors' property (from validateProfileForm/validateAlertForm)
  if (errors.errors && typeof errors.errors === 'object') {
    return Object.keys(errors.errors).some(key => errors.errors[key] !== null && errors.errors[key] !== undefined);
  }
  
  // If errors is a direct errors object
  if (typeof errors === 'object') {
    return Object.keys(errors).some(key => errors[key] !== null && errors[key] !== undefined);
  }
  
  return false;
};

export const validateEmailField = (email) => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null; // No error
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return 'Phone number is required';
  }
  
  // Basic phone validation - adjust regex as needed
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Please enter a valid phone number';
  }
  
  return null;
};

export const validatePostalCode = (postalCode) => {
  if (!postalCode || postalCode.trim() === '') {
    return 'Postal code is required';
  }
  
  // Basic postal code validation - adjust as needed for your region
  if (postalCode.length < 3) {
    return 'Please enter a valid postal code';
  }
  
  return null;
};

// Registration form validation
export const validateRegistrationForm = (registrationData) => {
  const errors = {};
  
  // Validate username
  const usernameError = validateRequired(registrationData.username, 'Username');
  if (usernameError) {
    errors.username = usernameError;
  }
  
  // Validate email
  const emailError = validateEmailField(registrationData.email);
  if (emailError) {
    errors.email = emailError;
  }
  
  // Validate password
  const passwordError = validatePassword(registrationData.password);
  if (passwordError) {
    errors.password = passwordError;
  }
  
  // Validate confirm password
  const confirmPasswordError = validateConfirmPassword(registrationData.password, registrationData.confirmPassword);
  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError;
  }
  
  // Phone number is optional for registration, but validate if provided
  if (registrationData.phoneNumber && registrationData.phoneNumber.trim() !== '') {
    const phoneError = validatePhone(registrationData.phoneNumber);
    if (phoneError) {
      errors.phoneNumber = phoneError;
    }
  }
  
  return errors;
};

// Login form validation
export const validateLoginForm = (loginData) => {
  const errors = {};
  
  // Validate username
  const usernameError = validateRequired(loginData.username, 'Username');
  if (usernameError) {
    errors.username = usernameError;
  }
  
  // Validate password
  const passwordError = validateRequired(loginData.password, 'Password');
  if (passwordError) {
    errors.password = passwordError;
  }
  
  return errors;
};

// Profile form validation (for profile screen)
export const validateProfileEditForm = (profileData) => {
  const errors = {};
  
  // Validate email (required)
  const emailError = validateEmailField(profileData.email);
  if (emailError) {
    errors.email = emailError;
  }
  
  // Validate phone number (optional, but if provided must be valid)
  if (profileData.phoneNumber && profileData.phoneNumber.trim() !== '') {
    const phoneError = validatePhone(profileData.phoneNumber);
    if (phoneError) {
      errors.phoneNumber = phoneError;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Profile form validation (for complete profile with all fields)
export const validateProfileForm = (profileData) => {
  const errors = {};
  
  // Validate email using the new validateEmailField function
  const emailError = validateEmailField(profileData.email);
  if (emailError) {
    errors.email = emailError;
  }
  
  // Validate required fields
  const firstNameError = validateRequired(profileData.firstName, 'First name');
  if (firstNameError) {
    errors.firstName = firstNameError;
  }
  
  const lastNameError = validateRequired(profileData.lastName, 'Last name');
  if (lastNameError) {
    errors.lastName = lastNameError;
  }
  
  const phoneError = validatePhone(profileData.phoneNumber);
  if (phoneError) {
    errors.phoneNumber = phoneError;
  }
  
  const postalCodeError = validatePostalCode(profileData.postalCode);
  if (postalCodeError) {
    errors.postalCode = postalCodeError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Alert form validation
export const validateAlertForm = (alertData) => {
  const errors = {};
  
  // Validate required fields
  const titleError = validateRequired(alertData.title, 'Title');
  if (titleError) {
    errors.title = titleError;
  }
  
  const descriptionError = validateRequired(alertData.description, 'Description');
  if (descriptionError) {
    errors.description = descriptionError;
  }
  
  const locationError = validateRequired(alertData.location, 'Location');
  if (locationError) {
    errors.location = locationError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
