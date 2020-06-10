// Waits for initial HTML to loaded and then fires content
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrar');
  const input = form.querySelector('input');

  const mainDiv = document.querySelector('.main');
  const ul = document.getElementById('invitedList');

  const div = document.createElement('div');
  const filterLabel = document.createElement('label');
  const filterCheckbox = document.createElement('input');
  const selectOptions = ['No response', 'Confirmed', 'Declined'];


  filterLabel.textContent = "Hide those who havent responded";
  filterCheckbox.type = 'checkbox';
  div.appendChild(filterLabel);
  div.appendChild(filterCheckbox);
  mainDiv.insertBefore(div, ul);

  /** 
   * When the checkbox gets ticked, it hides every list element that
   * hasn't had a response chosen in the select box. It checks that 
   * class of each list item to know this, the class is changed to 'responded' 
   * when an option is chosen in the select box (this is dealt with by
   * another event listener).
   */
  filterCheckbox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const lis = ul.children;
    if (isChecked) {
      for (let i = 0; i < lis.length; i++) {
        let li = lis[i];
        if (li.className === 'responded') {
          li.style.display = '';
        } else {
          li.style.display = 'none';
        }
      }
    } else {
      for (let i = 0; i < lis.length; i++) {
        let li = lis[i];
        li.style.display = '';
      }
    }
  });

  function createLI(text, response) {
    /**
     * Creates a new element and a chosen property value 
     * to that element. Returns element.
     */
    function createElement(elementName, property, value) {
      const element = document.createElement(elementName);
      element[property] = value;
      return element;
    }
    /**
     * Calls the createElement function and assigns to a variable,
     * then appends as a child to the the li variable. Returns element.
     */
    function appendToLi(elementName, property, value) {
      const element = createElement(elementName, property, value);
      li.appendChild(element);
      return element;
    }
    /**
     * Creates a new option for the selectBox, assigns each option value 
     * and textContent with the choices in the selectOptions array. Then 
     * assigns each option to the select element. Sets default selectBox.value 
     * to the second parameter input to createLI, selectBox.value then changes
     * each time a different option is chosen.
     */
    function appendOptions(selectBox) {
      for (let i = 0; i < selectOptions.length; i++) {
        let option = document.createElement('option');
        option.value = selectOptions[i];
        option.textContent = selectOptions[i];
        selectBox.appendChild(option);
      }
      selectBox.value = response;
    }

    /**
     * Adds a new line.
     */
    function newLine() {
      return document.createElement('br');
    }

    /**
     * Creates list element and appends chosen elements to it.
     * Returns the created list element.
     */
    const li = document.createElement('li');
    appendToLi('span', 'textContent', text);
    // Appends a select element to li and stores it in variable so options can be append to that below.
    const selectBox = appendToLi('select', 'id', 'select');
    // Appends chose option to selectBox.
    appendOptions(selectBox);
    li.appendChild(newLine());
    appendToLi('textarea', 'placeholder', 'Enter your notes here');
    li.appendChild(newLine());
    appendToLi('button', 'textContent', 'Edit');
    appendToLi('button', 'textContent', 'Remove');
    if (supportsLocalStorage()) {
      localStorage.setItem(text, response);
    }
    return li;
  }

  /**
   * Check the new input to make sure the same name isn't already in the list,
   * returns true if it is a duplicate.
   */
  function duplicateChecker(input) {
    let duplicateSwitch = false;
    if (ul.children.length > 0) {
      for (let i = 0; i < ul.children.length; i++) {
        if (input.value === ul.children[i].children[0].textContent) {
          duplicateSwitch = true;
          break;
        };
      }
    }
    return duplicateSwitch;
  }

  /**
   * Listens for a click or enter on the form, checks for duplicates,
   * checks that an empty string hasn't been submitted, calls the
   * createLI function.
   */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (duplicateChecker(input)) {
      input.value = '';
      alert("You already entered that name!");
    } else if ((input.value === '')) {
      alert("You didn't enter a name, please try again!");
    } else {
      const text = input.value;
      input.value = '';
      const li = createLI(text, 'No response');
      ul.appendChild(li);
    }
  });
  /**
   * Listens for a change the list (the only this that can 'change' is to
   * one of the select boxes), assigns that selectBox to variable and assigns
   * its parent node (a list item) to a variable. Changes class of the list 
   * dependant on the value of the select box.
   */
  ul.addEventListener('change', (e) => {
    /**
     * Using the if statement stops the below executing when the name is edited
     * and saved - as this is also a 'change' in the ul. Without the if block, 
     * the list className will be set to 'responded' as the textbox change that triggered
     * the event will be set to the 'selectBox' variable, and this does not have a
     * .value of 'No response' this will cause the list element to stay visible 
     * when the 'Hide those who havent responded' check box is ticked, even though
     * it hasn't been responded to in the select box. 
     */
    if (e.target.tagName === 'SELECT') {
      let selectBox = event.target;
      let listItem = selectBox.parentNode;

      if (selectBox.value === 'No response') {
        listItem.className = '';
      } else {
        listItem.className = 'responded';
      }
      if (supportsLocalStorage()) {
        localStorage.setItem(listItem.firstElementChild.textContent, selectBox.value);
      }
    }
  });

  /**
   * Listens for a click event, checks that the click event is from a button,
   * assigns button properties and parents nodes to variables. Creates Remove,
   * Edit and Save anonymous functions. Calls one of the function, dependant
   * on which button was clicked.
   */
  ul.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const button = e.target;
      const li = button.parentNode;
      const ul = li.parentNode;
      const action = button.textContent;
      const selectBox = li.querySelector('select');

      const nameActions = {
        Remove: () => {
          ul.removeChild(li);
          if (supportsLocalStorage()) {
            localStorage.removeItem(li.firstElementChild.textContent);
          }
        },
        Edit: () => {
          if (supportsLocalStorage()) {
            localStorage.removeItem(li.firstElementChild.textContent);
          }
          const span = li.firstElementChild;
          const input = document.createElement('input');
          input.type = 'text';
          input.value = span.textContent;
          li.insertBefore(input, span);
          li.removeChild(span);
          button.textContent = 'Save';
        },
        Save: () => {
          const input = li.firstElementChild;
          const span = document.createElement('span');
          span.textContent = input.value;
          li.insertBefore(span, input);
          li.removeChild(input);
          button.textContent = 'Edit';
          if (supportsLocalStorage) {
            localStorage.setItem(span.textContent, selectBox.value);
          }
        }
      };
      nameActions[action]();
    }
  });

  function supportsLocalStorage() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }

  window.onload = function () {
    if (supportsLocalStorage()) {
      const keys = Object.keys(localStorage);
      if (keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
          const li = createLI(keys[i], localStorage.getItem(keys[i]));
          ul.appendChild(li);
        }
      }
    }
  }

});