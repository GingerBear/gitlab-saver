initGitlabSaver();

function initGitlabSaver() {
  if (!isMergePage()) {
    return;
  }

  changeLayout();
  buildFileTree();

  function buildFileTree() {
    getChangeData().then(changes => {
      let delayTimer = null;
      const fileTree = parseTree(changes);
      const html = drawTree(fileTree);

      const treeDom = document.createElement('div');
      treeDom.setAttribute('class', 'diff-file-tree');
      treeDom.innerHTML = html;
      const toBeAfterDom = document.querySelector('.inline-update');
      if (toBeAfterDom) {
        toBeAfterDom.parentNode.insertBefore(treeDom, toBeAfterDom);
      }

      // attach click event to the tree
      treeDom.addEventListener('click', function(e) {
        if (!e.target.classList.contains('diff-file-name')) return;

        const fileName = e.target.dataset['fileName'];

        if (
          !document.querySelector('.diffs-tab').classList.contains('active')
        ) {
          document.querySelector('[data-action="diffs"]').dispatchEvent(
            new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            })
          );

          // keep pinging jump to file until it hit
          delayTimer = setInterval(() => {
            if (document.querySelector(`[data-title="${fileName}"]`)) {
              jumpToFile(fileName);
              clearInterval(delayTimer);
            }
          }, 300);
        } else {
          jumpToFile(fileName);
        }
      });
    });
  }

  function jumpToFile(filename) {
    const targetEl = document.querySelector(`[data-title="${filename}"]`);
    window.scrollTo(0, targetEl.closest('.file-holder').offsetTop - 140);
  }

  function changeLayout() {
    moveBefore(
      '.mr-state-widget',
      '.notes-form .timeline-entry-inner, .disabled-comment'
    );
    moveBefore('.detail-page-description .description', '.issuable-discussion');
    moveBefore('.detail-page-description .edited-text', '.issuable-discussion');
    moveBefore('.emoji-list-container', '.issuable-discussion');
    moveBefore('.detail-page-header', '.merge-request-tabs-holder');
  }

  function moveBefore(target, before) {
    const targetDom = document.querySelector(target);
    const toBeAfterDom = document.querySelector(before);

    if (targetDom && toBeAfterDom) {
      toBeAfterDom.parentNode.insertBefore(targetDom, toBeAfterDom);
    }
  }

  function isMergePage() {
    return !!document.querySelector('.merge-request-details');
  }

  function getChangeData() {
    return fetch(window.location.href.replace('/diffs', '') + '/diffs.json')
      .then(data => data.json())
      .then(json => {
        const newDom = document.createElement('div');
        newDom.innerHTML = json.html;
        const changesEl = newDom.querySelectorAll(
          '.diff-file-changes li:not(.hidden)'
        );

        const changes = [];
        changesEl.forEach(el => {
          changes.push({
            type: getChangeType(
              el.querySelector('.diff-file-changed-icon').classList
            ),
            file: el.querySelector('.diff-changed-file').getAttribute('title'),
            add: parseInt(
              el.querySelector('.diff-changed-stats .cgreen').textContent
            ),
            remove: parseInt(
              el.querySelector('.diff-changed-stats .cred').textContent
            )
          });
        });

        return changes;
      });
  }

  function getChangeType(classList) {
    if (classList.contains('cgreen')) {
      return 'create';
    } else if (classList.contains('cred')) {
      return 'remove';
    } else {
      return 'modify';
    }
  }

  function parseInt(numStr) {
    return +numStr.replace('-', '').replace('+', '');
  }

  function parseTree(changes) {
    const fileTree = {};

    changes.forEach(change => {
      const filename = change.file;
      const pathes = filename.split('/');
      let curr = fileTree;

      pathes.forEach((path, i) => {
        if (curr[path]) {
          curr = curr[path];
        } else {
          let temp =
            i === pathes.length - 1
              ? Object.assign({ isFile: true, shortFileName: path }, change)
              : {};
          curr[path] = temp;
          curr = temp;
        }
      });
    });

    return fileTree;
  }

  function drawTree(fileTree) {
    return Object.keys(fileTree)
      .map(k => {
        if (fileTree[k].isFile === true) {
          return `<div class="file">
            <div 
              class="diff-file-name change-type-${fileTree[k].type}"
              data-file-name="${fileTree[k].file}"
            >${fileTree[k].shortFileName}</div>
        </div>`;
        } else {
          return `
        <div class="folder">
            <div class="folder-name">${k}</div>
            ${drawTree(fileTree[k])}
        </div>`;
        }
      })
      .join('');
  }
}
