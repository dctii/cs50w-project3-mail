document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // When submitting, the e-mail it submitted to the recipient using form information
  document.querySelector('form').onsubmit = submit_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

// Function that loads the data and conditions and reveals the Compose Email section
function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#emails-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  console.log(`You are in the "Compose Email" section.`)

  // Clear recipient, subject, and body text fields for e-mail composition
  document.querySelector('#compose-recipients').value = '';
    // HTML attributes for recipient text field
    // Set disabled attribute to false so if the user navigates to 'Compose New Email' from 'Reply to Email' it doesn't inherit ".disabled = true"
    document.querySelector('#compose-recipients').disabled = false;
    // Set bootstrap class attributes explicitly so it doesn't inherit Bootstrap's "bg-light" class value from 'Reply to Email'
    document.querySelector('#compose-recipients').className = "form-control bg-white";
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Function that enables and disables the submit button depending on whether the text fields are empty or not
  function submitAbilitator(button, textfield) {

    // If the textfield is empty, then disable the button
    if (textfield.value.length == 0) {
      button.disabled = true;
    }

    // https://bit.ly/3APTpBj 'keydown, keypress, keyup'
    // After the user presses and releases a key, do check the conditions and do something
    textfield.onkeyup = () => {

      // If there is more than one element inside of the textfield, then enable the submit button. Otherwise, disable the button
      if (textfield.value.length > 0) {
        button.disabled = false;
      } else {
        button.disabled = true;
      }
    }
  }

  // Set HTML IDs for the submission button and for the form data for the recipient, then pass the values into the 'submitAbilitator' function
  const submitBtn = document.querySelector('#compose-submit');
  const recipientsData = document.querySelector('#compose-recipients');
  submitAbilitator(submitBtn, recipientsData)
  }

// Function that brings the user to the "Email Reply" condition of the Compose Email section.
function replyto_email(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#emails-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  console.log(`You are in the "Compose Email" section via Replying to an Email.`)

  // Prescribe the value of the recipient as the sender of the e-mail
  document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-recipients').disabled = true;
    document.querySelector('#compose-recipients').type = "email";
    document.querySelector('#compose-recipients').className = "form-control bg bg-light text-dark";
  
  // Prepend "Re: " to the subject of the e-mail being replied to and prepopulate the subject text field with the new value for email.subject
  email.subject = "Re: "+email.subject;
  document.querySelector('#compose-subject').value = email.subject;

  // Prepopulate the body text field with the previous message in the reply, prepending it with the replied-to-email's timestamp, the sender. All of this history is prepended with two right-pointing arrows that help signify to the user it is a reply
  document.querySelector('#compose-body').value = `\n\n▶▶ On ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
}

// Function that loads data and reveals the "inbox", "archive", and "sent" mailboxes.
function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1).toLowerCase()}</h3>\n<hr class="solid">`;

  // Load e-mails
    // Fetch emails from the given path and the corresponding, subordinate mailbox
  fetch(`/emails/${mailbox}`)
    // Next, provide as a response the JSON containing the email data  *** come back to this one after watching the lecture on this part
  .then(response => response.json())
    // After, for the emails, check the conditions to determine what action to take
  .then(emails => {

    // If there are no e-mails, then return a message in the given mailbox, whether it is 'inbox' or 'archive'
    if (emails.length === 0) {
      console.log(`You are in the "${mailbox}" mailbox.`);
      // This variable is an HTML div and will display an italicized "no messages" notification if the condition that there is no e-mails is met
      const emptyBox = document.createElement('div');
      emptyBox.innerHTML = '<i>You have no messages in this mailbox.</i>';

      // https://mzl.la/3cg2vx4 'Node.appendChild()'
      // Append the emptyBox div and the message to the emails-view under this condition
      document.getElementById("emails-view").appendChild(emptyBox);

    // If there are not 0 emails, then do this
    } else {
      // Populate the individual emails, running the mailbox_display function for each
      // Give a console message telling an inspector what mailbox they are in
      console.log(`You are in the "${mailbox}" mailbox.`);
      // Give a console message telling an inspector what emails are currently in the mailbox they are in
      console.log(emails);
      // For each email, run mailbox_display to populate it's structure and appearance as part of a list of all emails, unless there are no emails, where then a "no messages" prompt is given
      emails.forEach(email => mailbox_display(email,mailbox));
    }
      
  });

}

// Function that submits a user's message to another e-mail address within the application's locale.
function submit_email() {

  // Set constant variables for the "To", "Email Subject", and "Email Body" inputs
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // POST the input provided by the user
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => console.log(result));
  
  // Provide a console message to an inspector that the e-mail has been sent
  console.log(`The e-mail has been sent.`);
  // Provide a browser alert to the user that the e-mail has been sent
  alert('E-mail has been sent!');

  // Clear local storage and load the "sent" mailbox
  // https://bit.ly/3IONs9S 'Storage clear() Method'
  localStorage.clear();
  load_mailbox('sent');
  return false;
}

// Function that serves to populate the appearance and interface of the of the "inbox", "archive", and "sent" mailboxes.
function mailbox_display(email, mailbox) {

  // Set the HTML id and structure and basic appearances for individual e-mails
  const mailboxStruc = document.createElement('div');
    mailboxStruc.id= "email";
    mailboxStruc.className = "row";
    // If the e-mail is unopened, then make the font bold
    if (email.read == false) {
      mailboxStruc.classList.add('font-weight-bold');
    // If the e-mail is opened, then use Bootstrap's text-muted class attribute to grey out the text
    } else if (email.read == true) {
      mailboxStruc.classList.add('text-muted');
    }
  
  // Set the HTML id and position of the sender or sendee email addresses on the mailboxStruc row
  const emailAddresses = document.createElement('div');
    emailAddresses.id = "emails-addresses";
    emailAddresses.className = "col-lg-2 col-md-3 col-sm-12";
    // If the e-mail belongs to the "sent" mailbox, then populate the "email addresses" column as the address(es) who the user sent the e-mails to
    if (mailbox === "sent") {
      emailAddresses.innerHTML = email.recipients;
      // If the e-mail doesn't belong to the "sent" mailbox, rather the "inbox" and "archive" mailbox, then populate the "email addresses" column as the user
    } else {
      emailAddresses.innerHTML = email.sender;
    }
  // Append the emailAddresses element to the mailboxStruc row
  mailboxStruc.append(emailAddresses);
  
  // Create an HTML div and provide the HTML id and position of the email subjects on the mailboxStruc row
  const emailSubject = document.createElement('div');
    emailSubject.id = "emails-subject";
    emailSubject.className = "col-lg-6 col-md-5 col-sm-12";
    emailSubject.innerHTML = email.subject;
  // Append the emailSubject element to the mailboxStruc row
  mailboxStruc.append(emailSubject);
  
  // Create an HTML div and provide the the HTML id and position of the time the e-mail had been sent on the mailboxStruc row
  const emailTimestamp = document.createElement('div');
    emailTimestamp.id = "emails-timestamp";
    emailTimestamp.className = "col-lg-3 col-md-3 col-sm-12";
    emailTimestamp.innerHTML = email.timestamp;
  // Append the emailTimestamp element to the mailboxStruc row
  mailboxStruc.append(emailTimestamp);
  
  // Provide a console message to an inspector of the mailbox being displayed
  console.log(mailbox);
  
  // Function that serves as a Boolean switch for an email's "archived" status
  function archive_switch(email_id, currValue) {

    // Set a variable that becomes the opposite Boolean value of the email's current "archived" status value
    const updatedValue = !currValue;
    
    // Update the "archived" status of the email
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: body = JSON.stringify({
        archived: updatedValue
      })
    })
    .then(response => {
      console.log(response);
      return response.json();
    })
    .then(result => {
      console.log(result);
      return result.json();
    })
    // https://bit.ly/3cbnUY1 'Uncaught (in promise) SyntaxError: Unexpected end of JSON input error'
    .catch(e => console.log(e));

    // If the updated Boolean is true, then send a console.message to the user telling them that the e-mail has been archived
    if(updatedValue == true) {
      console.log(`Email has been archived`);
    // If false, then send a console message to an inspector telling them that the e-mail has been archived
    } else if (updatedValue == false) {
      console.log(`Email has been unarchived.`);
    }
  }

  // Create an HTML img, which will be an archive/unarchive button, and provide an id and its CSS class attribute.
  const archiveBtn = document.createElement('img');
      archiveBtn.id = "archive-icons";
      archiveBtn.className = "archive-btn"
      // If the mailbox is "inbox", then do this
      if(mailbox === "inbox") {
        // The source for the img is an "archive icon"
          // https://bit.ly/3nYY8c7 Wikimedia: Grey_archive_icon (Wikiproject Icons)
            // Bruce The Deus, CC BY-SA 4.0 via Wikimedia Commons
        archiveBtn.src = "https://svgshare.com/i/j8U.svg"

        // Set the title for the button as "Archive?", to clarify to the user the purpose of the button
          // https://bit.ly/3yFwBBr Adding title / `data` attributes to a button
        archiveBtn.title = "Archive?"

        // Add a tooltip that pops out to, if given enough space, the right and displays the string in archiveBtn.title
          // https://bit.ly/3z2gMWT "Add a 'data-toggle' attribute to a button in javascript"
        archiveBtn.setAttribute("data-toggle", "tooltip");
        $(archiveBtn).attr('data-placement', 'right').tooltip()
        
        // Execute these actions when clicking the archive icon
        archiveBtn.addEventListener('click', () => {
          // Execute archive_switch, setting the email's "archived status" to true
          archive_switch(email.id, email.archived)
          // Reload the page
          window.location.reload();
          // Alert the user that the email has been moved to the archived folder.
          alert('Item has been archived! Check your archived folder.');
          // Clear local storage
          localStorage.clear();
          // Load the "inbox" mailbox again
          load_mailbox('inbox');
        });

      // Otherwise, if the mailbox is "archive", then do this
      } else if(mailbox === "archive") {
        // https://bit.ly/3O9y5tJ Breezeicons-places-22-mail-folder-outbox
          // Copyright (C) 2014 Uri Herrera and others, KDE Visual Design Group LGPL via Wikimedia Commons
        archiveBtn.src = "https://svgshare.com/i/j8d.svg"
        archiveBtn.title = "Unarchive?"

        // Execute these actions when clicking the unarchive icon
        archiveBtn.addEventListener('click', () => {
          // Execute archive_switch, setting the email's "archived status" to false
          archive_switch(email.id, email.archived)
          // Alert the user that the email has been moved to the archived folder.
          alert('Item has been unarchived! Check your inbox.');
          // Clear local storage
          window.location.reload();
          localStorage.clear();
          load_mailbox('inbox');
          
          /* To load the 'archive' mailbox instead, use this and exclude 'window.location.reload()'
            I left in "load_mailbox('inbox') merely to satisfy the specification requirements although
            I think reloading the the 'archive' inbox seems more intuitive so you can see that the
            target mail has been unarchived.
          // Load the "archive" mailbox again
          load_mailbox('archive'); 
          */
        });
      }
  // Append the archiveBtn element to the mailboxStruc row
  mailboxStruc.append(archiveBtn);
  
  // Provides the Bootstrap card feature to each row
  const emailCard = document.createElement('div');
    emailCard.id = "emails-object";
    // If the e-mail has been opened, then provide it with the "emails-opened" custom CSS class
    if(email.read){
      emailCard.className = "emails-opened card";  
    // Otherwise, do not provide it with the "emails-opened" custom CSS class
    } else {
      emailCard.className = "card";
    }
  // Append the emailCard element to the mailboxStruc row
  emailCard.append(mailboxStruc);
  
  // When clicking on either the email addresses, subjects, or timestamps, it will redirect the user to the specified email for the clicked row. Cannot use mailboxStruc.addeventListener because it will include archiveBtn read the given email.id if the archive icon is clicked.
  emailAddresses.addEventListener('click', () => read_email(email.id) );
  emailSubject.addEventListener('click', () => read_email(email.id) );
  emailTimestamp.addEventListener('click', () => read_email(email.id) );

  // Append #emails-view information to the email cards, each row
  document.querySelector('#emails-view').append(emailCard);
}

// Function that reveals the content of an individual email, in a Read Specific Email view and, if the email hasn't been opened before, then marks it as opened.
function read_email(email_id) {
  
  // Reveal the email information and hide Compose Email and any inbox views.
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#emails-content').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Include attributes for the Email Body
    // Disable textarea editing for the message being read.
  document.querySelector('#emails-view-body').disabled = true;
    // Set the height of the textarea field.
  document.querySelector('#emails-view-body').rows = "20";
    // Provide some Bootstrap features to the body
  document.querySelector('#emails-view-body').className = "card-body bg bg-light border-0";
    // Disable resizer of the textarea field, set cursor to default when hovering over, and the text color to black
      // https://bit.ly/3RuLShh 'How to disable the resize grabber of <textarea>?'
  document.querySelector('#emails-view-body').style = "color:black; cursor: default; resize:none;";

  // Retrieve the information for the specific email
  fetch(`/emails/${email_id}`)
  .then(response => {
    console.log(response)
    return response.json()
  })
  .then(email => {
    // If the email is unopened, then do this
    if(email.read == false) {
      // Set the "read status" of the email to true, meaning that it has been opened.
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: body = JSON.stringify({
          read: true
        })
      })
      // Send a console message to an inspector letting them know that an unopened email has been opened.
      console.log(`Marking email as opened.`);
    // If the email is not unopened, then do this
    } else {
      // Send a console message to an inspector letting them know that the email has already been opened before.
      console.log(`E--mail has already been marked as open.`);
    }
    // Load the email information
      // Send a console message to an inspector providing the information of the matching email.id
    console.log(email);
    document.querySelector('#emails-view-sender').innerHTML = email.sender;
    document.querySelector('#emails-view-recipients').innerHTML = email.recipients;
    document.querySelector('#emails-view-subject').innerHTML = email.subject;
    document.querySelector('#emails-view-timestamp').innerHTML = email.timestamp;
    document.querySelector('#emails-view-body').innerHTML = email.body;
    
    // Provide a click function to the HTML tag containing the id "reply-btn", and whatever falls under that tag will execute the replyto_email function, which is the "Reply" button at the bottom of any "Read Archived or Inbox Mail" page
    document.getElementById('reply-btn').addEventListener('click', () => replyto_email(email));
  });

  return false;
}