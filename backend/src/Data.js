class Data {
  constructor() {
    this.messagesToLog = [];

    setInterval(this.saveMessageLogs.bind(this), 10 * 60 * 1000);
  }

  logMessage(IP, message, timestamp) {
    this.messagesToLog.push({ IP, message, timestamp });
  }

  saveMessageLogs() {
    const messagesToSave = this.messagesToLog;

    this.messagesToLog = [];

    messagesToSave.forEach((messageLog) => {
      // TODO: Save the message to a database.
    });
  }
}

module.exports = Data;
