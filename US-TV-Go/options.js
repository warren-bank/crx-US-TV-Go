// Saves options to chrome.storage
function save_options() {
  // checkbox element(s)
  var open_in_webcast_reloaded = document.getElementById('open_in_webcast_reloaded').checked;
  chrome.storage.sync.set({
    "open_in_webcast_reloaded": open_in_webcast_reloaded
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    // Clear status message after a brief period of time
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores state using the preferences stored in chrome.storage.
function restore_options() {
  // checkbox element(s)
  chrome.storage.sync.get(['open_in_webcast_reloaded'], function(items) {
    for (var key in items){
      document.getElementById(key).checked = items[key];
    }
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
