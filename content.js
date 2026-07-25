// content.js

// --- SMART LOOP ENGINE ---
function runPersistentFill(fillFunction) {
    fillFunction();
    let count = 0;
    const interval = setInterval(() => {
        fillFunction();
        count++;
        if (count >= 3) clearInterval(interval);
    }, 1500);
}

// --- MESSAGE LISTENER ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "autofill_darshan") {
    runPersistentFill(() => {
        chrome.storage.local.get(['generalDetails', 'pilgrims'], async (data) => {
          if (data.generalDetails) fillGeneralDetails(data.generalDetails);
          if (data.pilgrims && data.pilgrims.length > 0) await fillPilgrimDetails(data.pilgrims);
        });
    });
  } else if (request.action === "autofill_srivani") {
    runPersistentFill(() => {
        chrome.storage.local.get(['srivani'], async (data) => {
          if (data.srivani && data.srivani.length > 0) await fillSrivaniDetails(data.srivani);
        });
    });
  } else if (request.action === "autofill_srivari") {
    runPersistentFill(() => {
        chrome.storage.local.get(['srivari'], async (data) => {
          if (data.srivari) await fillSrivariForm(data.srivari);
        });
    });
  } else if (request.action === "autofill_group") {
    runPersistentFill(() => {
        chrome.storage.local.get(['groupMembers'], async (data) => {
          const memberId = request.memberId || '1';
          if (data.groupMembers && data.groupMembers[memberId]) await fillGroupMemberForm(data.groupMembers[memberId]);
        });
    });
  }
});

// --- FLOATING WIDGET INJECTION ---
function injectFloatingWidget() {
    if (window.location.protocol.startsWith('chrome-extension')) return;
    if (document.getElementById('ttd-premium-autofill-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'ttd-premium-autofill-widget';
    widget.innerHTML = `
        <button id="ttd-autofill-float-btn" style="
            background: linear-gradient(135deg, #5e5ce6, #bf5af2);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 14px 28px;
            font-size: 16px;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            box-shadow: 0 8px 24px rgba(94, 92, 230, 0.4);
            cursor: grab;
            transition: box-shadow 0.2s;
            display: flex;
            align-items: center;
            gap: 10px;
        ">
            <span style="font-size: 20px; pointer-events: none;">⚡</span>
            <span id="ttd-btn-text" style="pointer-events: none;">Auto Fill</span>
        </button>
    `;
    widget.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 40px;
        z-index: 999999;
        touch-action: none;
    `;
    
    document.body.appendChild(widget);

    const btn = document.getElementById('ttd-autofill-float-btn');
    const textSpan = document.getElementById('ttd-btn-text');
    let isDragging = false;
    let hasDragged = false;
    let startX, startY, initialX, initialY;

    btn.addEventListener('mousedown', (e) => {
        isDragging = true;
        hasDragged = false;
        btn.style.cursor = 'grabbing';
        btn.style.transition = 'none';

        startX = e.clientX;
        startY = e.clientY;
        const rect = widget.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;

        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            hasDragged = true;
        }

        widget.style.bottom = 'auto';
        widget.style.right = 'auto';
        widget.style.left = `${initialX + dx}px`;
        widget.style.top = `${initialY + dy}px`;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            btn.style.cursor = 'grab';
            btn.style.transition = 'box-shadow 0.2s';
        }
    });

    btn.addEventListener('mouseover', () => {
        if (!isDragging) btn.style.boxShadow = '0 12px 28px rgba(94, 92, 230, 0.5)';
    });
    btn.addEventListener('mouseout', () => {
        if (!isDragging) btn.style.boxShadow = '0 8px 24px rgba(94, 92, 230, 0.4)';
    });

    btn.addEventListener('click', (e) => {
        if (hasDragged) {
            e.preventDefault();
            return;
        }
        
        const url = window.location.href.toLowerCase();
        
        textSpan.innerHTML = `✨ Filling...`;
        
        // Smart Context Detection (Rely ONLY on URL to prevent false positives from Navigation bar text)
        let action = "autofill_darshan";
        if (url.includes('srivari') && !url.includes('darshan')) {
            action = "autofill_srivari";
        } else if (url.includes('srivani')) {
            action = "autofill_srivani";
        } else if (url.includes('group')) {
            action = "autofill_group";
        }

        window.postMessage({ type: 'FROM_TTD_WIDGET', action: action }, '*');
        
        if (action === "autofill_darshan") {
            runPersistentFill(() => {
                chrome.storage.local.get(['generalDetails', 'pilgrims'], async (data) => {
                  try {
                      if (data.generalDetails) await fillGeneralDetails(data.generalDetails);
                      if (data.pilgrims && data.pilgrims.length > 0) await fillPilgrimDetails(data.pilgrims);
                  } catch(e) {}
                });
            });
        } else if (action === "autofill_srivani") {
            runPersistentFill(() => {
                chrome.storage.local.get(['srivani'], async (data) => {
                  try {
                      if (data.srivani && data.srivani.length > 0) await fillSrivaniDetails(data.srivani);
                  } catch(e) {}
                });
            });
        } else if (action === "autofill_srivari") {
            runPersistentFill(() => {
                chrome.storage.local.get(['srivari'], async (data) => {
                  try {
                      if (data.srivari) await fillSrivariForm(data.srivari);
                  } catch(e) {}
                });
            });
        } else if (action === "autofill_group") {
            runPersistentFill(() => {
                chrome.storage.local.get(['groupMembers'], async (data) => {
                  try {
                      if (data.groupMembers && data.groupMembers.length > 0) await fillGroupMembers(data.groupMembers);
                  } catch(e) {}
                });
            });
        }
        
        setTimeout(() => {
            textSpan.innerHTML = `✅ Done!`;
            setTimeout(() => {
                textSpan.innerHTML = `Auto Fill`;
            }, 2000);
        }, 3000); 
    });
}

function ensureWidget() {
    injectFloatingWidget();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ensureWidget();
        setInterval(ensureWidget, 2000);
    });
} else {
    ensureWidget();
    setInterval(ensureWidget, 2000);
}

function simulateInput(element, value) {
  if (!element || value === undefined || value === '') return;
  if (element.value === value) return;
  
  element.focus();

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set 
      || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
      || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;

  if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, value);
  } else {
      element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.blur();
}

async function selectCustomDropdown(field, valueToSelect) {
    if (!field || !valueToSelect) return;

    if (field.type === 'radio') {
        let nameAttr = field.name || field.getAttribute('formcontrolname') || field.getAttribute('ng-reflect-name');
        let radios = [];
        if (nameAttr) {
            radios = Array.from(document.querySelectorAll(`input[type="radio"][name="${nameAttr}"], input[type="radio"][formcontrolname="${nameAttr}"]`));
        }
        
        if (radios.length <= 1) {
            let container = field.parentElement;
            for(let i=0; i<5; i++) {
                if (!container) break;
                let found = Array.from(container.querySelectorAll('input[type="radio"]'));
                if (found.length > 1) {
                    radios = found;
                    break;
                }
                container = container.parentElement;
            }
            if (radios.length <= 1) {
                let allRadios = Array.from(document.querySelectorAll('input[type="radio"]'));
                let idx = allRadios.indexOf(field);
                if (idx !== -1) {
                    radios = [field];
                    if (allRadios[idx + 1]) radios.push(allRadios[idx + 1]);
                    if (allRadios[idx + 2]) radios.push(allRadios[idx + 2]);
                } else {
                    radios = [field];
                }
            }
        }

        const valLow = valueToSelect.toLowerCase().trim();
        for (let radio of radios) {
            let labelText = '';
            if (radio.labels && radio.labels.length > 0) {
                labelText = radio.labels[0].textContent.toLowerCase();
            } else if (radio.nextElementSibling && radio.nextElementSibling.tagName === 'LABEL') {
                labelText = radio.nextElementSibling.textContent.toLowerCase();
            } else if (radio.nextSibling && radio.nextSibling.nodeType === 3 && radio.nextSibling.textContent.trim() !== '') {
                labelText = radio.nextSibling.textContent.toLowerCase();
            } else if (radio.parentElement && radio.parentElement.querySelectorAll('input[type="radio"]').length === 1) {
                labelText = radio.parentElement.textContent.toLowerCase();
            } else if (radio.nextElementSibling) {
                labelText = radio.nextElementSibling.textContent.toLowerCase();
            }
            
            let rVal = (radio.value || '').toLowerCase();
            if (labelText.includes(valLow) || rVal === valLow || rVal === valLow.charAt(0)) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                radio.dispatchEvent(new Event('click', { bubbles: true }));
                
                // Aggressively click visual labels for Angular custom UI components
                if (radio.labels && radio.labels.length > 0) radio.labels[0].click();
                else if (radio.parentElement && radio.parentElement.tagName === 'LABEL') radio.parentElement.click();
                else if (radio.nextElementSibling && radio.nextElementSibling.tagName === 'LABEL') radio.nextElementSibling.click();
                else radio.parentElement.click();
                
                simulateInput(radio, true);
                return;
            }
        }
        return;
    }

    let clickable = field;
    let currentText = '';

    if (field.type === 'hidden' && field.parentElement) {
        const visibleSibling = field.parentElement.querySelector('div[role="button"], div[role="combobox"]');
        clickable = visibleSibling || field.parentElement;
        currentText = clickable.textContent.toLowerCase().trim();
    } else if (field.tagName === 'INPUT' && !field.readOnly) {
         simulateInput(field, valueToSelect);
         currentText = field.value.toLowerCase().trim();
    } else if (field.tagName === 'SELECT') {
        const valLow = valueToSelect.toLowerCase();
        const option = Array.from(field.options).find(o => o.text.toLowerCase().includes(valLow) || valLow.includes(o.text.toLowerCase()));
        if (option) simulateInput(field, option.value);
        return;
    }

    const valLow = valueToSelect.toLowerCase().trim();
    if (currentText === valLow || currentText.includes(valLow) || (valLow.includes(currentText) && currentText.length > 2)) {
        return; 
    }

    clickable.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    clickable.click();

    await new Promise(resolve => setTimeout(resolve, 80));

    const options = Array.from(document.querySelectorAll('li, [role="option"]'));
    const target = options.find(opt => {
        const text = opt.textContent.toLowerCase().trim();
        return text === valLow || text.includes(valLow) || valLow.includes(text);
    });

    if (target) {
        target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        target.click();
    } else {
        simulateInput(field, valueToSelect);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    }

    await new Promise(resolve => setTimeout(resolve, 30));
}

const stateMap = {
    'ap': 'Andhra Pradesh',
    'ts': 'Telangana',
    'tg': 'Telangana',
    'tn': 'Tamil Nadu',
    'ka': 'Karnataka',
    'mh': 'Maharashtra',
    'up': 'Uttar Pradesh',
    'dl': 'Delhi',
    'kl': 'Kerala',
    'mp': 'Madhya Pradesh',
    'hp': 'Himachal Pradesh',
    'wb': 'West Bengal',
    'gj': 'Gujarat',
    'rj': 'Rajasthan',
    'hr': 'Haryana',
    'pb': 'Punjab',
    'br': 'Bihar',
    'or': 'Odisha',
    'od': 'Odisha',
    'cg': 'Chhattisgarh',
    'jh': 'Jharkhand',
    'uk': 'Uttarakhand',
    'as': 'Assam',
    'jk': 'Jammu and Kashmir',
    'ga': 'Goa'
};

function normalizeState(state) {
    if (!state) return state;
    const lower = state.toLowerCase().replace(/\\./g, '').trim();
    return stateMap[lower] || state;
}

const getInputsByLabel = (labelKeywords, excludeKeywords = []) => {
     const labels = Array.from(document.querySelectorAll('label, span, div, p, th, td')).filter(el => {
         const directText = Array.from(el.childNodes)
             .filter(node => node.nodeType === Node.TEXT_NODE)
             .map(node => node.textContent.trim())
             .join(' ');
             
         const text = directText.toLowerCase().replace(/[*:]/g, '').trim();
         
         const isMatch = labelKeywords.some(kw => text === kw || text.startsWith(kw + ' '));
         if (!isMatch) return false;
         
         if (excludeKeywords.some(kw => text.includes(kw))) return false;
         return true;
     });
     
     const inputs = [];
     labels.forEach(label => {
         let parent = label.parentElement;
         let found = false;
         for(let i=0; i<6; i++) {
             if(!parent || found) break;
             const fieldInputs = Array.from(parent.querySelectorAll('input, select'));
             for(let input of fieldInputs) {
                 if (!inputs.includes(input) && input.type !== 'hidden') {
                     inputs.push(input);
                     found = true;
                     break;
                 }
             }
             parent = parent.parentElement;
         }
     });
     return inputs;
};

async function fillGeneralDetails(details) {
    const emails = getInputsByLabel(['email address', 'email']);
    if (emails.length > 0) simulateInput(emails[0], details.email);
    
    const cities = getInputsByLabel(['city']);
    if (cities.length > 0) await selectCustomDropdown(cities[0], details.city);
    
    const states = getInputsByLabel(['state']);
    if (states.length > 0) await selectCustomDropdown(states[0], normalizeState(details.state));
    
    const countries = getInputsByLabel(['country']);
    if (countries.length > 0) await selectCustomDropdown(countries[0], details.country);
    
    const pincodes = getInputsByLabel(['pincode', 'pin code', 'zip']);
    if (pincodes.length > 0) simulateInput(pincodes[0], details.pincode);
    
    const gothrams = getInputsByLabel(['gothram']);
    if (gothrams.length > 0) simulateInput(gothrams[0], details.gothram);
}

async function handlePassportPopup(pilgrim) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const countries = getInputsByLabel(['country']);
    const visaNums = getInputsByLabel(['visa/oci', 'visa / oci', 'visa number']);
    const visaTypes = getInputsByLabel(['type of visa', 'visa type']);
    const visaDates = getInputsByLabel(['visa validity', 'validity date']);
    
    const findVisible = (arr) => arr.find(el => el.offsetParent !== null);
    
    if (pilgrim.country) simulateInput(findVisible(countries), pilgrim.country);
    if (pilgrim.visaNum) simulateInput(findVisible(visaNums), pilgrim.visaNum);
    if (pilgrim.visaType) simulateInput(findVisible(visaTypes), pilgrim.visaType);
    if (pilgrim.visaDate) simulateInput(findVisible(visaDates), pilgrim.visaDate);
    
    const buttons = Array.from(document.querySelectorAll('button'));
    const submitBtn = buttons.find(b => b.textContent.toLowerCase().includes('add') || b.textContent.toLowerCase().includes('submit') || b.textContent.toLowerCase().includes('save'));
    if (submitBtn && submitBtn.offsetParent !== null) {
        submitBtn.click();
        await new Promise(resolve => setTimeout(resolve, 300));
    }
}

async function fillPilgrimDetails(pilgrims) {
    // Exclude "seva name" or "temple name" to prevent Pilgrim 2 being skipped
    const names = getInputsByLabel(['name'], ['seva name', 'temple name']);
    const ages = getInputsByLabel(['age']);
    const genders = getInputsByLabel(['gender']);
    const idProofs = getInputsByLabel(['photo id proof', 'id proof']);
    const idNumbers = getInputsByLabel(['photo id number', 'id number']);

    for (let index = 0; index < pilgrims.length; index++) {
        const pilgrim = pilgrims[index];
        if (names[index]) simulateInput(names[index], pilgrim.name);
        if (ages[index]) simulateInput(ages[index], pilgrim.age);
        if (idNumbers[index]) simulateInput(idNumbers[index], pilgrim.idNumber);
        
        if (genders[index]) {
            await selectCustomDropdown(genders[index], pilgrim.gender);
        }
        
        if (idProofs[index]) {
            await selectCustomDropdown(idProofs[index], pilgrim.idProof);
            if (pilgrim.idProof.toLowerCase().includes('passport')) {
                await handlePassportPopup(pilgrim);
            }
        }
    }
}

async function fillSrivaniDetails(pilgrims) {
    const names = getInputsByLabel(['name'], ['seva name', 'temple name']);
    const ages = getInputsByLabel(['age']);
    const genders = getInputsByLabel(['gender']);
    const idProofs = getInputsByLabel(['photo id proof', 'id proof']);
    const idNumbers = getInputsByLabel(['photo id number', 'id number']);

    for (let index = 0; index < pilgrims.length; index++) {
        const pilgrim = pilgrims[index];
        if (names[index]) simulateInput(names[index], pilgrim.name);
        if (ages[index]) simulateInput(ages[index], pilgrim.age);
        if (idNumbers[index]) simulateInput(idNumbers[index], pilgrim.idNumber);
        
        if (genders[index]) {
            await selectCustomDropdown(genders[index], pilgrim.gender);
        }
        
        if (idProofs[index]) {
            await selectCustomDropdown(idProofs[index], pilgrim.idProof);
        }
    }
}

async function fillSrivariForm(data) {
    const names = getInputsByLabel(['name', 'first name', 'full name'], ['seva name', 'temple name']);
    const surnames = getInputsByLabel(['surname', 'last name']);
    const fathers = getInputsByLabel(['father', 'spouse', 'husband']);
    const dobs = getInputsByLabel(['dob', 'date of birth']);
    const mobiles = getInputsByLabel(['mobile', 'phone']);
    const bloods = getInputsByLabel(['blood group', 'blood']);
    const streets = getInputsByLabel(['street', 'address 1', 'line 1']);
    const doors = getInputsByLabel(['door', 'flat', 'house no']);
    const cities = getInputsByLabel(['city', 'town', 'village']);
    const districts = getInputsByLabel(['district']);
    const states = getInputsByLabel(['state']);
    const pincodes = getInputsByLabel(['pincode', 'pin code', 'zip']);

    if (names.length > 0) simulateInput(names[0], data.name);
    if (surnames.length > 0) simulateInput(surnames[0], data.surname);
    if (fathers.length > 0) simulateInput(fathers[0], data.father);
    if (dobs.length > 0) simulateInput(dobs[0], data.dob);
    if (mobiles.length > 0) simulateInput(mobiles[0], data.mobile);
    if (bloods.length > 0) simulateInput(bloods[0], data.blood);
    if (streets.length > 0) simulateInput(streets[0], data.street);
    if (doors.length > 0) simulateInput(doors[0], data.door);
    if (cities.length > 0) simulateInput(cities[0], data.city);
    if (districts.length > 0) await selectCustomDropdown(districts[0], data.district);
    if (states.length > 0) await selectCustomDropdown(states[0], normalizeState(data.state));
    if (pincodes.length > 0) simulateInput(pincodes[0], data.pincode);
}

async function fillGroupMemberForm(data) {
    const names = getInputsByLabel(['name', 'full name'], ['seva name', 'temple name']);
    const dobs = getInputsByLabel(['dob', 'date of birth']);
    const idTypes = getInputsByLabel(['id proof type', 'id proof']);
    const idNums = getInputsByLabel(['id number', 'photo id number']);
    const genders = getInputsByLabel(['gender']);
    const bloods = getInputsByLabel(['blood group', 'blood']);

    const findVisible = (arr) => arr.find(el => el.offsetParent !== null);

    const vName = findVisible(names);
    const vDob = findVisible(dobs);
    const vIdType = findVisible(idTypes);
    const vIdNum = findVisible(idNums);
    const vGender = findVisible(genders);
    const vBlood = findVisible(bloods);

    if (vName) simulateInput(vName, data.name);
    if (vDob) simulateInput(vDob, data.dob);
    if (vIdType) await selectCustomDropdown(vIdType, data.idType);
    if (vIdNum) simulateInput(vIdNum, data.idNum);
    if (vGender) await selectCustomDropdown(vGender, data.gender);
    if (vBlood) simulateInput(vBlood, data.blood);
}
