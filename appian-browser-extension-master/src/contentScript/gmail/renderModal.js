/*global chrome*/
import React from '../../embedded-script/jsx-sans-react';

const styles = {
  appianIframe: 'appian-iframe',
  appianObjectElement: 'appian-object-element',
  appianModalControl: 'appian-modal-control',
  appianVisited: 'appianVisited'
};

function hasAncestorWithClass(element, className) {
  while (element) {
    if (element.classList && element.classList.contains(className)) {
      return true;
    }
    element = element.parentNode;
  }
  return false;
}

function isElementEditable(element) {
  return hasAncestorWithClass(element, 'editable');
}

const latestModals = [];

function createAppianModal(
  linkElement,
  siteUrlWithBaseFolder,
  tagName,
  attributes
) {
  const iconElement = (
    <img
      src={chrome.runtime.getURL('icon16.png')}
      class="link-icon"
      alt=""
      title="Open in current window"
    />
  );
  linkElement.appendChild(iconElement);
  linkElement.addEventListener('click', function(event) {
    event.preventDefault();
    showModal(linkElement.href);
  });

  // If this link already has a modal, don't re-create it
  if (latestModals.some(modal => modal.href === linkElement.href)) {
    return;
  }

  // If there are no other existing links on the page, remove previously created modals
  if (document.querySelectorAll(`a[${styles.appianVisited}]`).length === 0) {
    latestModals.forEach(modal => {
      document.body.removeChild(modal.modalElement);
    });

    // Clear the array
    latestModals.length = 0;
  }

  const modalElement = (
    <div className="appian-modal" onClick={closeModal}>
      <span className={styles.appianModalControl} onClick={closeModal}>
        ×
      </span>
      <a
        href={linkElement.href}
        className={styles.appianModalControl}
        target="_blank"
        rel="noopener noreferrer"
      >
        open in new window
      </a>
      <iframe
        className={styles.appianIframe}
        onload={setupIFrame}
        title="Appian Embedded"
      />
    </div>
  );

  function setupIFrame(e) {
    const iframeElement = e.target;
    const iframeDocument = iframeElement.contentWindow.document;
    iframeDocument.body.style.margin = '0';

    const embeddedBootstrapElement = (
      <script
        src={`${siteUrlWithBaseFolder}/tempo/ui/sail-client/embeddedBootstrap.nocache.js`}
        id="appianEmbedded"
        data-startzindex={100000}
        mode="outlook"
      />
    );
    iframeDocument.body.appendChild(embeddedBootstrapElement);

    iframeElement.contentWindow.onclick = function(event) {
      if (event.target === iframeDocument.body) {
        closeModal();
      }
    };

    const appianObjectElement = iframeDocument.createElement(tagName);
    Object.entries(attributes).forEach(function(attribute) {
      appianObjectElement.setAttribute(attribute[0], attribute[1]);
    });
    iframeDocument.body.appendChild(appianObjectElement);

    iframeDocument.onkeydown = keyHandler;

    appianObjectElement.addEventListener('submit', closeModal, false);
    appianObjectElement.classList.add(styles.appianObjectElement);
  }

  function keyHandler(event) {
    event = event || window.event;
    if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
      closeModal();
    }
  }

  function showModal(href) {
    const latestModal = latestModals.find(modal => href === modal.href);
    if (!latestModal) {
      return;
    }
    const modalElement = latestModal.modalElement;
    if (!modalElement) {
      return;
    }

    modalElement.style.display = 'block';
    const iframeElement = modalElement.querySelector(`.${styles.appianIframe}`);
    const appianObjectElement = iframeElement.contentWindow.document.querySelector(
      `.${styles.appianObjectElement}`
    );
    const contentHeight = appianObjectElement.getBoundingClientRect().height;
    if (contentHeight) {
      iframeElement.style.height = `${contentHeight + 60}px`;
    }
  }

  function closeModal() {
    if (modalElement && modalElement.style) {
      modalElement.style.display = 'none';
    }
  }

  // Add the modal to the DOM
  document.body.appendChild(modalElement);
  latestModals.push({
    href: linkElement.href,
    modalElement
  });
}

export function renderAppianObject(
  { linkElement, tagName, attributes },
  siteUrlWithBaseFolder
) {
  // Do not annotate links in editor mode
  if (isElementEditable(linkElement)) {
    linkElement.removeAttribute(styles.appianVisited);
    return;
  }

  // If the link has already been annotated, or it's in our modal, ignore.
  if (
    linkElement.hasAttribute(styles.appianVisited) ||
    linkElement.classList.contains(styles.appianModalControl)
  ) {
    return;
  }

  createAppianModal(linkElement, siteUrlWithBaseFolder, tagName, attributes);
  linkElement.setAttribute(styles.appianVisited, '');
}
