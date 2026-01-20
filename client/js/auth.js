function checkAuth() {
  const token = localStorage.getItem("club_token");
  const user = localStorage.getItem("club_user");
  if (!token || !user) {
    window.location.href = "login.html";
  }
  return JSON.parse(user);
}

function logout() {
  localStorage.removeItem("club_token");
  localStorage.removeItem("club_user");
  window.location.href = "login.html";
}

function getAuthHeaders() {
  const token = localStorage.getItem("club_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}
