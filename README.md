# TTD Auto Fill Extension ⚡️

![TTD Auto Fill](icon128.png)

**TTD Auto Fill** is a lightning-fast, premium Chrome Extension designed to automate the grueling process of filling out booking forms on the official Tirumala Tirupati Devasthanams (TTD) website.

Built with an incredibly sleek, Apple-inspired frosted glass UI, it is designed for maximum speed, accuracy, and reliability, completely bypassing common errors and framework glitches on the TTD portal.

---

## ✨ Key Features

### 🍎 Premium Apple-Style UI
Enjoy a beautifully crafted popup interface featuring smooth micro-animations, frosted glass overlays, and dynamic dark/light mode toggles.

### 🧠 Smart Context Detection
The extension intelligently reads the URL to understand exactly which form you are on (Darshan, Srivari Seva, Group Seva, or Srivani) and applies the correct logic automatically. 

### 🛡️ Single Page Application (SPA) Resilience
TTD uses the Angular framework, which aggressively deletes normal extensions when navigating between pages. TTD Auto Fill uses a specialized "Respawn Loop" that guarantees the floating widget survives page changes and is always ready when you need it.

### 🔒 Real-Time Strict Input Validation
Never make a mistake when rushing to book! The extension actively enforces native constraints:
- **Aadhaar Cards:** Strictly limited to exactly 12 numerical digits.
- **PAN Cards:** Automatically switches to alphanumeric, max 10 characters.
- **Pincodes:** Strictly limits to 6 numbers.
- **Names & Cities:** Blocks numbers and special symbols.

### 🗺️ State Abbreviation Engine
No need to type out "Andhra Pradesh". Simply type `AP`, `TS`, `TN`, or `MH` in the extension, and it will automatically translate and select the full state name in the TTD dropdown menus!

### 🚀 Direct Angular Override
Normal autofill extensions fail on TTD because the visual text box changes, but the underlying Angular framework doesn't notice, resulting in glaring *"This field is required"* red errors. This extension injects a Native Value Setter that talks directly to Angular, making the red errors vanish instantly.

---

## 🛠️ Installation (Developer Mode)

1. Download or clone this repository to your local machine.
   ```bash
   git clone https://github.com/CloudLoftCreatives/ttdautofill.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`
3. Turn on **Developer mode** (toggle switch in the top right corner).
4. Click **Load unpacked** and select the folder where you downloaded this repository.
5. The extension is now installed! Pin it to your toolbar for easy access.

---

## 🚀 How to Use

1. **Pre-Fill Your Data:** Click the TTD Auto Fill icon in your browser toolbar to open the popup. Enter your General Details, Pilgrim info, and ID numbers.
2. **Save:** Click the **💾 Save Details** button. The data is securely stored locally on your device.
3. **Go to TTD:** Navigate to the [TTD Booking Portal](https://ttdevasthanams.ap.gov.in/).
4. **Auto-Fill:** You will see a glossy **⚡ Auto Fill** widget hovering on the bottom right of the website. Simply click it, and watch it populate the entire form flawlessly in milliseconds!
5. **Drag & Drop:** If the floating widget is ever in your way, you can click and drag it anywhere on the screen!

---

## 📸 Screenshots

*(Add your screenshots here!)*

* **Popup Interface**
  <!-- ![Popup UI](screenshots/popup.png) -->
* **Floating Web Widget**
  <!-- ![Floating Widget](screenshots/widget.png) -->

---

## 💬 Feedback & Support

Built by CloudLoft Creatives. 
Have a feature request or found a bug? 
[✉️ Contact us for feedback](mailto:cloudloftcreatives@gmail.com?subject=TTD%20Auto%20Fill%20Feedback)
