function buildDefaultPermissions() {
  return {
    manageProducts: false,
    manageArticles: false,
    manageUsers: false,
    manageNewsletter: false,
    viewMessages: true,
    viewSubscribers: true,
  };
}

module.exports = {
  buildDefaultPermissions,
};
