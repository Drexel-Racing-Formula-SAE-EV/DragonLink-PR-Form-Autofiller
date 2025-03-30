// Helper function to count occurrences of a substring in a string
function countSubstringOccurrences(str, subStr) {
  if (subStr.length === 0) return 0;
  var count = 0;
  var pos = 0;
  while ((pos = str.indexOf(subStr, pos)) !== -1) {
    count++;
    pos += subStr.length;
  }
  return count;
}

document.addEventListener('DOMContentLoaded', function () {
  // Load saved values, if any
  chrome.storage.sync.get(['userEmail', 'userPhone', 'userPosition'], function (data) {
    if (data.userEmail) document.getElementById('userEmail').value = data.userEmail;
    if (data.userPhone) document.getElementById('userPhone').value = data.userPhone;
    if (data.userPosition) document.getElementById('userPosition').value = data.userPosition;
  });

  // Save button stores the email and phone permanently
  document.getElementById('saveBtn').addEventListener('click', function () {
    var email = document.getElementById('userEmail').value;
    var phone = document.getElementById('userPhone').value;
    var position = document.getElementById('userPosition').value;
    chrome.storage.sync.set({ userEmail: email, userPhone: phone, userPosition: position }, function () {
      alert("Contact info saved!");
    });
  });

  /* newPRBtn has been removed, see popup.html
  document.getElementById('newPRBtn').addEventListener('click', function () {
    chrome.tabs.create({
      url: 'https://dragonlink.drexel.edu/finance/drexel-electric-racing/requests/purchase'
    });
  }); */

  // Go button sends a message to the active tab to start filling the form
  document.getElementById('fillBtn').addEventListener('click', function () {
    var excelPaste = document.getElementById('excelPaste').value;
    if (excelPaste.length == 0) {
      alert("The box above the \"Fill\" button is empty. Paste the required information from the PR Spreadsheet and try again.");
      return;
    }

    // Remove any trailing newline characters
    excelPaste = excelPaste.replace(/(\r\n|\n)+$/, '');

    var invalidNumCellAlertString;
    invalidNumCellAlertString = "This could be because you didn't copy from the \"Vendor\" column to the \"Link Gen\" column. ";
    invalidNumCellAlertString += "This could be because the Excel now has a different number of columns between these two. ";
    invalidNumCellAlertString += "This could be because a tab is in one of the cells (which you should remove). ";
    invalidNumCellAlertString += "Please review your input and try again.";

    excelPasteRowsByIndex = excelPaste.split("\n");
    var excelPasteRowsByIndexColumnByName = [];
    var invoiceAlert = false;
    for (var i = 0; i < excelPasteRowsByIndex.length; i++) {
      var currentRowColumnByIndex = excelPasteRowsByIndex[i].split("	");
      if (currentRowColumnByIndex.length != 12) {
        alert("Row " + (i + 1) + " (index " + i + ") of your paste seems to have " + currentRowColumnByIndex.length + " cells instead of the expected 12. " + invalidNumCellAlertString);
        return;
      }
      excelPasteRowsByIndexColumnByName[i] = new Map();
      excelPasteRowsByIndexColumnByName[i].set("Vendor", currentRowColumnByIndex[0]);
      excelPasteRowsByIndexColumnByName[i].set("Link", currentRowColumnByIndex[1]);
      excelPasteRowsByIndexColumnByName[i].set("Approver", currentRowColumnByIndex[2]);
      excelPasteRowsByIndexColumnByName[i].set("Subtotal", currentRowColumnByIndex[3]);
      excelPasteRowsByIndexColumnByName[i].set("Final Price", currentRowColumnByIndex[4]);
      excelPasteRowsByIndexColumnByName[i].set("DragonLink PR #", currentRowColumnByIndex[5]);
      excelPasteRowsByIndexColumnByName[i].set("Internal PR #", currentRowColumnByIndex[6]);
      excelPasteRowsByIndexColumnByName[i].set("Proof of Delivery", currentRowColumnByIndex[7]);
      excelPasteRowsByIndexColumnByName[i].set("Status", currentRowColumnByIndex[8]);
      excelPasteRowsByIndexColumnByName[i].set("Add'l Info", currentRowColumnByIndex[9]);
      excelPasteRowsByIndexColumnByName[i].set("f", currentRowColumnByIndex[10]);
      excelPasteRowsByIndexColumnByName[i].set("Link Gen", currentRowColumnByIndex[11]);
      if (!excelPasteRowsByIndexColumnByName[i].get("Link Gen")) {
        alert("Row " + (i + 1) + " (index " + i + ") of your paste has an empty cell in the \"Link Gen\" column. Generate it with the f column and try again.");
        return;
      }
      if (excelPasteRowsByIndexColumnByName[i].get("Link").toLowerCase().includes("invoice")) {
        invoiceAlert = true;
      }
      // Look for the text "QUANTITY:" followed by any whitespace and one or more digits
      var currentRowQuantity = parseInt(currentRowColumnByIndex[11].match(/QUANTITY:\s*(\d+)/i)[1], 10);
      excelPasteRowsByIndexColumnByName[i].set("Quantity", currentRowQuantity);
    }
    if (invoiceAlert) {
      alert("The \"Link\" column for at least one row mentioned an invoice. If needed, make sure to remember to attach an invoice at the bottom of the page.");
    }

    var vendor = excelPasteRowsByIndexColumnByName[0].get("Vendor");

    var numOfUniqueItems = 0;
    var numOfTotalItems = 0;
    for (var i = 0; i < excelPasteRowsByIndexColumnByName.length; i++) {
      numOfUniqueItems += 1;
      numOfTotalItems += excelPasteRowsByIndexColumnByName[i].get("Quantity");
    }
    var itemsCorrectPlurality = numOfTotalItems === 1 ? "item" : "items";
    var uniqueItemsCorrectPlurality = numOfUniqueItems === 1 ? "is" : "are";
    var description = numOfTotalItems + " total " + itemsCorrectPlurality + ", " + numOfUniqueItems + " of which " + uniqueItemsCorrectPlurality + " unique"

    var detailedDescription = ""
    for (var i = 0; i < excelPasteRowsByIndexColumnByName.length; i++) {
      detailedDescription += excelPasteRowsByIndexColumnByName[i].get("Link Gen");
      if (i !== excelPasteRowsByIndexColumnByName.length - 1) {
        detailedDescription += " | ";
      }
    }

    var date = new Date();
    date.setDate(date.getDate() + 7);
    var whenNeedItems = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    chrome.storage.sync.get(['userEmail', 'userPhone', 'userPosition'], function (data) {
      if (!data.userEmail || !data.userPhone || data.userPosition === "Select your position...") {
        alert("Information is missing. Please make sure your leadership position, phone number, and email are entered and you pressed the \"Save\" button.");
        return;
      }
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        // requiredUrl is from the 'matches' field in manifest.json
        // The extension will throw a 'Receiving end does not exist' error if the url doesn't match
        var requiredUrl = "https://dragonlink.drexel.edu/actionCenter/organization/drexel-electric-racing/Finance/CreatePurchaseRequest";
        if (activeTab.url !== requiredUrl) {
          alert("The current URL doesn't match \"" + requiredUrl + "\" EXACTLY. Change the URL so that it matches.");
          return
        }
        chrome.tabs.sendMessage(activeTab.id, {
          action: "fillForm",
          vendor: vendor,
          description: description,
          forFoodAndOrEvent : document.querySelector('input[name="foodEvent"]:checked').value,
          detailedDescription: detailedDescription,
          whenNeedItems : whenNeedItems
        });
      });
    });
  });
});
