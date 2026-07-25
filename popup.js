document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  chrome.storage.local.get(['theme'], (data) => {
    if (data.theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    }
  });

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    chrome.storage.local.set({ theme: newTheme });
  });

  // Tab Switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // --- REAL-TIME STRICT INPUT VALIDATION ---
  document.addEventListener('input', (e) => {
    const el = e.target;
    
    if (el.id === 'g-pincode' || el.id === 'v-pincode' || el.id === 'gm-pincode') {
        el.value = el.value.replace(/[^0-9]/g, '').substring(0, 6);
    }
    
    if (el.classList.contains('p-name') || el.classList.contains('s-name') || 
        el.id === 'g-city' || el.id === 'g-state' || el.id === 'g-country' || 
        el.id === 'v-name' || el.id === 'v-surname' || el.id === 'v-city' || el.id === 'v-state' || el.id === 'gm-name') {
        el.value = el.value.replace(/[^a-zA-Z\\s]/g, '');
    }

    if (el.classList.contains('p-age') || el.classList.contains('s-age') || el.id === 'gm-age') {
        el.value = el.value.replace(/[^0-9]/g, '').substring(0, 3);
    }

    if (el.classList.contains('p-id-num') || el.classList.contains('s-id-num') || el.id === 'gm-id-num') {
        const container = el.closest('.pilgrim-card') || el.closest('#group-member-form') || document;
        const idTypeSelect = container.querySelector('.p-id-proof, .s-id-proof, #gm-id-type');
        
        if (idTypeSelect && (idTypeSelect.value.toLowerCase().includes('aadhaar') || idTypeSelect.value.toLowerCase().includes('aadhar'))) {
            el.value = el.value.replace(/[^0-9]/g, '').substring(0, 12);
        } else if (idTypeSelect && idTypeSelect.value.toLowerCase().includes('pan')) {
            el.value = el.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10);
        } else {
             el.value = el.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase().substring(0, 20);
        }
    }
  });

  // Dynamically set MaxLength on ID inputs when Dropdown changes
  document.addEventListener('change', (e) => {
      const el = e.target;
      if (el.classList.contains('p-id-proof') || el.classList.contains('s-id-proof') || el.id === 'gm-id-type') {
          const container = el.closest('.pilgrim-card') || el.closest('#group-member-form');
          const idInput = container.querySelector('.p-id-num, .s-id-num, #gm-id-num');
          if (idInput) {
              const val = el.value.toLowerCase();
              if (val.includes('aadhaar') || val.includes('aadhar')) {
                  idInput.maxLength = 12;
                  idInput.setAttribute('pattern', '\\d{12}');
                  idInput.value = idInput.value.replace(/[^0-9]/g, '').substring(0, 12); // clean instantly
              } else if (val.includes('pan')) {
                  idInput.maxLength = 10;
                  idInput.removeAttribute('pattern');
              } else {
                  idInput.maxLength = 20;
                  idInput.removeAttribute('pattern');
              }
          }
      }
  });

  // --- TAB 1: PILGRIM BOOKING ---
  const pilgrimsContainer = document.getElementById('pilgrims-container');
  const pilgrimTemplate = document.getElementById('pilgrim-template');
  const addPilgrimBtn = document.getElementById('add-pilgrim');

  function addPilgrimCard(data = {}) {
    if (pilgrimsContainer.children.length >= 6) {
      alert("Maximum 6 pilgrims allowed.");
      return;
    }
    const clone = pilgrimTemplate.content.cloneNode(true);
    const card = clone.querySelector('.pilgrim-card');
    
    // Update number
    const pNum = clone.querySelector('.p-num');
    pNum.textContent = pilgrimsContainer.children.length + 1;

    // Passport Toggle Logic
    const idProofSelect = clone.querySelector('.p-id-proof');
    const passportFields = clone.querySelector('.passport-fields');
    idProofSelect.addEventListener('change', (e) => {
      passportFields.style.display = e.target.value === 'Passport' ? 'block' : 'none';
    });

    // Populate data
    if (data.name) clone.querySelector('.p-name').value = data.name;
    if (data.age) clone.querySelector('.p-age').value = data.age;
    if (data.gender) clone.querySelector('.p-gender').value = data.gender;
    if (data.idProof) {
      idProofSelect.value = data.idProof;
      if (data.idProof === 'Passport') passportFields.style.display = 'block';
    }
    if (data.idNumber) clone.querySelector('.p-id-num').value = data.idNumber;
    
    if (data.country) clone.querySelector('.p-country').value = data.country;
    if (data.visaNum) clone.querySelector('.p-visa-num').value = data.visaNum;
    if (data.visaType) clone.querySelector('.p-visa-type').value = data.visaType;
    if (data.visaDate) clone.querySelector('.p-visa-date').value = data.visaDate;

    // Remove logic
    clone.querySelector('.remove-btn').addEventListener('click', () => {
      card.remove();
      // Renumber
      Array.from(pilgrimsContainer.children).forEach((c, i) => {
        c.querySelector('.p-num').textContent = i + 1;
      });
    });

    pilgrimsContainer.appendChild(clone);
  }

  addPilgrimBtn.addEventListener('click', () => addPilgrimCard());

  // --- TAB 4: SRIVANI ---
  const srivaniContainer = document.getElementById('srivani-container');
  const srivaniTemplate = document.getElementById('srivani-template');
  const addSrivaniBtn = document.getElementById('add-srivani');

  function addSrivaniCard(data = {}) {
    if (srivaniContainer.children.length >= 4) {
      alert("Maximum 4 people allowed for Srivani.");
      return;
    }
    const clone = srivaniTemplate.content.cloneNode(true);
    const card = clone.querySelector('.pilgrim-card');
    
    // Update number
    clone.querySelector('.p-num').textContent = srivaniContainer.children.length + 1;

    // Populate data
    if (data.name) clone.querySelector('.s-name').value = data.name;
    if (data.age) clone.querySelector('.s-age').value = data.age;
    if (data.gender) clone.querySelector('.s-gender').value = data.gender;
    if (data.idProof) clone.querySelector('.s-id-proof').value = data.idProof;
    if (data.idNumber) clone.querySelector('.s-id-num').value = data.idNumber;

    clone.querySelector('.remove-btn').addEventListener('click', () => {
      card.remove();
      Array.from(srivaniContainer.children).forEach((c, i) => {
        c.querySelector('.p-num').textContent = i + 1;
      });
    });

    srivaniContainer.appendChild(clone);
  }

  addSrivaniBtn.addEventListener('click', () => addSrivaniCard());

  // --- LOAD SAVED DATA ---
  chrome.storage.local.get(['generalDetails', 'pilgrims', 'srivani', 'srivari', 'groupMembers'], (data) => {
    // General
    if (data.generalDetails) {
      document.getElementById('g-email').value = data.generalDetails.email || '';
      document.getElementById('g-city').value = data.generalDetails.city || '';
      document.getElementById('g-state').value = data.generalDetails.state || '';
      document.getElementById('g-country').value = data.generalDetails.country || 'India';
      document.getElementById('g-pincode').value = data.generalDetails.pincode || '';
      document.getElementById('g-gothram').value = data.generalDetails.gothram || '';
    }
    // Pilgrims
    if (data.pilgrims && data.pilgrims.length > 0) {
      data.pilgrims.forEach(p => addPilgrimCard(p));
    } else {
      addPilgrimCard(); // add one blank by default
    }
    
    // Srivani
    if (data.srivani && data.srivani.length > 0) {
      data.srivani.forEach(p => addSrivaniCard(p));
    } else {
      addSrivaniCard();
    }
    
    // Srivari
    if (data.srivari) {
      document.getElementById('v-name').value = data.srivari.name || '';
      document.getElementById('v-surname').value = data.srivari.surname || '';
      document.getElementById('v-father').value = data.srivari.father || '';
      document.getElementById('v-dob').value = data.srivari.dob || '';
      document.getElementById('v-mobile').value = data.srivari.mobile || '';
      document.getElementById('v-blood').value = data.srivari.blood || '';
      
      document.getElementById('v-street').value = data.srivari.street || '';
      document.getElementById('v-door').value = data.srivari.door || '';
      document.getElementById('v-city').value = data.srivari.city || '';
      document.getElementById('v-district').value = data.srivari.district || '';
      document.getElementById('v-state').value = data.srivari.state || '';
      document.getElementById('v-pincode').value = data.srivari.pincode || '';
    }
    
    // Group Seva Logic
    let groupMembers = data.groupMembers || {};
    const memberSelect = document.getElementById('group-member-select');
    
    const loadGroupMember = (index) => {
        const member = groupMembers[index] || {};
        document.getElementById('gm-name').value = member.name || '';
        document.getElementById('gm-dob').value = member.dob || '';
        document.getElementById('gm-id-type').value = member.idType || 'Aadhaar Card';
        document.getElementById('gm-id-num').value = member.idNum || '';
        document.getElementById('gm-gender').value = member.gender || 'Male';
        document.getElementById('gm-blood').value = member.blood || '';
    };
    
    memberSelect.addEventListener('change', (e) => loadGroupMember(e.target.value));
    loadGroupMember('1'); // Load member 1 by default
    
    document.getElementById('save-group-btn').addEventListener('click', () => {
        const idx = memberSelect.value;
        groupMembers[idx] = {
            name: document.getElementById('gm-name').value,
            dob: document.getElementById('gm-dob').value,
            idType: document.getElementById('gm-id-type').value,
            idNum: document.getElementById('gm-id-num').value,
            gender: document.getElementById('gm-gender').value,
            blood: document.getElementById('gm-blood').value
        };
        chrome.storage.local.set({ groupMembers }, () => {
            showToast('✅ Group Member saved!');
        });
    });
  });

  // --- TOAST NOTIFICATION ---
  const toast = document.getElementById('toast-container');
  let toastTimeout;
  function showToast(message) {
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
          toast.classList.remove('show');
      }, 2500);
  }

  // --- SAVE LOGIC ---
  document.getElementById('save-btn').addEventListener('click', () => {
    const generalDetails = {
      email: document.getElementById('g-email').value,
      city: document.getElementById('g-city').value,
      state: document.getElementById('g-state').value,
      country: document.getElementById('g-country').value,
      pincode: document.getElementById('g-pincode').value,
      gothram: document.getElementById('g-gothram').value
    };

    const pilgrims = [];
    document.querySelectorAll('#pilgrims-container .pilgrim-card').forEach(card => {
      pilgrims.push({
        name: card.querySelector('.p-name').value,
        age: card.querySelector('.p-age').value,
        gender: card.querySelector('.p-gender').value,
        idProof: card.querySelector('.p-id-proof').value,
        idNumber: card.querySelector('.p-id-num').value,
        country: card.querySelector('.p-country').value,
        visaNum: card.querySelector('.p-visa-num').value,
        visaType: card.querySelector('.p-visa-type').value,
        visaDate: card.querySelector('.p-visa-date').value
      });
    });

    chrome.storage.local.set({ generalDetails, pilgrims }, () => {
      showToast('✅ Details saved successfully!');
    });
  });

  document.getElementById('save-srivani-btn').addEventListener('click', () => {
    const srivani = [];
    document.querySelectorAll('#srivani-container .pilgrim-card').forEach(card => {
      srivani.push({
        name: card.querySelector('.s-name').value,
        age: card.querySelector('.s-age').value,
        gender: card.querySelector('.s-gender').value,
        idProof: card.querySelector('.s-id-proof').value,
        idNumber: card.querySelector('.s-id-num').value,
      });
    });

    chrome.storage.local.set({ srivani }, () => {
      showToast('✅ Srivani Details saved!');
    });
  });

  document.getElementById('save-srivari-btn').addEventListener('click', () => {
    const srivari = {
      name: document.getElementById('v-name').value,
      surname: document.getElementById('v-surname').value,
      father: document.getElementById('v-father').value,
      dob: document.getElementById('v-dob').value,
      mobile: document.getElementById('v-mobile').value,
      blood: document.getElementById('v-blood').value,
      street: document.getElementById('v-street').value,
      door: document.getElementById('v-door').value,
      city: document.getElementById('v-city').value,
      district: document.getElementById('v-district').value,
      state: document.getElementById('v-state').value,
      pincode: document.getElementById('v-pincode').value
    };
    chrome.storage.local.set({ srivari }, () => {
      showToast('✅ Srivari Details saved!');
    });
  });

  // --- AUTOFILL COMMANDS ---
  document.getElementById('autofill-btn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "autofill_darshan"});
    });
  });

  document.getElementById('autofill-srivani-btn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "autofill_srivani"});
    });
  });
  
  document.getElementById('autofill-srivari-btn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "autofill_srivari"});
    });
  });
  
  document.getElementById('autofill-group-btn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const memberId = document.getElementById('group-member-select').value;
      chrome.tabs.sendMessage(tabs[0].id, {action: "autofill_group", memberId});
    });
  });
});
