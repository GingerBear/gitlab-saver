main();

function main() {
  const toggleChangeLayout = document.querySelector('#change-layout');
  const toggleFileTree = document.querySelector('#show-file-tree');

  chrome.storage.sync.get(['changeLayout', 'showFileTree'], function(result) {
    toggleChangeLayout.checked = !!result.changeLayout;
    toggleFileTree.checked = !!result.showFileTree;
  });

  toggleChangeLayout.addEventListener('change', function() {
    chrome.storage.sync.set({
      changeLayout: toggleChangeLayout.checked ? '1' : ''
    });
  });

  toggleFileTree.addEventListener('change', function() {
    chrome.storage.sync.set({
      showFileTree: toggleFileTree.checked ? '1' : ''
    });
  });
}
