module.exports = {
  apps: [{
    name: 'WiredVoicesBackend',
    script: 'src/index.js',
    instances: -2,
    exec_mode: 'cluster',
    watch: '.',
  }],
};
