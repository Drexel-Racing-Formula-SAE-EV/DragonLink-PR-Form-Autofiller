chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "fillForm") {

    // Retrieve saved email and phone from storage
    chrome.storage.sync.get(['userEmail', 'userPhone', 'userPosition'], function (data) {

      // Get all input, textarea, and select elements
      var fields = document.querySelectorAll("input, textarea, select");
      fields.forEach(function (field) {
        // Skip fields that are disabled or read-only
        if (field.disabled || field.readOnly) return;
        // var name = (field.name || "").toLowerCase();

        // For email fields, use the saved email; for phone-related fields, use the saved phone.
        if (field.id === "Subject") {  // Subject
          field.value = "Order for " + message.vendor;
        } else if (field.id === "Description") {  // Description
          field.value = message.description;
        } else if (field.id === "CategoryId") {  // Categories
          if (message.forFoodAndOrEvent === "No") {
            field.value = "8748";  // Undergrad/Joint Organizations: Standard Operation
          }
        } else if (field.id === "27555615" && data.userPosition === "President") {  // Trained Organization Officer Position (President)
          field.checked = true;
        } else if (field.id === "41176830" && data.userPosition === "Vice-President") {  // Trained Organization Officer Position (Vice-President)
          field.checked = true;
        } else if (field.id === "27555617" && data.userPosition === "Treasurer") {  // Trained Organization Officer Position (Treasurer)
          field.checked = true;
        } else if (field.id === "answerTextBox-27561239-free") {  // Your Contact Number
          field.value = data.userPhone;
        } else if (field.id === "answerTextBox-10041364-free") {  // Your Email Address
          field.value = data.userEmail;
        } else if (field.id === "dropDown-6049668") {  // Is this purchase request associated with an event or meeting (including General Body Meeting) your organization is hosting?
          if (message.forFoodAndOrEvent === "No") {
            field.value = "29607738";  // NA
          }
        } else if (field.id === "answerTextBox-29608463-free") {  // Name of event as it is listed on DragonLink (NA if purchase request is not related to an event)
          if (message.forFoodAndOrEvent === "No") {
            field.value = "NA";
          }
        } else if (field.id === "answerTextBox-43057273-free") {  // Event Date (NA if purchase not related to an event):
          if (message.forFoodAndOrEvent === "No") {
            field.value = "NA";
          }
        } else if (field.id === "dropDown-5355960") {  // What type of Purchase Request is this? Reminder: each purchase requires an individual Purchase Request.
          if (message.forFoodAndOrEvent === "No") {
            if (message.vendor === "Amazon") {
              field.value = "41176832"  // Amazon Order (Student Life/DUCOM Student Affairs will make the purchase on your behalf)
            } else {
              field.value = "27555576"  // Online and phone orders other than Amazon  (Student Life/DUCOM Student Affairs will make the purchase on your behalf)
            }
          }
        } else if (field.id === "answerTextBox-30752375-free") {  // Food Orders: Please list the following: (NA if not requesting a food order)
          if (message.forFoodAndOrEvent === "No") {
            field.value = "NA";
          }
        } else if (field.id === "answerTextBox-29608759-free") {  // Credit Card Check Out: Name of person picking up the credit card, please only include the name of one person. (NA if not requesting a credit card)
          field.value = "NA";
        } else if (field.id === "answerTextBox-29608758-free") {  // Credit Card Check Out: Date credit card is requested (NA if not requesting a credit card)
          field.value = "NA";
        } else if (field.id === "answerTextBox-34620188-free") {  // Credit Card Check Out: Email address of person checking out the credit card (NA if not requesting a credit card)
          field.value = "NA";
        } else if (field.id === "answerTextBox-37266756-free") {  // Mileage Reimbursement: Specify the per mile rate of reimbursement (NA if not requesting a mileage reimbursement)
          field.value = "NA";
        } else if (field.id === "dropDown-9113354") {  // Reimbursement: Name of Student Life staff member who authorized the reimbursement.
          field.value = "37266732";  // NA
        } else if (field.id === "answerTextBox-29608733-free") {  // Reimbursement: Name of person being reimbursed (NA if not requesting a reimbursement)
          field.value = "NA";
        } else if (field.id === "answerTextBox-42073206-free") {  // Reimbursement: Address for the check to be sent (NA if not requesting a reimbursement)
          field.value = "NA";
        } else if (field.id === "answerTextBox-28041855-free") {  // Reimbursement: Drexel ID # (NA if not requesting a reimbursement)
          field.value = "NA";
        } else if (field.id === "answerTextBox-37320053-free") {  // Reimbursement: Email address of person being reimbursed (NA if not requesting reimbursement)
          field.value = "NA";
        } else if (field.id === "answerTextBox-35358658-free") {  // Fund Transfer: Organization/Department name and account number (i.e., 17xxxx-4xxx)(NA if not requesting a fund transfer)
          field.value = "NA";
        } else if (field.id === "answerTextBox-10041372-free") {  // Please list a detailed description of the purchase request. Include as much detail as possible including but not limited to ...
          field.value = message.detailedDescription;
        } else if (field.id === "answerTextBox-10041373-free") {  // When do you need these items? (This date should be at least five business days after the date of your purchase request submission plus shipping time)
          field.value = message.whenNeedItems;
        }
      });
    });
  }
});
