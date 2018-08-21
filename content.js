main();

function main() {
  moveBefore(
    '.mr-state-widget',
    '.discussion-form-container, .disabled-comment'
  );
  moveBefore('.detail-page-description .description', '.issuable-discussion');
  moveBefore('.detail-page-description .edited-text', '.issuable-discussion');
  moveBefore('.emoji-list-container', '.issuable-discussion');
  moveBefore('.detail-page-header', '.merge-request-tabs-holder');

  function moveBefore(target, before) {
    const targetDom = document.querySelector(target);
    const toBeAfterDom = document.querySelector(before);

    if (targetDom && toBeAfterDom) {
      toBeAfterDom.parentNode.insertBefore(targetDom, toBeAfterDom);
    }
  }
}
