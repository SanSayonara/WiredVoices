module.exports = {
  apps: [{
    name: 'WiredVoicesBackend',
    script: 'index.js',
    instances: -2,
    exec_mode: 'cluster',
    watch: '.',
  }],
};
