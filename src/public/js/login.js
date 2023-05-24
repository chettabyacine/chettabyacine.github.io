$(document).ready(function () {

  $('#login-form').on('submit', function (e) {
    e.preventDefault();

    console.log('Form submitted:', $(this).serialize());
    postRequerstLogIn();

  });


  function postRequerstLogIn() {
    // ottieni l'email e la password inserite dall'utente
    const email = $('#email').val();
    const password = $('#password').val();

    // invia la richiesta AJAX
    $.ajax({
      url: '/authenticate',
      method: 'POST',
      data: {
        email: email,
        password: password,
      },
      dataType: 'json',
      success: function (response) {
        if (response.status === 'success') {
          console.log('User logged in successfully.');
          window.location.href = response.redirectUrl;
        } else {
          console.error(response.message);
          alert(response.message);
          window.location.href = response.redirectUrl;
        }
      },
      error: function (xhr, status, error) {
        console.error('An error occurred while logging in.');
        console.error('Status:', status);
        console.error('Error:', error);
      },
    });
  }
});          