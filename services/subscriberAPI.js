import { handleAPIRequest } from "./axiosInstance";
import { axiosInstance } from "./axiosInstance";
import { subscriberPaths } from "./apiPaths";

/** 404 → try alternate route (many servers only mount `/team` OR `/members`, not both). */
function isNotFound(err) {
  return err?.response?.status === 404;
}

/**
 * Prefer legacy `/api/subscriber/team` first (common on existing APIs).
 * If 404, retry `/api/subscriber/members`.
 */
async function subscriberTeamRequest(legacyFn, modernFn) {
  try {
    return await legacyFn();
  } catch (err) {
    if (!isNotFound(err)) throw err;
    return await modernFn();
  }
}

/**
 * Per-member permissions: backend spec uses `/api/subscriber/members/:id/permissions`.
 * Try that first; if 404, retry legacy `/api/subscriber/team/:id/permissions`.
 */
async function subscriberMemberPermissionsRequest(primaryFn, fallbackFn) {
  try {
    return await primaryFn();
  } catch (err) {
    if (!isNotFound(err)) throw err;
    return await fallbackFn();
  }
}

/** GET — list tenant team members (Subscriber Super Admin). */
export const getSubscriberTeamAPI = () =>
  subscriberTeamRequest(
    () =>
      handleAPIRequest(
        (endpoint) => axiosInstance.get(endpoint),
        subscriberPaths.team,
        null
      ),
    () =>
      handleAPIRequest(
        (endpoint) => axiosInstance.get(endpoint),
        subscriberPaths.members,
        null
      )
  );

/** POST — create subscriber admin / manager / staff. */
export const createSubscriberTeamMemberAPI = (body) =>
  subscriberTeamRequest(
    () => handleAPIRequest(axiosInstance.post, subscriberPaths.team, body),
    () => handleAPIRequest(axiosInstance.post, subscriberPaths.members, body)
  );

/** PUT /api/subscriber/team/:id — update member. */
export const updateSubscriberTeamMemberAPI = (id, body) => {
  if (!id) return Promise.reject(new Error("Member ID required"));
  return handleAPIRequest(axiosInstance.put, subscriberPaths.teamMember(id), body);
};

/** DELETE /api/subscriber/team/:id — remove member. */
export const deleteSubscriberTeamMemberAPI = (id) => {
  if (!id) return Promise.reject(new Error("Member ID required"));
  return handleAPIRequest(
    (endpoint) => axiosInstance.delete(endpoint),
    subscriberPaths.teamMember(id),
    null
  );
};

/** GET /api/subscriber/permissions — catalog for toggles (optional endpoint). */
export const getSubscriberPermissionsCatalogAPI = () =>
  handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    subscriberPaths.permissionsCatalog,
    null
  );

/** GET /api/subscriber/members/:id/permissions — current member permissions (fallback: team/.../permissions). */
export const getSubscriberAdminPermissionsAPI = (id) => {
  if (!id) return Promise.reject(new Error("Member ID required"));
  return subscriberMemberPermissionsRequest(
    () =>
      handleAPIRequest(
        (endpoint) => axiosInstance.get(endpoint),
        subscriberPaths.memberPermissions(id),
        null
      ),
    () =>
      handleAPIRequest(
        (endpoint) => axiosInstance.get(endpoint),
        subscriberPaths.teamMemberPermissions(id),
        null
      )
  );
};

/** PUT /api/subscriber/members/:id/permissions — assign/update (fallback: team/.../permissions). */
export const putSubscriberAdminPermissionsAPI = (id, body) => {
  if (!id) return Promise.reject(new Error("Member ID required"));
  return subscriberMemberPermissionsRequest(
    () => handleAPIRequest(axiosInstance.put, subscriberPaths.memberPermissions(id), body),
    () => handleAPIRequest(axiosInstance.put, subscriberPaths.teamMemberPermissions(id), body)
  );
};
