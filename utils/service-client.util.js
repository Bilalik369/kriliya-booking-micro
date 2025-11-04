import axios from "axios";

export const serviceClient = {

  
  getItem: async (itemId) => {
    try {
      const response = await axios.get(
        `${process.env.ITEM_SERVICE_URL}/api/items/service/${itemId}`, 
        {
          headers: {
            Authorization: `Bearer ${process.env.SERVICE_TOKEN}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch item ${itemId}:`, error.message);
      throw new Error(`Item Service unavailable: ${error.message}`);
    }
  },

  getUser: async (userId) => {
    try {
      const response = await axios.get(
         `${process.env.AUTH_SERVICE_URL}/api/auth/service/users/${userId}`, 
        {
          headers: {
            Authorization: `Bearer ${process.env.SERVICE_TOKEN}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error.message);
      throw new Error(`Auth Service unavailable: ${error.message}`);
    }
  },



};
