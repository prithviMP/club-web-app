const userEndpoints = {
  getUsers: "/users",
  getUserById: (id) => `/users/${id}`,
  createUser: "/auth/local/register",
  updateUser: (id) => `/users/${id}`,
  deleteUser: (id) => `/users/${id}`,
  changePassword: "/auth/change-password",
  getUserWithOrderDetails: (id) => `/users/${id}?populate[order_details][populate][orderItems][populate][product][populate]=*`,
  getUserWithDesignRequests: (id) => `/users/${id}?populate[design_requests][populate]=*`,
  getUserProfile: (id) => `/users/${id}?populate[profile][populate]=*`,
  login: "/auth/local",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
};

export default userEndpoints; 