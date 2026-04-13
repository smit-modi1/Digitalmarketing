const { buildSubAdminRecord, getMasterAdmin, getSessionUser, hasPermission, sanitiseUser } = require("../lib/auth");
const { getSearchParam, readJsonBody, sendJson } = require("../lib/http");
const { getAdminUsers, saveAdminUsers } = require("../lib/store");

module.exports = async (req, res) => {
  try {
    const user = getSessionUser(req);
    if (!hasPermission(user, "manageUsers")) {
      sendJson(res, 403, { error: "Master admin access required." });
      return;
    }

    if (req.method === "GET") {
      const subAdmins = await getAdminUsers();
      sendJson(res, 200, {
        users: [sanitiseUser(getMasterAdmin()), ...subAdmins.map(sanitiseUser)],
      });
      return;
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const users = await getAdminUsers();
      const subAdmin = buildSubAdminRecord(body);
      const masterUser = getMasterAdmin();
      const duplicate =
        users.some((item) => item.email === subAdmin.email || item.username === subAdmin.username) ||
        [masterUser.email, masterUser.username].includes(subAdmin.email) ||
        [masterUser.email, masterUser.username].includes(subAdmin.username);
      if (duplicate) throw new Error("A sub-admin with that email already exists.");
      users.unshift(subAdmin);
      await saveAdminUsers(users);
      sendJson(res, 201, { user: sanitiseUser(subAdmin) });
      return;
    }

    if (req.method === "PUT" || req.method === "DELETE") {
      const userId = getSearchParam(req, "id");
      if (!userId) {
        sendJson(res, 400, { error: "User id is required." });
        return;
      }

      const users = await getAdminUsers();
      const index = users.findIndex((item) => item.id === userId);
      if (index === -1) {
        sendJson(res, 404, { error: "Sub-admin not found." });
        return;
      }

      if (req.method === "DELETE") {
        const [removed] = users.splice(index, 1);
        await saveAdminUsers(users);
        sendJson(res, 200, { ok: true, user: sanitiseUser(removed) });
        return;
      }

      const body = await readJsonBody(req);
      users[index] = {
        ...users[index],
        name: String(body.name || users[index].name).trim(),
        contactNumber: String(body.contactNumber || users[index].contactNumber).trim(),
        active: body.active !== false,
      };
      await saveAdminUsers(users);
      sendJson(res, 200, { user: sanitiseUser(users[index]) });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Could not manage sub-admins." });
  }
};
