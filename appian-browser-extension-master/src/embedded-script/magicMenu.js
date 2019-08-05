import './MagicMenu.css';
import PopperJS from 'popper.js';
import React from './jsx-sans-react.js';

export default function initializeMagicMenu() {
  function receiveParentMessage(event) {
    const parsedInitializeMessage = /initialize-magic-menu(?:\?(.+))?/.exec(
      event.data
    );
    if (parsedInitializeMessage) {
      // Parent has sent initialization data
      const settingsString = parsedInitializeMessage[1];
      if (settingsString) {
        const settings = JSON.parse(settingsString);
        if (settings.v1) {
          createMagicMenu(settings.v1.suggestions);
        }
      }
    }
  }

  // Query the parent for any strings, if we get any, create the magic menu
  window.addEventListener('message', receiveParentMessage, true);
  window.parent.postMessage('request-magic-menu-initialize?v1', '*');

  function isMenuableControl(control) {
    const { classList } = control;
    return (
      classList &&
      (classList.contains('TextWidget---text') ||
        classList.contains('TextInput---text') ||
        classList.contains('ParagraphWidget---textarea'))
    );
  }

  function createMagicMenu(choices) {
    const magicMenuDropdown = createMagicMenuDropdown(choices);
    createMagicMenuButton(magicMenuDropdown);
  }

  function createMagicMenuButton(magicMenuDropdown) {
    const magicMenuDiv = (
      <div className="MagicMenu hidden">
        <div
          className="MagicMenuButton"
          onClick={onMenuButtonClick}
          title="Insert the current tab title, URL..."
        />
      </div>
    );

    const magicMenuButton = magicMenuDiv.querySelector('.MagicMenuButton');

    function onMenuButtonClick(event) {
      if (magicMenuDropdown.classList.contains('hidden')) {
        magicMenuButton.classList.add('active');
        magicMenuDropdown.classList.remove('hidden');
      } else {
        magicMenuButton.classList.remove('active');
        magicMenuDropdown.classList.add('hidden');
      }
    }

    magicMenuDiv.popper = new PopperJS(document.body, magicMenuDiv, {
      placement: 'bottom-end',
      modifiers: { offset: { offset: '0, -28px' }, flip: { enabled: false } }
    });

    document
      .getElementById('embedded-form')
      .addEventListener('focusin', onFocusIn, true);

    function onFocusIn(event) {
      if (event && isMenuableControl(event.target)) {
        magicMenuDiv.popper.reference.classList.remove(
          'MagicMenuHost',
          'MagicMenuSpecificHost'
        );
        magicMenuDiv.classList.remove('hidden');
        magicMenuButton.classList.remove('active');
        magicMenuDiv.popper.reference = event.target;
        magicMenuDiv.popper.reference.classList.add(
          'MagicMenuHost',
          'MagicMenuSpecificHost'
        );
        magicMenuDiv.popper.scheduleUpdate();
      } else {
        magicMenuDiv.popper.reference.classList.remove(
          'MagicMenuHost',
          'MagicMenuSpecificHost'
        );
        magicMenuDiv.classList.add('hidden');
      }
    }

    document.body.appendChild(magicMenuDiv);
  }

  function createMagicMenuDropdown(choices) {
    const magicMenuDropdown = (
      <div className="MagicMenuDropdown hidden">
        <div className="MagicMenuHeader">
          <span>Insert text</span>
          <span
            className="MagicMenuClose"
            onClick={onCloseClick}
            title="Close"
          />
        </div>
        <ul>
          {choices.map(choice => (
            <li onClick={onMenuItemClick} value={choice.value}>
              <div className="MagicMenuItemTitle">{choice.name}</div>
              <div className="MagicMenuItemValue">{choice.value}</div>
            </li>
          ))}
        </ul>
      </div>
    );

    function onCloseClick() {
      const target = magicMenuDropdown.popper.reference;
      target.focus();
    }

    function onMenuItemClick(event) {
      const target = magicMenuDropdown.popper.reference;
      target.value = (
        target.value +
        ' ' +
        event.target.getAttribute('value')
      ).trim();
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.focus();
    }

    magicMenuDropdown.popper = new PopperJS(document.body, magicMenuDropdown, {
      placement: 'bottom-start',
      modifiers: {
        matchTargetWidth: {
          enabled: true,
          fn: data => {
            data.styles.width = data.offsets.reference.width;
            return data;
          }
        },
        offset: { offset: '0, 0' },
        flip: { enabled: false }
      }
    });

    document
      .getElementById('embedded-form')
      .addEventListener('focusin', onFocusIn, true);

    function onFocusIn(event) {
      magicMenuDropdown.classList.add('hidden');
      if (event && isMenuableControl(event.target)) {
        magicMenuDropdown.popper.reference = event.target;
        magicMenuDropdown.popper.scheduleUpdate();
      }
    }

    document.body.appendChild(magicMenuDropdown);

    return magicMenuDropdown;
  }
}
