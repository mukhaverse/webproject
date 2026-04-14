document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  const faqQuestion = document.getElementById('faqQuestion');
  const faqAnswer = document.getElementById('faqAnswer');
  const faqCard = document.getElementById('faqCard');

  const faqItems = [
    {
      question: 'What services does Medixa provide?',
      answer:
        'Medixa provides a medication management platform that helps users understand medication interactions, organize schedules, and make safer daily medication decisions.'
    },
    {
      question: 'How to use Medixa?',
      answer:
        'You use Medixa by entering your medication information, reviewing the generated guidance, and following the organized schedule and interaction alerts shown on the platform.'
    },
    {
      question: 'How can I contact Medixa?',
      answer:
        'You can contact Medixa through the contact form on the website or by sending an email to medixainquiry@gmail.com.'
    },
    {
      question: 'How long does it take to receive a response?',
      answer:
        'Most responses are sent within one to two business days, depending on the number of inquiries and the nature of the request.'
    },
    {
      question: 'Is my information secure?',
      answer:
        'Medixa is designed to handle user information responsibly and aims to protect submitted data through secure practices and careful data handling.'
    }
  ];

  let faqIndex = 0;

  const fields = {
    firstName: {
      element: document.getElementById('firstName'),
      validate: (value) => /^[A-Za-zÀ-ÿ\u0600-\u06FF\s'-]{2,30}$/.test(value.trim()),
      message: 'Enter a valid first name using 2 to 30 letters.'
    },
    lastName: {
      element: document.getElementById('lastName'),
      validate: (value) => /^[A-Za-zÀ-ÿ\u0600-\u06FF\s'-]{2,30}$/.test(value.trim()),
      message: 'Enter a valid last name using 2 to 30 letters.'
    },
    phoneNumber: {
      element: document.getElementById('phoneNumber'),
      validate: (value) => /^\+?[0-9]{8,15}$/.test(value.trim()),
      message: 'Enter a valid phone number with 8 to 15 digits.'
    },
    email: {
      element: document.getElementById('email'),
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) && value.length <= 100,
      message: 'Enter a valid email address.'
    },
    language: {
      element: document.getElementById('language'),
      validate: (value) => ['English', 'Arabic', 'French'].includes(value),
      message: 'Select a language.'
    },
    gender: {
      element: document.getElementById('gender'),
      validate: (value) => ['Female', 'Male'].includes(value),
      message: 'Select a gender.'
    },
    contactDate: {
      element: document.getElementById('contactDate'),
      validate: (value) => value.trim() !== '',
      message: 'Select a date.'
    },
    message: {
      element: document.getElementById('message'),
      validate: (value) => value.trim().length >= 10 && value.trim().length <= 500,
      message: 'Message must be between 10 and 500 characters.'
    }
  };

  function setFieldError(input, message) {
    input.classList.add('input-error');
    const errorBox = input.parentElement.querySelector('.error-message');
    if (errorBox) errorBox.textContent = message;
  }

  function clearFieldError(input) {
    input.classList.remove('input-error');
    const errorBox = input.parentElement.querySelector('.error-message');
    if (errorBox) errorBox.textContent = '';
  }

  function validateField(fieldConfig) {
    const input = fieldConfig.element;
    const value = input.value;
    const isValid = fieldConfig.validate(value);

    if (!isValid) {
      setFieldError(input, fieldConfig.message);
      return false;
    }

    clearFieldError(input);
    return true;
  }

  Object.values(fields).forEach((field) => {
    field.element.addEventListener('input', () => validateField(field));
    field.element.addEventListener('change', () => validateField(field));
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let isFormValid = true;

    Object.values(fields).forEach((field) => {
      const valid = validateField(field);
      if (!valid) isFormValid = false;
    });

    if (!isFormValid) {
      formStatus.textContent = 'Please correct the highlighted fields before submitting.';
      return;
    }

    formStatus.textContent = 'Your message is ready to be sent.';
    contactForm.reset();

    Object.values(fields).forEach((field) => clearFieldError(field.element));
  });

  function rotateFaqCard() {
    faqCard.classList.remove('fade-in');
    faqCard.classList.add('fade-out');

    setTimeout(() => {
      faqIndex = (faqIndex + 1) % faqItems.length;
      faqQuestion.textContent = faqItems[faqIndex].question;
      faqAnswer.textContent = faqItems[faqIndex].answer;

      faqCard.classList.remove('fade-out');
      faqCard.classList.add('fade-in');
    }, 550);
  }

  setInterval(rotateFaqCard, 5000);
});