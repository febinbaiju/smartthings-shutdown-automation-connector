# Samsung SmartThings Shutdown Connector

A Node.js-based SmartApp that integrates with Samsung SmartThings and allows you to remotely trigger a system shutdown using a virtual switch.

## 🚀 Features

* Configure a SmartThings virtual switch to trigger system shutdown.
* Securely integrates using SmartThings SmartApp lifecycle events.
* Subscribes to `switch.on` events to trigger shutdown.
* Automatically deletes/re-creates subscriptions on update.
* Turns off the switch after triggering shutdown.

---

## 📦 Requirements

* Node.js (v16 or later recommended)
* A SmartThings developer account
* A Raspberry Pi (or any Linux system that supports `shutdown`)

---

## 📁 Project Structure

```
smartthings-shutdown-connector/
├── app.js           # Main application logic
├── .env             # Environment variable configuration
├── package.json     # Project dependencies and scripts
└── README.md        # You're reading it!
```

---

## 🔧 Installation

```bash
# Clone the repo
git clone https://github.com/your-username/smartthings-shutdown-connector.git
cd smartthings-shutdown-connector

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add required values
```

### Example `.env`

```ini
PORT=5165
APP_NAME=SmartThings Shutdown
APP_DESCRIPTION=Trigger system shutdown from SmartThings
APP_ID=your-app-id
```

---

## 🏃‍♂️ Usage

Start the server:

```bash
npm start
```

Make sure the server is publicly accessible (you can use [ngrok](https://ngrok.com) during development).

Then, install your SmartApp on Samsung SmartThings Developer Workspace:

* Use your public endpoint (e.g., via ngrok) as the SmartApp URL.
* Grant permissions for `switch` capability.
* Choose your virtual switch during configuration.

---

## ⚙️ Lifecycle Events Supported

* `CONFIGURATION`
* `INSTALL`
* `UPDATE`
* `EVENT`
* `UNINSTALL`

---

## ⚠️ Important Notes

* Your server needs `sudo` permission to run `shutdown`.
* It’s recommended to configure your system to allow passwordless shutdown for your service user.
* The virtual switch will be turned off automatically after triggering.

---

---

## 👨‍💻 Author

**Febin Baiju**
